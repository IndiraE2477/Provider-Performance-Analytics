using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Repositories.Interfaces;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Services;

public class ErrorLogService : IErrorLogService
{
    private readonly IErrorLogRepository _errorLogRepository;

    public ErrorLogService(IErrorLogRepository errorLogRepository)
    {
        _errorLogRepository = errorLogRepository;
    }

    public async Task<IEnumerable<ErrorLogDto>> GetErrorLogsAsync()
    {
        var logs = await _errorLogRepository.GetRecentAsync(200);
        return logs.Select(e => new ErrorLogDto(
            e.Id,
            e.Message,
            e.StackTrace,
            e.Source,
            e.Path,
            e.Method,
            e.StatusCode,
            e.Timestamp
        ));
    }

    public async Task<PagedResult<ErrorLogDto>> GetErrorLogsPagedAsync(ErrorLogQueryParams queryParams)
    {
        var pagedResult = await _errorLogRepository.GetPagedAsync(queryParams);
        return new PagedResult<ErrorLogDto>
        {
            Items = pagedResult.Items.Select(e => new ErrorLogDto(
                e.Id,
                e.Message,
                e.StackTrace,
                e.Source,
                e.Path,
                e.Method,
                e.StatusCode,
                e.Timestamp
            )).ToList(),
            TotalCount = pagedResult.TotalCount,
            Page = pagedResult.Page,
            PageSize = pagedResult.PageSize
        };
    }
}
