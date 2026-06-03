using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
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
}
