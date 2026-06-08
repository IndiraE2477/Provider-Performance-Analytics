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

    [HttpGet("{id:int}/report")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> DownloadProviderReport(int id)
    {
        var provider = await _providerService.GetProviderByIdAsync(id);
        if (provider == null)
            return NotFound(new ApiErrorResponse(false, $"Provider with ID {id} not found"));

        var csv = new System.Text.StringBuilder();

        // Provider details section
        csv.AppendLine("PROVIDER DETAILS REPORT");
        csv.AppendLine($"Generated:,{DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
        csv.AppendLine();
        csv.AppendLine("Name,Specialty,Email,Phone,Location,Status,Average Score,Created");
        csv.AppendLine($"\"{provider.Name}\",\"{provider.Specialty}\",\"{provider.Email}\",\"{provider.Phone}\",\"{provider.Location}\",\"{provider.Status}\",{provider.AverageScore:F2},{provider.CreatedAt:yyyy-MM-dd}");
        csv.AppendLine();

        // Score history section
        csv.AppendLine("SCORE HISTORY");
        csv.AppendLine("Date,Category,Score,Notes,Evaluated By");
        foreach (var score in provider.Scores.OrderByDescending(s => s.EvaluationDate))
        {
            csv.AppendLine($"{score.EvaluationDate:yyyy-MM-dd},\"{score.Category}\",{score.Score:F2},\"{score.Notes}\",\"{score.EvaluatedBy}\"");
        }
        csv.AppendLine();

        // Analytics summary
        csv.AppendLine("ANALYTICS SUMMARY");
        csv.AppendLine("Category,Average Score,Count");
        var categoryGroups = provider.Scores
            .Where(s => !string.IsNullOrEmpty(s.Category))
            .GroupBy(s => s.Category)
            .Select(g => new { Category = g.Key, Avg = g.Average(s => s.Score), Count = g.Count() });
        foreach (var cat in categoryGroups)
        {
            csv.AppendLine($"\"{cat.Category}\",{cat.Avg:F2},{cat.Count}");
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        var fileName = $"Provider_Report_{provider.Name.Replace(" ", "_")}_{DateTime.UtcNow:yyyyMMdd}.csv";
        return File(bytes, "text/csv", fileName);
    }
}
