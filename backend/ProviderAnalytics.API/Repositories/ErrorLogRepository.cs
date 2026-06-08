using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;

namespace ProviderAnalytics.API.Repositories;

public class ErrorLogRepository : GenericRepository<ErrorLog>, IErrorLogRepository
{
    public ErrorLogRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<ErrorLog>> GetRecentAsync(int count = 100)
        => await _dbSet
            .OrderByDescending(e => e.Timestamp)
            .Take(count)
            .ToListAsync();

    public async Task<PagedResult<ErrorLog>> GetPagedAsync(ErrorLogQueryParams queryParams)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            var search = queryParams.Search.ToLower();
            query = query.Where(e =>
                e.Message.ToLower().Contains(search) ||
                (e.Source != null && e.Source.ToLower().Contains(search)) ||
                (e.Path != null && e.Path.ToLower().Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(queryParams.Method))
            query = query.Where(e => e.Method == queryParams.Method);

        if (queryParams.StatusCode.HasValue)
            query = query.Where(e => e.StatusCode == queryParams.StatusCode.Value);

        query = queryParams.SortBy?.ToLower() switch
        {
            "message" => queryParams.SortOrder == "desc" ? query.OrderByDescending(e => e.Message) : query.OrderBy(e => e.Message),
            "path" => queryParams.SortOrder == "desc" ? query.OrderByDescending(e => e.Path) : query.OrderBy(e => e.Path),
            "method" => queryParams.SortOrder == "desc" ? query.OrderByDescending(e => e.Method) : query.OrderBy(e => e.Method),
            "statuscode" => queryParams.SortOrder == "desc" ? query.OrderByDescending(e => e.StatusCode) : query.OrderBy(e => e.StatusCode),
            _ => queryParams.SortOrder == "asc" ? query.OrderBy(e => e.Timestamp) : query.OrderByDescending(e => e.Timestamp)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        return new PagedResult<ErrorLog>
        {
            Items = items,
            TotalCount = totalCount,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }
}
