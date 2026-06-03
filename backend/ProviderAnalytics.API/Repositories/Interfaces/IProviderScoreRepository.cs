using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Repositories.Interfaces;

public interface IProviderScoreRepository : IGenericRepository<ProviderScore>
{
    Task<IEnumerable<ProviderScore>> GetByProviderIdAsync(int providerId);
    Task<IEnumerable<ProviderScore>> GetRecentScoresAsync(int count = 50);
}
