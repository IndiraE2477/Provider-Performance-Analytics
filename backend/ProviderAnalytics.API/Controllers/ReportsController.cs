using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Manager")]
public class ReportsController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IProviderService _providerService;
    private readonly ApplicationDbContext _context;

    public ReportsController(
        IDashboardService dashboardService,
        IProviderService providerService,
        ApplicationDbContext context)
    {
        _dashboardService = dashboardService;
        _providerService = providerService;
        _context = context;
    }

    /// <summary>
    /// Get comprehensive report data with all providers and analytics
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<ReportDataDto>), 200)]
    public async Task<IActionResult> GetReportData()
    {
        var analytics = await _dashboardService.GetDashboardDataAsync();

        var providers = await _context.Providers
            .Include(p => p.Scores)
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Name)
            .Select(p => new ReportProviderDto(
                p.Id,
                p.Name,
                p.Specialty,
                p.Email,
                p.Phone,
                p.Location,
                p.Status,
                p.Scores.Any() ? Math.Round(p.Scores.Average(s => s.Score), 2) : 0,
                p.Scores.Count,
                p.Scores.Any()
                    ? p.Scores.Max(s => s.EvaluationDate)
                    : (DateTime?)null,
                p.CreatedAt
            ))
            .ToListAsync();

        var report = new ReportDataDto(
            GeneratedAt: DateTime.UtcNow,
            Kpis: analytics.Kpis,
            MonthlyTrends: analytics.MonthlyTrends,
            RiskDistribution: analytics.RiskDistribution,
            TopProviders: analytics.TopProviders,
            BottomProviders: analytics.BottomProviders,
            AllProviders: providers
        );

        return Ok(new ApiResponse<ReportDataDto>(true, "Report data retrieved", report));
    }

    /// <summary>
    /// Download report as CSV
    /// </summary>
    [HttpGet("download/csv")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    public async Task<IActionResult> DownloadCsv()
    {
        var analytics = await _dashboardService.GetDashboardDataAsync();

        var providers = await _context.Providers
            .Include(p => p.Scores)
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Name)
            .ToListAsync();

        var csv = new System.Text.StringBuilder();
        csv.AppendLine("PROVIDER PERFORMANCE ANALYTICS REPORT");
        csv.AppendLine($"Generated:,{DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
        csv.AppendLine();

        // KPIs Section
        csv.AppendLine("KEY PERFORMANCE INDICATORS");
        csv.AppendLine("Metric,Value");
        csv.AppendLine($"Average Score,{analytics.Kpis.AverageScore:F2}");
        csv.AppendLine($"Total Providers,{analytics.Kpis.TotalProviders}");
        csv.AppendLine($"At-Risk Providers,{analytics.Kpis.AtRiskProviders}");
        csv.AppendLine($"Monthly Improvement,{analytics.Kpis.MonthlyImprovement:F2}%");
        csv.AppendLine();

        // Monthly Trends
        csv.AppendLine("MONTHLY TRENDS");
        csv.AppendLine("Month,Average Score");
        foreach (var trend in analytics.MonthlyTrends)
            csv.AppendLine($"{trend.Month},{trend.AverageScore:F2}");
        csv.AppendLine();

        // Risk Distribution
        csv.AppendLine("RISK DISTRIBUTION");
        csv.AppendLine("Status,Count");
        foreach (var risk in analytics.RiskDistribution)
            csv.AppendLine($"{risk.Status},{risk.Count}");
        csv.AppendLine();

        // All Providers
        csv.AppendLine("ALL PROVIDERS");
        csv.AppendLine("Name,Specialty,Email,Phone,Location,Status,Average Score,Total Evaluations,Last Evaluation,Created");
        foreach (var p in providers)
        {
            var avgScore = p.Scores.Any() ? Math.Round(p.Scores.Average(s => s.Score), 2) : 0m;
            var lastEval = p.Scores.Any() ? p.Scores.Max(s => s.EvaluationDate).ToString("yyyy-MM-dd") : "N/A";
            csv.AppendLine($"\"{p.Name}\",\"{p.Specialty}\",\"{p.Email}\",\"{p.Phone}\",\"{p.Location}\",\"{p.Status}\",{avgScore:F2},{p.Scores.Count},{lastEval},{p.CreatedAt:yyyy-MM-dd}");
        }
        csv.AppendLine();

        // Score Details
        csv.AppendLine("SCORE DETAILS");
        csv.AppendLine("Provider,Date,Category,Score,Notes,Evaluated By");
        foreach (var p in providers)
        {
            foreach (var s in p.Scores.OrderByDescending(s => s.EvaluationDate))
            {
                csv.AppendLine($"\"{p.Name}\",{s.EvaluationDate:yyyy-MM-dd},\"{s.Category}\",{s.Score:F2},\"{s.Notes?.Replace("\"", "\"\"")}\",\"{s.EvaluatedBy}\"");
            }
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"provider-analytics-report-{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}
