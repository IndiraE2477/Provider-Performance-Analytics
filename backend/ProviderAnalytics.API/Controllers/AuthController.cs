using Asp.Versioning;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<LoginRequestDto> _loginValidator;
    private readonly IValidator<RegisterRequestDto> _registerValidator;

    public AuthController(
        IAuthService authService,
        IValidator<LoginRequestDto> loginValidator,
        IValidator<RegisterRequestDto> registerValidator)
    {
        _authService = authService;
        _loginValidator = loginValidator;
        _registerValidator = registerValidator;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    [ProducesResponseType(typeof(ApiErrorResponse), 401)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var validationResult = await _loginValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ApiErrorResponse(
                false, "Validation failed",
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var result = await _authService.LoginAsync(request);
        if (result == null)
            return Unauthorized(new ApiErrorResponse(false, "Invalid credentials"));

        return Ok(new ApiResponse<LoginResponseDto>(true, "Login successful", result));
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 201)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var validationResult = await _registerValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ApiErrorResponse(
                false, "Validation failed",
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var result = await _authService.RegisterAsync(request);
        return Created(string.Empty,
            new ApiResponse<UserDto>(true, "Registration successful", result));
    }

    [HttpGet("providers")]
    [ProducesResponseType(typeof(ApiResponse<List<ProviderListItemDto>>), 200)]
    public async Task<IActionResult> GetProvidersList()
    {
        var providers = await _authService.GetActiveProvidersAsync();
        return Ok(new ApiResponse<List<ProviderListItemDto>>(true, "Providers retrieved", providers));
    }
}
