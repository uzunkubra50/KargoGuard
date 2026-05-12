using KargoGuard.API.Models;
using KargoGuard.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using Npgsql;

namespace KargoGuard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CargoController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IMinioService _minioService;
    private readonly IRabbitMQPublisher _rabbitMQPublisher;
    private readonly ILogger<CargoController> _logger;
    private readonly IBlockchainService _blockchainService;

    private const string ImageProcessingQueue = "image_processing_queue";

    public CargoController(
        IConfiguration configuration,
        IMinioService minioService,
        IRabbitMQPublisher rabbitMQPublisher,
        IBlockchainService blockchainService,
        ILogger<CargoController> logger)
    {
        _configuration     = configuration;
        _minioService      = minioService;
        _rabbitMQPublisher = rabbitMQPublisher;
        _blockchainService = blockchainService;
        _logger            = logger;
    }

    /// <summary>
    /// Kargo görselini MinIO'ya yükler, ardından RabbitMQ kuyruğuna işlem mesajı gönderir.
    /// </summary>
    /// <param name="file">Yüklenecek görsel dosyası (multipart/form-data)</param>
    /// <param name="cancellationToken">İptal jetonu</param>
    /// <returns>200 OK — MinIO'daki dosya adı ve kuyruk durumu</returns>
    [Authorize(Roles = "admin")]
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        [FromForm(Name = "sarsinti_verisi")] string sarsintiVerisiStr = "0",
        [FromForm(Name = "is_fragile")] bool isFragile = false,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Geçerli bir dosya gönderilmedi." });

        // Türkçe/İngilizce ondalık ayracı uyuşmazlığını önlemek için InvariantCulture kullan
        // Örn: "1.15" veya "1,15" → her iki durumda da 1.15 olarak okunur
        if (!double.TryParse(sarsintiVerisiStr, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out double sarsintiVerisi))
        {
            sarsintiVerisi = 0.0;
        }

        _logger.LogInformation(
            "Dosya yükleme isteği alındı. Dosya adı: {FileName}, Boyut: {Size} bytes, Sarsıntı: {Sarsinti}G",
            file.FileName, file.Length, sarsintiVerisi);

        // 1. MinIO'ya yükle
        var objectName = await _minioService.UploadImageAsync(file, cancellationToken);

        // 2. RabbitMQ'ya işlem mesajı gönder
        var queueMessage = new
        {
            action = "upload",
            image_path = objectName,
            sarsinti_verisi = sarsintiVerisi,
            is_fragile = isFragile,
            status = "Pending"
        };

        await _rabbitMQPublisher.PublishAsync(ImageProcessingQueue, queueMessage, cancellationToken);

        _logger.LogInformation(
            "Kuyruk mesajı gönderildi. Kuyruk: {Queue}, ImagePath: {ObjectName}, Sarsıntı: {Sarsinti}G",
            ImageProcessingQueue, objectName, sarsintiVerisi);

        return Ok(new
        {
            message         = "Dosya başarıyla yüklendi ve işleme kuyruğuna eklendi.",
            objectName      = objectName,
            sarsinti_verisi = sarsintiVerisi,
            bucket          = "kargo-images",
            queue           = ImageProcessingQueue,
            queueStatus     = "Pending"
        });
    }

    /// <summary>
    /// Kargo teslimat anında fotoğraf çekerek AI onayından geçirir.
    /// </summary>
    [Authorize(Roles = "admin,kurye")]
    [HttpPost("confirm-delivery")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ConfirmDelivery(
        [FromForm] int cargoId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Teslimat fotoğrafı gönderilmedi." });

        if (cargoId <= 0)
            return BadRequest(new { message = "Geçerli bir Kargo ID belirtilmelidir." });

        _logger.LogInformation("Teslimat onay isteği alındı. CargoId: {CargoId}", cargoId);

        var objectName = await _minioService.UploadImageAsync(file, cancellationToken);

        var queueMessage = new
        {
            action = "delivery",
            cargo_id = cargoId,
            image_path = objectName,
            status = "PendingDeliveryScan"
        };

        await _rabbitMQPublisher.PublishAsync(ImageProcessingQueue, queueMessage, cancellationToken);

        return Ok(new
        {
            message = "Teslimat fotoğrafı yüklendi, yapay zeka analizine gönderildi.",
            cargoId = cargoId,
            objectName = objectName
        });
    }

    /// <summary>
    /// PostgreSQL veritabanından son 10 analizi listeler (En yeni en üstte).
    /// </summary>
    [Authorize]
    [HttpGet("results")]
    [ProducesResponseType(typeof(IEnumerable<CargoAnalysisResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetResults()
    {
        try
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            
            using var connection = new NpgsqlConnection(connectionString);
            
            var sql = @"
                SELECT 
                    id                      AS Id, 
                    status                  AS Status,
                    image_name              AS ImageName, 
                    sarsinti_verisi         AS SarsintiVerisi, 
                    ai_prediction_class     AS AiPredictionClass, 
                    ai_confidence           AS AiConfidence, 
                    final_decision          AS FinalDecision, 
                    processed_at            AS ProcessedAt,
                    delivery_photo_url      AS DeliveryPhotoUrl,
                    delivery_final_decision AS DeliveryFinalDecision,
                    delivery_processed_at   AS ""DeliveryProcessedAt"",
                    tx_hash                 AS ""TxHash"",
                    liability_note          AS ""LiabilityNote"",
                    delivery_ai_confidence  AS DeliveryAiConfidence,
                    delivery_ai_class       AS DeliveryAiClass,
                    is_fragile              AS IsFragile,
                    gemini_hasar_turu       AS GeminiHasarTuru,
                    gemini_siddet           AS GeminiSiddet,
                    gemini_aciklama         AS GeminiAciklama,
                    gemini_guven_skoru      AS GeminiGuvenSkoru,
                    bbox_json               AS BboxJson,
                    COALESCE(security_breach, false) AS SecurityBreach
                FROM cargo_analysis_results 
                ORDER BY processed_at DESC 
                LIMIT 10;
            ";

            var results = await connection.QueryAsync<CargoAnalysisResult>(sql);

            if (Request.Headers.Accept.Any(value => value?.Contains("text/html", StringComparison.OrdinalIgnoreCase) == true))
                return Content(RenderResultsHtml(results), "text/html; charset=utf-8");
            
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Veritabanından kargo analiz sonuçları çekilirken hata oluştu.");
            return StatusCode(500, new { message = "Sonuçlar listelenirken bir sunucu hatası meydana geldi." });
        }
    }

    private static string RenderResultsHtml(IEnumerable<CargoAnalysisResult> results)
    {
        static string H(string? value) => System.Net.WebUtility.HtmlEncode(value ?? "-");
        static string Pct(double? value) => value is null ? "-" : $"%{value.Value * 100:0.0}";
        static string Date(DateTime? value) => value is null ? "-" : value.Value.ToString("dd.MM.yyyy HH:mm");

        var rows = string.Join("", results.Select(item =>
        {
            var decisionClass = item.FinalDecision?.Contains("HASAR", StringComparison.OrdinalIgnoreCase) == true
                ? "bad"
                : "ok";

            return $"""
                <tr>
                    <td>#{item.Id}</td>
                    <td><span class="badge {decisionClass}">{H(item.FinalDecision)}</span></td>
                    <td>{H(item.Status)}</td>
                    <td>{item.SarsintiVerisi:0.##}G</td>
                    <td>{H(item.AiPredictionClass)}</td>
                    <td>{Pct(item.AiConfidence)}</td>
                    <td>{H(item.GeminiHasarTuru)}</td>
                    <td>{H(item.GeminiAciklama)}</td>
                    <td>{Date(item.ProcessedAt)}</td>
                    <td>{H(item.ImageName)}</td>
                </tr>
                """;
        }));

        return $$"""
            <!doctype html>
            <html lang="tr">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>KargoGuard Sonuçları</title>
                <style>
                    :root { color-scheme: light; }
                    body { margin: 0; font-family: Segoe UI, Arial, sans-serif; background: #f6f8fb; color: #172033; }
                    header { padding: 22px 28px; background: #fff; border-bottom: 1px solid #e5e9f0; position: sticky; top: 0; }
                    h1 { margin: 0; font-size: 22px; }
                    p { margin: 6px 0 0; color: #64748b; }
                    main { padding: 22px 28px; }
                    .panel { background: #fff; border: 1px solid #e5e9f0; border-radius: 8px; overflow: auto; box-shadow: 0 10px 30px rgba(15, 23, 42, .06); }
                    table { width: 100%; border-collapse: collapse; min-width: 980px; }
                    th, td { padding: 12px 14px; border-bottom: 1px solid #edf0f5; text-align: left; font-size: 13px; vertical-align: top; }
                    th { background: #f8fafc; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
                    tr:hover td { background: #f8fbff; }
                    .badge { display: inline-block; padding: 4px 9px; border-radius: 999px; font-weight: 700; font-size: 12px; }
                    .badge.ok { background: #dcfce7; color: #166534; }
                    .badge.bad { background: #fee2e2; color: #991b1b; }
                    .hint { margin-top: 14px; font-size: 12px; color: #64748b; }
                    code { background: #eef2f7; padding: 2px 5px; border-radius: 4px; }
                </style>
            </head>
            <body>
                <header>
                    <h1>KargoGuard Analiz Sonuçları</h1>
                    <p>PostgreSQL'den gelen son 10 kayıt okunabilir tablo halinde gösteriliyor.</p>
                </header>
                <main>
                    <div class="panel">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Karar</th>
                                    <th>Durum</th>
                                    <th>Sarsıntı</th>
                                    <th>AI Sınıfı</th>
                                    <th>Güven</th>
                                    <th>Gemini Tür</th>
                                    <th>Açıklama</th>
                                    <th>Tarih</th>
                                    <th>Görsel</th>
                                </tr>
                            </thead>
                            <tbody>{{rows}}</tbody>
                        </table>
                    </div>
                    <div class="hint">JSON çıktısı gerekiyorsa API istemcisinden <code>Accept: application/json</code> ile çağır.</div>
                </main>
            </body>
            </html>
            """;
    }

    [Authorize(Roles = "admin")]
    [HttpGet("debug/{cargoId}")]
    public async Task<IActionResult> DebugRow(int cargoId)
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        using var cmd = new NpgsqlCommand("SELECT delivery_final_decision, delivery_ai_confidence, delivery_ai_class FROM cargo_analysis_results WHERE id = @Id", connection);
        cmd.Parameters.AddWithValue("Id", cargoId);
        using var r = await cmd.ExecuteReaderAsync();
        if (await r.ReadAsync())
        {
            return Ok(new {
                Dec = r.IsDBNull(0) ? null : r.GetString(0),
                Conf = r.IsDBNull(1) ? null : (double?)r.GetDouble(1),
                Class = r.IsDBNull(2) ? null : r.GetString(2)
            });
        }
        return NotFound();
    }

    /// <summary>
    /// Müşteri kargo detayına tıkladığında çağrılır.
    /// Artık hiçbir AI çağrısı yapmaz — consumer.py zaten analiz etti ve DB'ye yazdı.
    /// Sadece DB'deki mevcut sonucu döndürür.
    /// </summary>
    [Authorize]
    [HttpGet("analyze-inner/{cargoId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AnalyzeInnerPhoto(int cargoId)
    {
        try
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new NpgsqlConnection(connectionString);

            // DB'den mevcut sonucu al — AI tekrar çağrılmaz
            var dbCargo = await connection.QueryFirstOrDefaultAsync<dynamic>(@"
                SELECT delivery_photo_url,
                       delivery_final_decision,
                       delivery_ai_confidence,
                       delivery_ai_class
                FROM cargo_analysis_results
                WHERE id = @Id", new { Id = cargoId });

            // Fotoğraf henüz yüklenmemişse 404 dön
            if (dbCargo == null || string.IsNullOrWhiteSpace((string)dbCargo.delivery_photo_url))
                return NotFound(new { message = "Bu kargo için teslimat fotoğrafı henüz yüklenmedi." });

            var photoUrl = (string)dbCargo.delivery_photo_url;
            var finalDec = dbCargo.delivery_final_decision as string;

            // Karar var mı? (consumer.py veya customer-upload yazmış olabilir)
            bool isDamaged  = !string.IsNullOrWhiteSpace(finalDec) && finalDec.ToUpperInvariant().Contains("HASAR");
            double conf     = dbCargo.delivery_ai_confidence != null ? Convert.ToDouble(dbCargo.delivery_ai_confidence) : 0.0;
            string predCls  = (dbCargo.delivery_ai_class as string) ?? "bilinmiyor";

            return Ok(new
            {
                isDamaged,
                confidence      = conf,
                predictionClass = predCls,
                noPredictions   = string.IsNullOrWhiteSpace(predCls) || predCls == "tespit_edilemedi",
                photoUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "analyze-inner DB okuma hatası.");
            return StatusCode(500, new { message = "Sunucu hatası", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("customer-upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CustomerUpload(
        [FromForm] string cargo_ref_id,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        // 1. Validasyon
        if (string.IsNullOrWhiteSpace(cargo_ref_id))
            return BadRequest(new { message = "Kargo numarası boş olamaz." });

        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Lütfen hasarlı ürünün fotoğrafını ekleyin." });

        try
        {
            // 2. Fotoğrafı MinIO'ya Yükle (Dashboard'da görülebilmesi için)
            var objectName = await _minioService.UploadImageAsync(file, cancellationToken);

            // 3. Fotoğrafı Base64'e çevir (Gemini için)
            using var ms = new System.IO.MemoryStream();
            file.OpenReadStream().CopyTo(ms);
            var imageBase64 = Convert.ToBase64String(ms.ToArray());
            var mimeType    = file.ContentType ?? "image/jpeg";

            // 4. Gemini API Key
            var geminiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(geminiKey) || geminiKey.Contains("BURAYA"))
            {
                _logger.LogWarning("Gemini API Key yapılandırılmamış. appsettings.json dosyasını kontrol edin.");
                return StatusCode(503, new { message = "AI servisi henüz yapılandırılmamış. Lütfen Gemini API Key'ini appsettings.json'a ekleyin." });
            }

            var geminiModel = _configuration["Gemini:Model"] ?? "gemini-2.0-flash";
            var geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{geminiModel}:generateContent?key={geminiKey}";

            // 5. Gemini'ya gönderilecek JSON paketi
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = "Sen bir kargo hasar uzmanısın. Fotoğraftaki üründe kırık, çatlak, ezilme veya herhangi bir fiziksel hasar var mı? DİKKAT: Gönderilen fotoğraflar taşıma sırasında hasar görmüş eşyaları içerir. Görseldeki nesne parçalanmış, kırılmış veya bütünlüğü bozulmuşsa KESİNLİKLE 'HASARLI' demelisin. Lütfen sadece şu iki formattan birini kullan: 'HASARLI - %X' veya 'SAĞLAM - %X'. Burada X, tahmininin yüzde olarak güven skorudur. Başka hiçbir şey yazma." },
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = mimeType,
                                    data      = imageBase64
                                }
                            }
                        }
                    }
                }
            };

            var jsonBody  = System.Text.Json.JsonSerializer.Serialize(requestBody);
            
            // 6. Gemini'ye istek at (3 Kez Tekrar Deneme Mekanizması)
            using var httpClient = new System.Net.Http.HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            _logger.LogInformation("Gemini API'ye müşteri hasar analizi isteği gönderiliyor. Kargo Ref: {CargoRef}", cargo_ref_id);

            System.Net.Http.HttpResponseMessage geminiResponse = null;
            string geminiRaw = "";
            bool success = false;

            for (int i = 0; i < 3; i++)
            {
                var reqContent = new System.Net.Http.StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");
                geminiResponse = await httpClient.PostAsync(geminiUrl, reqContent, cancellationToken);
                geminiRaw      = await geminiResponse.Content.ReadAsStringAsync(cancellationToken);

                if (geminiResponse.IsSuccessStatusCode)
                {
                    success = true;
                    break;
                }

                _logger.LogWarning("Gemini API başarısız oldu (Deneme {Retry}). Status: {Status}, Body: {Body}", i + 1, geminiResponse.StatusCode, geminiRaw);
                
                if (geminiResponse.StatusCode != System.Net.HttpStatusCode.ServiceUnavailable && 
                    geminiResponse.StatusCode != System.Net.HttpStatusCode.TooManyRequests)
                {
                    break; // Eğer 503 veya 429 dışı (örneğin 400) bir hataysa boşuna tekrar etme
                }

                await Task.Delay(4000, cancellationToken); // 4 saniye bekle tekrar dene
            }

            if (!success)
            {
                if (int.TryParse(cargo_ref_id, out int parsedFallbackId))
                {
                    var connectionString = _configuration.GetConnectionString("DefaultConnection");
                    using var connection = new NpgsqlConnection(connectionString);

                    // --- NEW WEB3 CODE FOR FALLBACK ---
                    try
                    {
                        var newStatus = "Manuel İnceleme (API Hatası)";
                        var txHash = await _blockchainService.RecordDeliveryToBlockchainAsync(parsedFallbackId, newStatus, objectName);
                        
                        await connection.ExecuteAsync(
                            "UPDATE cargo_analysis_results SET delivery_photo_url = @Photo, delivery_ai_confidence = @Conf, delivery_ai_class = @Class, delivery_final_decision = @Dec, delivery_processed_at = CURRENT_TIMESTAMP, tx_hash = @TxHash, status = @Status WHERE id = @Id",
                            new
                            {
                                Photo = objectName,
                                Conf = 0.0,
                                Class = "gemini_unavailable",
                                Dec = "MANUEL_INCELEME",
                                TxHash = txHash,
                                Status = newStatus,
                                Id = parsedFallbackId
                            });
                    }
                    catch (Exception web3Ex)
                    {
                        _logger.LogError(web3Ex, "Manuel inceleme durumu için Web3 senkronizasyonu başarısız.");
                        
                        await connection.ExecuteAsync(
                            "UPDATE cargo_analysis_results SET delivery_photo_url = @Photo, delivery_ai_confidence = @Conf, delivery_ai_class = @Class, delivery_final_decision = @Dec, delivery_processed_at = CURRENT_TIMESTAMP WHERE id = @Id",
                            new
                            {
                                Photo = objectName,
                                Conf = 0.0,
                                Class = "gemini_unavailable",
                                Dec = "MANUEL_INCELEME",
                                Id = parsedFallbackId
                            });
                    }
                }

                return Ok(new
                {
                    cargo_id = cargo_ref_id,
                    status = "manual_review",
                    ai_analysis = "Gemini servisi yanit vermedi veya kota limiti doldu.",
                    content_analysis = new
                    {
                        is_damaged = false,
                        ai_confidence_score = 0.0,
                        message = "Gemini analizi tamamlanamadi. Fotograf kaydedildi; manuel inceleme gerekiyor."
                    }
                });
            }

            // 7. Gemini yanıtını parse et → candidates[0].content.parts[0].text
            using var doc  = System.Text.Json.JsonDocument.Parse(geminiRaw);
            var aiText     = doc.RootElement
                               .GetProperty("candidates")[0]
                               .GetProperty("content")
                               .GetProperty("parts")[0]
                               .GetProperty("text")
                               .GetString() ?? "";

            _logger.LogInformation("Gemini Yanıtı: {AiText}", aiText);

            // 8. "HASARLI - %85" veya "SAĞLAM - %92" metnini ayıkla
            var aiTextUpper  = aiText.Trim().ToUpperInvariant();
            bool isDamaged   = aiTextUpper.Contains("HASARLI") || aiTextUpper.Contains("KIRIK") || aiTextUpper.Contains("ÇATLAK");

            // Yüzde skorunu ayıkla (örn: "HASARLI - %87.5" → 0.875)
            double confidence = 0.0;
            var pctMatch = System.Text.RegularExpressions.Regex.Match(aiText, @"%(\d+(?:[.,]\d+)?)");
            if (pctMatch.Success && double.TryParse(
                pctMatch.Groups[1].Value.Replace(',', '.'),
                System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture,
                out double pctVal))
            {
                confidence = pctVal / 100.0; // 87.5 → 0.875
            }

            _logger.LogInformation("Karar: {Decision}, Güven: {Conf}", isDamaged ? "HASARLI" : "SAĞLAM", confidence);

            // 9. Sonucu Veritabanına Yaz (Dashboard'da görünsün)
            if (int.TryParse(cargo_ref_id, out int parsedId))
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                using var connection = new NpgsqlConnection(connectionString);
                var classStr = isDamaged ? "ic_hasar" : "saglamli";
                var decStr   = isDamaged ? "HASARLI"  : "SAĞLAM";
                
                await connection.ExecuteAsync(
                    "UPDATE cargo_analysis_results SET delivery_photo_url = @Photo, delivery_ai_confidence = @Conf, delivery_ai_class = @Class, delivery_final_decision = @Dec, delivery_processed_at = CURRENT_TIMESTAMP WHERE id = @Id",
                    new { Photo = objectName, Conf = confidence, Class = classStr, Dec = decStr, Id = parsedId }
                );

                // --- NEW WEB3 CODE ---
                try
                {
                    var newStatus = isDamaged ? "Hasarlı Teslimat (Müşteri Bildirimi)" : "Sorunsuz Teslim (Müşteri Onayı)";
                    var liabilityNote = isDamaged ? "İçerikte hasar tespit edildi. Yetersiz paketleme veya dış darbe kaynaklı olabilir." : "Tüm YZ testleri başarılı. Sorunsuz teslimat.";
                    
                    var txHash = await _blockchainService.RecordDeliveryToBlockchainAsync(parsedId, newStatus, objectName);
                    
                    await connection.ExecuteAsync(
                        "UPDATE cargo_analysis_results SET tx_hash = @TxHash, status = @Status, liability_note = @Note WHERE id = @Id",
                        new { TxHash = txHash, Status = newStatus, Note = liabilityNote, Id = parsedId }
                    );
                }
                catch (Exception web3Ex)
                {
                    _logger.LogError(web3Ex, "Müşteri hasar kaydı için Web3 Blockchain entegrasyonu başarısız.");
                }
                // ---------------------
            }

            return Ok(new
            {
                cargo_id    = cargo_ref_id,
                status      = "customer_analyzed",
                ai_analysis = aiText,
                content_analysis = new
                {
                    is_damaged          = isDamaged,
                    ai_confidence_score = confidence,
                    message             = isDamaged
                        ? "Gemini AI: İçerikte hasar tespit edildi. (" + (pctMatch.Success ? $"%{(confidence * 100):F0} güven" : "belirsiz") + ")"
                        : "Gemini AI: İçerik sağlam görünüyor. ("    + (pctMatch.Success ? $"%{(confidence * 100):F0} güven" : "belirsiz") + ")"
                }
            });

        }
        catch (System.Text.Json.JsonException jex)
        {
            _logger.LogError(jex, "Gemini API yanıtı parse edilemedi.");
            return StatusCode(502, new { message = "AI yanıtı işlenemedi. Lütfen tekrar deneyin." });
        }
        catch (System.Net.Http.HttpRequestException hex)
        {
            _logger.LogError(hex, "Gemini API'ye bağlanılamadı.");
            return StatusCode(503, new { message = "AI servisine bağlantı kurulamadı. İnternet bağlantınızı kontrol edin." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CustomerUpload beklenmeyen hata.");
            return StatusCode(500, new { message = "Sunucu hatası", error = ex.Message });
        }
    }

// CustomerUpload için artık ayrı bir model sınıfı gerekmez (FromForm parametreler direkt alınıyor)
// Eski CustomerUploadRequest sınıfı yedeğe alındı:
// public class CustomerUploadRequest { public string cargo_ref_id; public IFormFile file; }

    /// <summary>
    /// Python AI tarafından karar verildikten sonra çağrılan Webhook. Blockchain'e yazar.
    /// </summary>
    [HttpPost("blockchain-sync")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> BlockchainSync([FromBody] BlockchainSyncRequest request)
    {
        try
        {
            if(request == null || request.CargoId <= 0)
                return BadRequest(new { message = "Geçersiz webhook verisi." });

            _logger.LogInformation("Webhook alındı. Kargo ID: {CargoId} için blokzincir kaydı başlatılıyor.", request.CargoId);
            
            var txHash = await _blockchainService.RecordDeliveryToBlockchainAsync(request.CargoId, request.Status, request.PhotoHash);
            
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new NpgsqlConnection(connectionString);
            var sql = "UPDATE cargo_analysis_results SET tx_hash = @TxHash WHERE id = @Id";
            await connection.ExecuteAsync(sql, new { TxHash = txHash, Id = request.CargoId });

            return Ok(new { message = "Blokzincir kaydı başarılı", txHash = txHash });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook üzerinden blokzincire kayıt yapılamadı.");
            return StatusCode(500, new { message = "Blokzincir hatası", error = ex.Message });
        }
    }
}
