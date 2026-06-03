using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardAnalyticsDto> GetDashboardDataAsync();
    Task<DashboardKpiDto> GetKpisAsync();
    Task<AdminSummaryDto> GetAdminSummaryAsync();
    Task<ProviderDashboardDto?> GetProviderDashboardAsync(int providerId);
}
