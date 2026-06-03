namespace ProviderAnalytics.API.DTOs;

public record UserListDto(
    int Id,
    string Username,
    string Email,
    string FullName,
    string Role,
    int RoleId,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLogin
);

public record CreateUserDto(
    string Username,
    string Email,
    string FullName,
    string Password,
    int RoleId
);

public record UpdateUserDto(
    string FullName,
    string Email,
    int RoleId,
    bool IsActive
);

public record ProfileDto(
    int Id,
    string Username,
    string Email,
    string FullName,
    string Role,
    DateTime CreatedAt,
    DateTime? LastLogin
);

public record UpdateProfileDto(
    string FullName,
    string Email
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword
);
