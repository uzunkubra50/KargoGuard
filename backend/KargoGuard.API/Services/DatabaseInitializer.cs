using Dapper;
using Npgsql;
using BC = BCrypt.Net.BCrypt;

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
            CREATE TABLE IF NOT EXISTS companies (
                id         SERIAL PRIMARY KEY,
                name       TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """, cancellationToken: cancellationToken));

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
            ["security_breach"] = "BOOLEAN DEFAULT false",
            ["company_id"]      = "INT REFERENCES companies(id)"
        };

        foreach (var (name, type) in columns)
        {
            await connection.ExecuteAsync(new CommandDefinition(
                $"ALTER TABLE cargo_analysis_results ADD COLUMN IF NOT EXISTS {name} {type};",
                cancellationToken: cancellationToken));
        }

        await connection.ExecuteAsync(new CommandDefinition("""
            CREATE TABLE IF NOT EXISTS users (
                id            SERIAL PRIMARY KEY,
                username      TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role          TEXT NOT NULL,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """, cancellationToken: cancellationToken));

        await connection.ExecuteAsync(new CommandDefinition(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id);",
            cancellationToken: cancellationToken));

        // Şirketleri önce seed'le — FK update'lerinden önce kayıtların olması gerekiyor
        await SeedCompaniesAsync(connection, cancellationToken);

        // Mevcut kayıtları varsayılan şirkete ata
        await connection.ExecuteAsync(new CommandDefinition(
            "UPDATE cargo_analysis_results SET company_id = 1 WHERE company_id IS NULL;",
            cancellationToken: cancellationToken));

        await SeedUsersAsync(connection, cancellationToken);

        _logger.LogInformation("PostgreSQL schema is ready.");
    }

    private static async Task SeedCompaniesAsync(NpgsqlConnection connection, CancellationToken cancellationToken)
    {
        await connection.ExecuteAsync(new CommandDefinition("""
            INSERT INTO companies (id, name) VALUES
                (1, 'KargoGuard Demo A.Ş.'),
                (2, 'Test Lojistik Ltd.')
            ON CONFLICT DO NOTHING;
            """, cancellationToken: cancellationToken));
    }

    private static async Task SeedUsersAsync(NpgsqlConnection connection, CancellationToken cancellationToken)
    {
        var seeds = new[]
        {
            ("admin@kargoguard.com", "admin123", "admin", 1),
            ("KRY-00142",           "kurye123", "kurye", 1),
            ("KRY-00215",           "kurye123", "kurye", 1),
        };

        foreach (var (username, password, role, companyId) in seeds)
        {
            var hash = BC.HashPassword(password);
            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO users (username, password_hash, role, company_id)
                    VALUES (@u, @h, @r, @c)
                    ON CONFLICT (username) DO UPDATE SET password_hash = @h, role = @r, company_id = @c
                    """,
                    new { u = username, h = hash, r = role, c = companyId },
                    cancellationToken: cancellationToken));
        }
    }
}
