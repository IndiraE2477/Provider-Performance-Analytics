using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    Task<UserDto> RegisterAsync(RegisterRequestDto request);
    Task<List<ProviderListItemDto>> GetActiveProvidersAsync();
}
