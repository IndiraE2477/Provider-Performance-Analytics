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
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpGet("risk-predictions")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<List<RiskPredictionDto>>), 200)]
    public async Task<IActionResult> GetRiskPredictions()
    {
        var result = await _aiService.GetRiskPredictionsAsync();
        return Ok(new ApiResponse<List<RiskPredictionDto>>(true, "Risk predictions generated", result));
    }

    [HttpGet("risk-predictions/{providerId:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<RiskPredictionDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> GetProviderRiskPrediction(int providerId)
    {
        var result = await _aiService.GetProviderRiskPredictionAsync(providerId);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, "Provider not found or has no scores"));
        return Ok(new ApiResponse<RiskPredictionDto>(true, "Risk prediction generated", result));
    }

    [HttpGet("performance-summary/{providerId:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<PerformanceSummaryDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> GetPerformanceSummary(int providerId)
    {
        var result = await _aiService.GetPerformanceSummaryAsync(providerId);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, "Provider not found or has no scores"));
        return Ok(new ApiResponse<PerformanceSummaryDto>(true, "Performance summary generated", result));
    }

    [HttpGet("dashboard-insights")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<List<DashboardInsightDto>>), 200)]
    public async Task<IActionResult> GetDashboardInsights()
    {
        var result = await _aiService.GetDashboardInsightsAsync();
        return Ok(new ApiResponse<List<DashboardInsightDto>>(true, "Dashboard insights generated", result));
    }

    [HttpGet("error-analysis")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<List<ErrorLogAnalysisDto>>), 200)]
    public async Task<IActionResult> GetErrorLogAnalysis()
    {
        var result = await _aiService.GetErrorLogAnalysisAsync();
        return Ok(new ApiResponse<List<ErrorLogAnalysisDto>>(true, "Error log analysis generated", result));
    }

    [HttpPost("assistant")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<AiAssistantResponseDto>), 200)]
    public async Task<IActionResult> AskAssistant([FromBody] AiAssistantRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
            return BadRequest(new ApiErrorResponse(false, "Question is required"));

        var result = await _aiService.AskAssistantAsync(request.Question);
        return Ok(new ApiResponse<AiAssistantResponseDto>(true, "Response generated", result));
    }

    [HttpGet("recommendations/{providerId:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ApiResponse<List<AiRecommendationDto>>), 200)]
    public async Task<IActionResult> GetRecommendations(int providerId)
    {
        var result = await _aiService.GetRecommendationsAsync(providerId);
        return Ok(new ApiResponse<List<AiRecommendationDto>>(true, "Recommendations generated", result));
    }
}
