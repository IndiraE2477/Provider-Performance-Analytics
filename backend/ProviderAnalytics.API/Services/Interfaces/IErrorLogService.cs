using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IErrorLogService
{
    Task<IEnumerable<ErrorLogDto>> GetErrorLogsAsync();
    Task<PagedResult<ErrorLogDto>> GetErrorLogsPagedAsync(ErrorLogQueryParams queryParams);
}
