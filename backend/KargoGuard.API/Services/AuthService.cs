using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dapper;
using KargoGuard.API.Models;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using BC = BCrypt.Net.BCrypt;

namespace KargoGuard.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;

    public AuthService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var connStr = _config.GetConnectionString("DefaultConnection");
        await using var conn = new NpgsqlConnection(connStr);

        // dynamic kullanıyoruz — Dapper ValueTuple ile column name mapping yapmaz
        var user = await conn.QueryFirstOrDefaultAsync(
            new CommandDefinition(
                "SELECT username, password_hash, role FROM users WHERE username = @u",
                new { u = request.Username },
                cancellationToken: cancellationToken));

        if (user is null) return null;

        string storedHash = user.password_hash;
        string storedRole = user.role;
        string storedName = user.username;

        if (!BC.Verify(request.Password, storedHash))
            return null;

        var expiresAt = DateTime.UtcNow.AddHours(_config.GetValue<int>("Jwt:ExpiresInHours", 8));
        var token     = GenerateToken(storedName, storedRole, expiresAt);

        return new LoginResponse(token, storedRole, storedName, expiresAt);
    }

    private string GenerateToken(string username, string role, DateTime expiresAt)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             _config["Jwt:Issuer"],
            audience:           _config["Jwt:Audience"],
            claims:             claims,
            expires:            expiresAt,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
