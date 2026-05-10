using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace KargoGuard.API.Services;

public interface IRabbitMQPublisher
{
    Task PublishAsync(string queueName, object message, CancellationToken cancellationToken = default);
    Task PublishAsync(string queueName, string message, CancellationToken cancellationToken = default);
}

public class RabbitMQPublisher : IRabbitMQPublisher, IAsyncDisposable
{
    private readonly ILogger<RabbitMQPublisher> _logger;
    private readonly IConfiguration _configuration;
    private IConnection? _connection;
    private IChannel? _channel;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public RabbitMQPublisher(IConfiguration configuration, ILogger<RabbitMQPublisher> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    // ---------------------------------------------------------------
    // Nesne → JSON'a çevirip yayınla
    // ---------------------------------------------------------------
    public async Task PublishAsync(string queueName, object message, CancellationToken cancellationToken = default)
    {
        var json = JsonSerializer.Serialize(message, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });

        await PublishAsync(queueName, json, cancellationToken);
    }

    // ---------------------------------------------------------------
    // Ham string mesajı yayınla
    // ---------------------------------------------------------------
    public async Task PublishAsync(string queueName, string message, CancellationToken cancellationToken = default)
    {
        var channel = await GetChannelAsync(cancellationToken);

        // Kuyruk yoksa oluştur (durable: sunucu yeniden başlasa bile kalıcı)
        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        var body = Encoding.UTF8.GetBytes(message);

        var properties = new BasicProperties
        {
            Persistent = true,          // Mesaj durable kuyruğa kalıcı yazılsın
            ContentType = "application/json"
        };

        await channel.BasicPublishAsync(
            exchange: string.Empty,     // Varsayılan exchange
            routingKey: queueName,
            mandatory: false,
            basicProperties: properties,
            body: body,
            cancellationToken: cancellationToken);

        _logger.LogInformation(
            "RabbitMQ mesajı yayınlandı. Kuyruk: {Queue}, Mesaj: {Message}",
            queueName, message);
    }

    // ---------------------------------------------------------------
    // Bağlantı / kanal yönetimi (lazy + thread-safe)
    // ---------------------------------------------------------------
    private async Task<IChannel> GetChannelAsync(CancellationToken cancellationToken)
    {
        if (_channel is { IsOpen: true })
            return _channel;

        await _lock.WaitAsync(cancellationToken);
        try
        {
            if (_channel is { IsOpen: true })
                return _channel;

            var factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMQ:Host"] ?? "localhost",
                Port = int.TryParse(_configuration["RabbitMQ:Port"], out var port) ? port : 5672,
                UserName = _configuration["RabbitMQ:Username"] ?? "kargo_admin",
                Password = _configuration["RabbitMQ:Password"] ?? "kargo_password"
            };

            _connection = await factory.CreateConnectionAsync(cancellationToken);
            _channel    = await _connection.CreateChannelAsync(cancellationToken: cancellationToken);

            _logger.LogInformation("RabbitMQ bağlantısı kuruldu. Host: localhost:5672");

            return _channel;
        }
        finally
        {
            _lock.Release();
        }
    }

    // ---------------------------------------------------------------
    // Kaynakları temizle
    // ---------------------------------------------------------------
    public async ValueTask DisposeAsync()
    {
        if (_channel is not null)
        {
            await _channel.CloseAsync();
            _channel.Dispose();
        }

        if (_connection is not null)
        {
            await _connection.CloseAsync();
            _connection.Dispose();
        }

        _lock.Dispose();
    }
}
