using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Repositories.Interfaces;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Services;

public class DashboardService : IDashboardService
{
    private readonly IProviderRepository _providerRepository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        IProviderRepository providerRepository,
        ApplicationDbContext context,
        ILogger<DashboardService> logger)
    {
        _providerRepository = providerRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<DashboardAnalyticsDto> GetDashboardDataAsync()
    {
        var kpis = await GetKpisAsync();
        var providers = await _providerRepository.GetAllWithScoresAsync();
        var providerList = providers.ToList();

        // Monthly trends
        var monthlyTrends = providerList
            .SelectMany(p => p.Scores)
            .GroupBy(s => new { s.EvaluationDate.Year, s.EvaluationDate.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthlyTrendDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                Math.Round(g.Average(s => s.Score), 2)
            ))
            .ToList();

        // Risk distribution
        var riskDistribution = providerList
            .GroupBy(p => p.Status)
            .Select(g => new RiskDistributionDto(g.Key, g.Count()))
            .OrderBy(r => r.Status)
            .ToList();

        // Top 5 providers
        var topProviders = providerList
            .Where(p => p.Scores.Any())
            .OrderByDescending(p => p.Scores.Average(s => s.Score))
            .Take(5)
            .Select(p => new ProviderPerformanceDto(
                p.Name,
                Math.Round(p.Scores.Average(s => s.Score), 2),
                p.Status
            ))
            .ToList();

        // Bottom 5 providers
        var bottomProviders = providerList
            .Where(p => p.Scores.Any())
            .OrderBy(p => p.Scores.Average(s => s.Score))
            .Take(5)
            .Select(p => new ProviderPerformanceDto(
                p.Name,
                Math.Round(p.Scores.Average(s => s.Score), 2),
                p.Status
            ))
            .ToList();

        return new DashboardAnalyticsDto(kpis, monthlyTrends, riskDistribution, topProviders, bottomProviders);
    }

    public async Task<DashboardKpiDto> GetKpisAsync()
    {
        var providers = await _providerRepository.GetAllWithScoresAsync();
        var providerList = providers.ToList();

        var totalProviders = providerList.Count;
        var atRiskProviders = providerList.Count(p => p.Status == "At-Risk");

        var averageScore = providerList
            .Where(p => p.Scores.Any())
            .SelectMany(p => p.Scores)
            .DefaultIfEmpty()
            .Average(s => s?.Score ?? 0);

        var allScores = providerList.SelectMany(p => p.Scores).ToList();
        var monthlyImprovement = 0m;

        if (allScores.Any())
        {
            var latestMonth = allScores.Max(s => s.EvaluationDate);
            var previousMonth = latestMonth.AddMonths(-1);

            var currentMonthAvg = allScores
                .Where(s => s.EvaluationDate.Year == latestMonth.Year && s.EvaluationDate.Month == latestMonth.Month)
                .DefaultIfEmpty()
                .Average(s => s?.Score ?? 0);

            var previousMonthAvg = allScores
                .Where(s => s.EvaluationDate.Year == previousMonth.Year && s.EvaluationDate.Month == previousMonth.Month)
                .DefaultIfEmpty()
                .Average(s => s?.Score ?? 0);

            if (previousMonthAvg > 0)
                monthlyImprovement = Math.Round(((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100, 2);
        }

        return new DashboardKpiDto(
            Math.Round(averageScore, 2),
            totalProviders,
            atRiskProviders,
            monthlyImprovement
        );
    }

    public async Task<AdminSummaryDto> GetAdminSummaryAsync()
    {
        var totalUsers = await _context.Users.CountAsync();
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
        var totalAuditLogs = await _context.AuditLogs.CountAsync();

        var recentActivity = await _context.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(10)
            .Select(a => new AuditLogDto(
                a.Id, a.EntityName, a.ActionType, a.EntityId, a.ModifiedBy, a.Timestamp
            ))
            .ToListAsync();

        return new AdminSummaryDto(totalUsers, activeUsers, totalAuditLogs, recentActivity);
    }

    public async Task<ProviderDashboardDto?> GetProviderDashboardAsync(int providerId)
    {
        var provider = await _context.Providers
            .Include(p => p.Scores)
            .FirstOrDefaultAsync(p => p.Id == providerId);

        if (provider == null) return null;

        var scores = provider.Scores.OrderByDescending(s => s.EvaluationDate).ToList();
        var overallScore = scores.Any() ? Math.Round(scores.Average(s => s.Score), 2) : 0m;
        var totalEvaluations = scores.Count;

        var monthlyChange = 0m;
        if (scores.Any())
        {
            var latestMonth = scores.Max(s => s.EvaluationDate);
            var prevMonth = latestMonth.AddMonths(-1);
            var curAvg = scores
                .Where(s => s.EvaluationDate.Year == latestMonth.Year && s.EvaluationDate.Month == latestMonth.Month)
                .DefaultIfEmpty().Average(s => s?.Score ?? 0);
            var prevAvg = scores
                .Where(s => s.EvaluationDate.Year == prevMonth.Year && s.EvaluationDate.Month == prevMonth.Month)
                .DefaultIfEmpty().Average(s => s?.Score ?? 0);
            if (prevAvg > 0)
                monthlyChange = Math.Round(((curAvg - prevAvg) / prevAvg) * 100, 2);
        }

        var scoreTrends = scores
            .GroupBy(s => new { s.EvaluationDate.Year, s.EvaluationDate.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthlyTrendDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                Math.Round(g.Average(s => s.Score), 2)
            )).ToList();

        var categoryScores = scores
            .Where(s => s.Category != null)
            .GroupBy(s => s.Category!)
            .Select(g => new CategoryScoreDto(g.Key, Math.Round(g.Average(s => s.Score), 2)))
            .OrderByDescending(c => c.AverageScore)
            .ToList();

        var recentScores = scores.Take(10)
            .Select(s => new ProviderScoreDto
            {
                Id = s.Id,
                ProviderId = s.ProviderId,
                ProviderName = provider.Name,
                Score = s.Score,
                Category = s.Category,
                Notes = s.Notes,
                EvaluationDate = s.EvaluationDate,
                EvaluatedBy = s.EvaluatedBy
            }).ToList();

        return new ProviderDashboardDto(
            provider.Name,
            provider.Specialty,
            provider.Status,
            provider.Location,
            overallScore,
            totalEvaluations,
            monthlyChange,
            scoreTrends,
            categoryScores,
            recentScores
        );
    }
}
