using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Services;

public class UserManagementService : IUserManagementService
{
    private readonly IUserRepository _userRepository;
    private readonly ApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public UserManagementService(
        IUserRepository userRepository,
        ApplicationDbContext context,
        IAuditService auditService)
    {
        _userRepository = userRepository;
        _context = context;
        _auditService = auditService;
    }

    public async Task<IEnumerable<UserListDto>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return users.Select(MapToUserListDto);
    }

    public async Task<UserListDto?> GetUserByIdAsync(int id)
    {
        var user = await _userRepository.GetWithRoleAsync(id);
        return user == null ? null : MapToUserListDto(user);
    }

    public async Task<UserListDto> CreateUserAsync(CreateUserDto dto)
    {
        if (await _userRepository.ExistsAsync(u => u.Username == dto.Username))
            throw new InvalidOperationException("Username is already taken");

        if (await _userRepository.ExistsAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email is already registered");

        var role = await _context.Roles.FindAsync(dto.RoleId)
            ?? throw new InvalidOperationException("Invalid role");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = dto.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        user = (await _userRepository.GetWithRoleAsync(user.Id))!;

        await _auditService.LogAsync("User", user.Id, "Create", null,
            $"Username: {user.Username}, Role: {user.Role.Name}", "Admin");

        return MapToUserListDto(user);
    }

    public async Task<UserListDto?> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetWithRoleAsync(id);
        if (user == null) return null;

        var oldValues = $"FullName: {user.FullName}, Email: {user.Email}, RoleId: {user.RoleId}, IsActive: {user.IsActive}";

        if (dto.Email != user.Email && await _userRepository.ExistsAsync(u => u.Email == dto.Email && u.Id != id))
            throw new InvalidOperationException("Email is already registered");

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.RoleId = dto.RoleId;
        user.IsActive = dto.IsActive;

        await _userRepository.UpdateAsync(user);

        user = (await _userRepository.GetWithRoleAsync(user.Id))!;

        var newValues = $"FullName: {user.FullName}, Email: {user.Email}, RoleId: {user.RoleId}, IsActive: {user.IsActive}";
        await _auditService.LogAsync("User", user.Id, "Update", oldValues, newValues, "Admin");

        return MapToUserListDto(user);
    }

    public async Task<ProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _userRepository.GetWithRoleAsync(userId);
        if (user == null) return null;

        return new ProfileDto(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.Role.Name,
            user.CreatedAt,
            user.LastLogin
        );
    }

    public async Task<ProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _userRepository.GetWithRoleAsync(userId);
        if (user == null) return null;

        if (dto.Email != user.Email && await _userRepository.ExistsAsync(u => u.Email == dto.Email && u.Id != userId))
            throw new InvalidOperationException("Email is already registered");

        user.FullName = dto.FullName;
        user.Email = dto.Email;

        await _userRepository.UpdateAsync(user);

        user = (await _userRepository.GetWithRoleAsync(user.Id))!;

        return new ProfileDto(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.Role.Name,
            user.CreatedAt,
            user.LastLogin
        );
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Current password is incorrect");

        if (dto.NewPassword != dto.ConfirmNewPassword)
            throw new InvalidOperationException("New passwords do not match");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _userRepository.UpdateAsync(user);

        return true;
    }

    private static UserListDto MapToUserListDto(User user) => new(
        user.Id,
        user.Username,
        user.Email,
        user.FullName,
        user.Role.Name,
        user.RoleId,
        user.IsActive,
        user.CreatedAt,
        user.LastLogin
    );
}
