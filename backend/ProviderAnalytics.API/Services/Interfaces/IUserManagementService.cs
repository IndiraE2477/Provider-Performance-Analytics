using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IUserManagementService
{
    Task<IEnumerable<UserListDto>> GetAllUsersAsync();
    Task<UserListDto?> GetUserByIdAsync(int id);
    Task<UserListDto> CreateUserAsync(CreateUserDto dto);
    Task<UserListDto?> UpdateUserAsync(int id, UpdateUserDto dto);
    Task<ProfileDto?> GetProfileAsync(int userId);
    Task<ProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
}
