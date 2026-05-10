using Dapper;
using Npgsql;

namespace KargoGuard.API.Services;

public interface IDatabaseInitializer
{
    Task InitializeAsync(CancellationToken cancellationToken = default);
}

public class DatabaseInitializer : IDatabaseInitializer
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<DatabaseInitializer> _logger;

    public DatabaseInitializer(IConfiguration configuration, ILogger<DatabaseInitializer> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("DefaultConnection connection string is missing.");

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        await connection.ExecuteAsync(new CommandDefinition("""
            CREATE TABLE IF NOT EXISTS cargo_analysis_results (
                id                      SERIAL PRIMARY KEY,
                image_name              TEXT NOT NULL,
                sarsinti_verisi         FLOAT NOT NULL,
                ai_prediction_class     TEXT,
                ai_confidence           FLOAT,
                final_decision          TEXT NOT NULL,
                processed_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status                  TEXT DEFAULT 'Yolda',
                delivery_photo_url      TEXT,
                delivery_final_decision TEXT,
                delivery_processed_at   TIMESTAMP,
                tx_hash                 TEXT,
                liability_note          TEXT,
                delivery_ai_confidence  FLOAT,
                delivery_ai_class       TEXT,
                is_fragile              BOOLEAN DEFAULT false,
                gemini_hasar_turu       TEXT,
                gemini_siddet           TEXT,
                gemini_aciklama         TEXT,
                gemini_guven_skoru      FLOAT,
                bbox_json               TEXT,
                security_breach         BOOLEAN DEFAULT false
            );
            """, cancellationToken: cancellationToken));

        var columns = new Dictionary<string, string>
        {
            ["status"] = "TEXT DEFAULT 'Yolda'",
            ["delivery_photo_url"] = "TEXT",
            ["delivery_final_decision"] = "TEXT",
            ["delivery_processed_at"] = "TIMESTAMP",
            ["tx_hash"] = "TEXT",
            ["liability_note"] = "TEXT",
            ["delivery_ai_confidence"] = "FLOAT",
            ["delivery_ai_class"] = "TEXT",
            ["is_fragile"] = "BOOLEAN DEFAULT false",
            ["gemini_hasar_turu"] = "TEXT",
            ["gemini_siddet"] = "TEXT",
            ["gemini_aciklama"] = "TEXT",
            ["gemini_guven_skoru"] = "FLOAT",
            ["bbox_json"] = "TEXT",
            ["security_breach"] = "BOOLEAN DEFAULT false"
        };

        foreach (var (name, type) in columns)
        {
            await connection.ExecuteAsync(new CommandDefinition(
                $"ALTER TABLE cargo_analysis_results ADD COLUMN IF NOT EXISTS {name} {type};",
                cancellationToken: cancellationToken));
        }

        _logger.LogInformation("PostgreSQL schema is ready.");
    }
}
