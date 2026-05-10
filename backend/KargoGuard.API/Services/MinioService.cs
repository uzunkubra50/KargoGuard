using Minio;
using Minio.DataModel.Args;
using Microsoft.Extensions.Configuration;

namespace KargoGuard.API.Services;

public interface IMinioService
{
    Task<string> UploadImageAsync(IFormFile file, CancellationToken cancellationToken = default);
}

public class MinioService : IMinioService
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;
    private readonly ILogger<MinioService> _logger;

    public MinioService(IConfiguration configuration, ILogger<MinioService> logger)
    {
        _logger = logger;

        var endpoint  = configuration["MinIO:Endpoint"]  ?? "localhost:9000";
        var accessKey = configuration["MinIO:AccessKey"] ?? "kargo_admin";
        var secretKey = configuration["MinIO:SecretKey"] ?? "kargo_password";
        var withSsl   = bool.Parse(configuration["MinIO:WithSSL"] ?? "false");
        _bucketName   = configuration["MinIO:BucketName"] ?? "kargo-images";

        _minioClient = new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(accessKey, secretKey)
            .WithSSL(withSsl)
            .Build();
    }

    /// <summary>
    /// Gelen IFormFile dosyasını MinIO'daki belirtilen kovaya (bucket) yükler.
    /// Kova yoksa önce oluşturulur.
    /// </summary>
    /// <returns>Yüklenen nesnenin obje adı (object name)</returns>
    public async Task<string> UploadImageAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        // 1. Kova var mı kontrol et, yoksa oluştur
        await EnsureBucketExistsAsync(cancellationToken);

        // 2. Benzersiz dosya adı oluştur
        var extension  = Path.GetExtension(file.FileName);
        var objectName = $"{Guid.NewGuid()}{extension}";
        var contentType = file.ContentType;

        // 3. Stream'i MinIO'ya yükle
        using var stream = file.OpenReadStream();

        var putArgs = new PutObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(objectName)
            .WithStreamData(stream)
            .WithObjectSize(file.Length)
            .WithContentType(contentType);

        await _minioClient.PutObjectAsync(putArgs, cancellationToken);

        _logger.LogInformation(
            "Dosya başarıyla yüklendi. Bucket: {Bucket}, Object: {Object}",
            _bucketName, objectName);

        return objectName;
    }

    // ---------------------------------------------------------------
    // Kova yoksa oluşturan yardımcı metot
    // ---------------------------------------------------------------
    private async Task EnsureBucketExistsAsync(CancellationToken cancellationToken)
    {
        var existsArgs = new BucketExistsArgs().WithBucket(_bucketName);
        bool exists = await _minioClient.BucketExistsAsync(existsArgs, cancellationToken);

        if (!exists)
        {
            var makeArgs = new MakeBucketArgs().WithBucket(_bucketName);
            await _minioClient.MakeBucketAsync(makeArgs, cancellationToken);

            _logger.LogInformation("Kova oluşturuldu: {Bucket}", _bucketName);
        }
        else
        {
            _logger.LogDebug("Kova zaten mevcut: {Bucket}", _bucketName);
        }
    }
}
