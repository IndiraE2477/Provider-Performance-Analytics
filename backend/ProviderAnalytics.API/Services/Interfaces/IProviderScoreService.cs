using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IProviderScoreService
{
    Task<IEnumerable<ProviderScoreDto>> GetScoresByProviderAsync(int providerId);
    Task<ProviderScoreDto?> GetScoreByIdAsync(int id);
    Task<ProviderScoreDto> CreateScoreAsync(CreateProviderScoreDto dto, string evaluatedBy, int? evaluatorProviderId = null);
    Task<ProviderScoreDto?> UpdateScoreAsync(int id, UpdateProviderScoreDto dto, string evaluatedBy, int? evaluatorProviderId = null);
    Task<bool> DeleteScoreAsync(int id);
}
