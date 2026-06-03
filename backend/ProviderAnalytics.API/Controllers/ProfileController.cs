using System.Security.Claims;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;

    public ProfileController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 200)]
    public async Task<IActionResult> GetProfile()
    {
        var result = await _userManagementService.GetProfileAsync(CurrentUserId);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, "Profile not found"));

        return Ok(new ApiResponse<ProfileDto>(true, "Profile retrieved", result));
    }

    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 200)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var result = await _userManagementService.UpdateProfileAsync(CurrentUserId, dto);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, "Profile not found"));

        return Ok(new ApiResponse<ProfileDto>(true, "Profile updated successfully", result));
    }

    [HttpPut("change-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var result = await _userManagementService.ChangePasswordAsync(CurrentUserId, dto);
        if (!result)
            return NotFound(new ApiErrorResponse(false, "User not found"));

        return Ok(new ApiResponse<object>(true, "Password changed successfully"));
    }
}
