namespace ProviderAnalytics.API.DTOs;

public record LoginRequestDto(string Email, string Password);

public record RegisterRequestDto(string Username, string Email, string FullName, string Password, string ConfirmPassword, int RoleId, int? ProviderId = null);

public record ProviderListItemDto(int Id, string Name, string Specialty);

public record LoginResponseDto(string Token, string Username, string FullName, string Role, int? ProviderId, DateTime Expiration);

public record UserDto(int Id, string Username, string Email, string FullName, string Role, bool IsActive, DateTime CreatedAt);
