using StackExchange.Redis;

namespace KargoGuard.API.Services;

public interface ITokenBlacklistService
{
    Task BlacklistAsync(string jti, TimeSpan ttl);
    Task<bool> IsBlacklistedAsync(string jti);
}

public class TokenBlacklistService : ITokenBlacklistService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<TokenBlacklistService> _logger;

    public TokenBlacklistService(IConnectionMultiplexer redis, ILogger<TokenBlacklistService> logger)
    {
        _redis  = redis;
        _logger = logger;
    }

    public async Task BlacklistAsync(string jti, TimeSpan ttl)
    {
        try
        {
            var db = _redis.GetDatabase();
            await db.StringSetAsync($"blacklist:{jti}", "1", ttl);
        }
        catch (RedisConnectionException ex)
        {
            _logger.LogError(ex, "Redis bağlantı hatası — token blacklist yazılamadı. JTI: {Jti}", jti);
        }
    }

    public async Task<bool> IsBlacklistedAsync(string jti)
    {
        try
        {
            var db = _redis.GetDatabase();
            return await db.KeyExistsAsync($"blacklist:{jti}");
        }
        catch (RedisConnectionException ex)
        {
            // Redis down ise fail-open: isteği reddetme, sadece logla
            _logger.LogWarning(ex, "Redis bağlantı hatası — blacklist kontrol atlandı. JTI: {Jti}", jti);
            return false;
        }
    }
}
