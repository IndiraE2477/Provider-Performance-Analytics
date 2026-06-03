using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByUsernameAsync(request.Username);
        if (user == null)
        {
            _logger.LogWarning("Login attempt failed: User {Username} not found", request.Username);
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login attempt failed: Invalid password for user {Username}", request.Username);
            return null;
        }

        user.LastLogin = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        var token = GenerateJwtToken(user);
        var expiration = DateTime.UtcNow.AddHours(
            double.Parse(_configuration["Jwt:ExpirationHours"] ?? "8"));

        _logger.LogInformation("User {Username} logged in successfully", request.Username);

        return new LoginResponseDto(
            Token: token,
            Username: user.Username,
            FullName: user.FullName,
            Role: user.Role.Name,
            ProviderId: user.ProviderId,
            Expiration: expiration
        );
    }

    private string GenerateJwtToken(Entities.User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.GivenName, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.Name)
        };

        if (user.ProviderId.HasValue)
            claims.Add(new Claim("ProviderId", user.ProviderId.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(
                double.Parse(_configuration["Jwt:ExpirationHours"] ?? "8")),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<UserDto> RegisterAsync(RegisterRequestDto request)
    {
        // Check if username already exists
        if (await _userRepository.ExistsAsync(u => u.Username == request.Username))
            throw new InvalidOperationException("Username is already taken");

        // Check if email already exists
        if (await _userRepository.ExistsAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("Email is already registered");

        var role = await _context.Roles.FindAsync(request.RoleId)
            ?? throw new InvalidOperationException("Invalid role selected");

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = role.Id,
            ProviderId = role.Name == "Viewer" ? request.ProviderId : null,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        _logger.LogInformation("New user registered: {Username} with role {Role}", user.Username, role.Name);

        return new UserDto(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            role.Name,
            user.IsActive,
            user.CreatedAt
        );
    }

    public async Task<List<ProviderListItemDto>> GetActiveProvidersAsync()
    {
        return await _context.Providers
            .Where(p => p.Status == "Active")
            .OrderBy(p => p.Name)
            .Select(p => new ProviderListItemDto(p.Id, p.Name, p.Specialty))
            .ToListAsync();
    }
}
