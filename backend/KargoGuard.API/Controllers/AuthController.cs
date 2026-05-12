using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KargoGuard.API.Models;
using KargoGuard.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace KargoGuard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, IConfiguration config, ILogger<AuthController> logger)
    {
        _authService = authService;
        _config      = config;
        _logger      = logger;
    }

    /// <summary>
    /// Kullanıcı adı ve şifre ile giriş yapar, JWT token döner.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Kullanıcı adı ve şifre zorunludur." });

        var result = await _authService.LoginAsync(request, cancellationToken);

        if (result is null)
        {
            _logger.LogWarning("Başarısız giriş denemesi. Kullanıcı: {Username}", request.Username);
            return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });
        }

        _logger.LogInformation("Başarılı giriş. Kullanıcı: {Username}, Rol: {Role}", result.Username, result.Role);
        return Ok(result);
    }

    /// <summary>
    /// Müşteri kargo takibi için hesap gerektirmeyen JWT üretir.
    /// </summary>
    [HttpPost("tracking-access")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult TrackingAccess([FromBody] TrackingAccessRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TrackCode))
            return BadRequest(new { message = "Takip kodu boş olamaz." });

        var expiresAt = DateTime.UtcNow.AddHours(2);
        var key       = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds     = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer:             _config["Jwt:Issuer"],
            audience:           _config["Jwt:Audience"],
            claims:
            [
                new Claim(JwtRegisteredClaimNames.Sub, request.TrackCode),
                new Claim(ClaimTypes.Name, request.TrackCode),
                new Claim(ClaimTypes.Role, "musteri"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            ],
            expires:            expiresAt,
            signingCredentials: creds);

        var tokenStr = new JwtSecurityTokenHandler().WriteToken(token);
        return Ok(new LoginResponse(tokenStr, "musteri", request.TrackCode, expiresAt));
    }
}

public record TrackingAccessRequest(string TrackCode, string? Phone);
