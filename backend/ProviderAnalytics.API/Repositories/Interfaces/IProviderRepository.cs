using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Repositories.Interfaces;

public interface IProviderRepository : IGenericRepository<Provider>
{
    Task<PagedResult<Provider>> GetPagedAsync(ProviderQueryParams queryParams);
    Task<Provider?> GetWithScoresAsync(int id);
    Task<IEnumerable<Provider>> GetAllWithScoresAsync();
    Task<bool> NameExistsAsync(string name, int? excludeId = null);
}
