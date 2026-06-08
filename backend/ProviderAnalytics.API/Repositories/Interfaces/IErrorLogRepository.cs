using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Repositories.Interfaces;

public interface IErrorLogRepository : IGenericRepository<ErrorLog>
{
    Task<IEnumerable<ErrorLog>> GetRecentAsync(int count = 100);
    Task<PagedResult<ErrorLog>> GetPagedAsync(ErrorLogQueryParams queryParams);
}
