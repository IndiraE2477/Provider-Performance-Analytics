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
public class ProviderScoresController : ControllerBase
{
    private readonly IProviderScoreService _scoreService;
    private readonly IValidator<CreateProviderScoreDto> _createValidator;
    private readonly IValidator<UpdateProviderScoreDto> _updateValidator;

    public ProviderScoresController(
        IProviderScoreService scoreService,
        IValidator<CreateProviderScoreDto> createValidator,
        IValidator<UpdateProviderScoreDto> updateValidator)
    {
        _scoreService = scoreService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    private string CurrentUser => User.FindFirstValue(ClaimTypes.Name) ?? "system";
    private int? CurrentProviderId
    {
        get
        {
            var claim = User.FindFirstValue("ProviderId");
            return int.TryParse(claim, out var id) ? id : null;
        }
    }

    [HttpGet("provider/{providerId:int}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProviderScoreDto>>), 200)]
    public async Task<IActionResult> GetScoresByProvider(int providerId)
    {
        var result = await _scoreService.GetScoresByProviderAsync(providerId);
        return Ok(new ApiResponse<IEnumerable<ProviderScoreDto>>(true, "Scores retrieved", result));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProviderScoreDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> GetScore(int id)
    {
        var result = await _scoreService.GetScoreByIdAsync(id);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, $"Score with ID {id} not found"));

        return Ok(new ApiResponse<ProviderScoreDto>(true, "Score retrieved", result));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<ProviderScoreDto>), 201)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    public async Task<IActionResult> CreateScore([FromBody] CreateProviderScoreDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ApiErrorResponse(
                false, "Validation failed",
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var result = await _scoreService.CreateScoreAsync(dto, CurrentUser, CurrentProviderId);
        return CreatedAtAction(nameof(GetScore), new { id = result.Id },
            new ApiResponse<ProviderScoreDto>(true, "Score created successfully", result));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<ProviderScoreDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> UpdateScore(int id, [FromBody] UpdateProviderScoreDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ApiErrorResponse(
                false, "Validation failed",
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var result = await _scoreService.UpdateScoreAsync(id, dto, CurrentUser, CurrentProviderId);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, $"Score with ID {id} not found"));

        return Ok(new ApiResponse<ProviderScoreDto>(true, "Score updated successfully", result));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> DeleteScore(int id)
    {
        var result = await _scoreService.DeleteScoreAsync(id);
        if (!result)
            return NotFound(new ApiErrorResponse(false, $"Score with ID {id} not found"));

        return Ok(new ApiResponse<object>(true, "Score deleted successfully"));
    }
}
