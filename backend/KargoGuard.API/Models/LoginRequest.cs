namespace KargoGuard.API.Models;

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, string Role, string Username, DateTime ExpiresAt);
