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
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<DashboardAnalyticsDto>), 200)]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _dashboardService.GetDashboardDataAsync();
        return Ok(new ApiResponse<DashboardAnalyticsDto>(true, "Dashboard data retrieved", result));
    }

    [HttpGet("kpis")]
    [ProducesResponseType(typeof(ApiResponse<DashboardKpiDto>), 200)]
    public async Task<IActionResult> GetKpis()
    {
        var result = await _dashboardService.GetKpisAsync();
        return Ok(new ApiResponse<DashboardKpiDto>(true, "KPIs retrieved", result));
    }

    [HttpGet("admin-summary")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AdminSummaryDto>), 200)]
    public async Task<IActionResult> GetAdminSummary()
    {
        var result = await _dashboardService.GetAdminSummaryAsync();
        return Ok(new ApiResponse<AdminSummaryDto>(true, "Admin summary retrieved", result));
    }

    [HttpGet("provider/{providerId:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProviderDashboardDto>), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> GetProviderDashboard(int providerId)
    {
        var result = await _dashboardService.GetProviderDashboardAsync(providerId);
        if (result == null)
            return NotFound(new ApiErrorResponse(false, "Provider not found"));
        return Ok(new ApiResponse<ProviderDashboardDto>(true, "Provider dashboard retrieved", result));
    }
}
