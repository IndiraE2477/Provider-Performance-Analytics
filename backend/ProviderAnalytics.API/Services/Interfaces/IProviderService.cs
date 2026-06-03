using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IProviderService
{
    Task<PagedResult<ProviderDto>> GetProvidersAsync(ProviderQueryParams queryParams);
    Task<ProviderDetailDto?> GetProviderByIdAsync(int id);
    Task<ProviderDto> CreateProviderAsync(CreateProviderDto dto, string createdBy);
    Task<ProviderDto?> UpdateProviderAsync(int id, UpdateProviderDto dto, string updatedBy);
    Task<bool> DeleteProviderAsync(int id, string deletedBy);
    Task<IEnumerable<string>> GetSpecialtiesAsync();
}
