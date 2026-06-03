using System.Security.Claims;
using Asp.Versioning;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize]
public class ProvidersController : ControllerBase
{
    private readonly IProviderService _providerService;
    private readonly IValidator<CreateProviderDto> _createValidator;
    private readonly IValidator<UpdateProviderDto> _updateValidator;

    public ProvidersController(
        IProviderService providerService,
        IValidator<CreateProviderDto> createValidator,
        IValidator<UpdateProviderDto> updateValidator)
    {
        _providerService = providerService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    private string CurrentUser => User.FindFirstValue(ClaimTypes.Name) ?? "system";

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ProviderDto>>), 200)]
    public async Task<IActionResult> GetProviders([FromQuery] ProviderQueryParams queryParams)
    {
        var result = await _providerService.GetProvidersAsync(queryParams);
        return Ok(new ApiResponse<PagedResult<ProviderDto>>(true, "Providers retrieved", result));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProviderDetailDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> GetProvider(int id)
    {
        var result = await _providerService.GetProviderByIdAsync(id);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, $"Provider with ID {id} not found"));

        return Ok(new ApiResponse<ProviderDetailDto>(true, "Provider retrieved", result));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<ProviderDto>), 201)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    public async Task<IActionResult> CreateProvider([FromBody] CreateProviderDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ApiErrorResponse(
                false, "Validation failed",
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var result = await _providerService.CreateProviderAsync(dto, CurrentUser);
        return CreatedAtAction(nameof(GetProvider), new { id = result.Id },
            new ApiResponse<ProviderDto>(true, "Provider created successfully", result));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<ProviderDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> UpdateProvider(int id, [FromBody] UpdateProviderDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ApiErrorResponse(
                false, "Validation failed",
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var result = await _providerService.UpdateProviderAsync(id, dto, CurrentUser);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, $"Provider with ID {id} not found"));

        return Ok(new ApiResponse<ProviderDto>(true, "Provider updated successfully", result));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> DeleteProvider(int id)
    {
        var result = await _providerService.DeleteProviderAsync(id, CurrentUser);
        if (!result)
            return NotFound(new ApiErrorResponse(false, $"Provider with ID {id} not found"));

        return Ok(new ApiResponse<object>(true, "Provider deleted successfully"));
    }

    [HttpGet("specialties")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<string>>), 200)]
    public async Task<IActionResult> GetSpecialties()
    {
        var result = await _providerService.GetSpecialtiesAsync();
        return Ok(new ApiResponse<IEnumerable<string>>(true, "Specialties retrieved", result));
    }
}
