using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;

namespace ProviderAnalytics.API.Repositories;

public class ProviderScoreRepository : GenericRepository<ProviderScore>, IProviderScoreRepository
{
    public ProviderScoreRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<ProviderScore>> GetByProviderIdAsync(int providerId)
        => await _dbSet
            .Include(ps => ps.Provider)
            .Where(ps => ps.ProviderId == providerId)
            .OrderByDescending(ps => ps.EvaluationDate)
            .ToListAsync();

    public async Task<IEnumerable<ProviderScore>> GetRecentScoresAsync(int count = 50)
        => await _dbSet
            .Include(ps => ps.Provider)
            .OrderByDescending(ps => ps.EvaluationDate)
            .Take(count)
            .ToListAsync();
}
