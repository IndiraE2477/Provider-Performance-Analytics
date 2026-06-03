using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;

    public UsersController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListDto>>), 200)]
    public async Task<IActionResult> GetUsers()
    {
        var result = await _userManagementService.GetAllUsersAsync();
        return Ok(new ApiResponse<IEnumerable<UserListDto>>(true, "Users retrieved", result));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserListDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> GetUser(int id)
    {
        var result = await _userManagementService.GetUserByIdAsync(id);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, $"User with ID {id} not found"));

        return Ok(new ApiResponse<UserListDto>(true, "User retrieved", result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserListDto>), 201)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var result = await _userManagementService.CreateUserAsync(dto);
        return Created(string.Empty,
            new ApiResponse<UserListDto>(true, "User created successfully", result));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserListDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        var result = await _userManagementService.UpdateUserAsync(id, dto);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, $"User with ID {id} not found"));

        return Ok(new ApiResponse<UserListDto>(true, "User updated successfully", result));
    }
}
