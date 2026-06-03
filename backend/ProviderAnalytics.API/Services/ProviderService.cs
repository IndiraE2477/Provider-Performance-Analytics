using System.Text.Json;
using AutoMapper;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Services;

public class ProviderService : IProviderService
{
    private readonly IProviderRepository _providerRepository;
    private readonly IAuditService _auditService;
    private readonly IMapper _mapper;
    private readonly ILogger<ProviderService> _logger;

    public ProviderService(
        IProviderRepository providerRepository,
        IAuditService auditService,
        IMapper mapper,
        ILogger<ProviderService> logger)
    {
        _providerRepository = providerRepository;
        _auditService = auditService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResult<ProviderDto>> GetProvidersAsync(ProviderQueryParams queryParams)
    {
        var pagedResult = await _providerRepository.GetPagedAsync(queryParams);
        return new PagedResult<ProviderDto>
        {
            Items = _mapper.Map<List<ProviderDto>>(pagedResult.Items),
            TotalCount = pagedResult.TotalCount,
            Page = pagedResult.Page,
            PageSize = pagedResult.PageSize
        };
    }

    public async Task<ProviderDetailDto?> GetProviderByIdAsync(int id)
    {
        var provider = await _providerRepository.GetWithScoresAsync(id);
        return provider == null ? null : _mapper.Map<ProviderDetailDto>(provider);
    }

    public async Task<ProviderDto> CreateProviderAsync(CreateProviderDto dto, string createdBy)
    {
        if (await _providerRepository.NameExistsAsync(dto.Name))
            throw new InvalidOperationException($"Provider with name '{dto.Name}' already exists");

        var provider = _mapper.Map<Provider>(dto);
        provider.CreatedBy = createdBy;
        provider.CreatedAt = DateTime.UtcNow;

        var created = await _providerRepository.AddAsync(provider);
        _logger.LogInformation("Provider created: {Name} (ID: {Id})", created.Name, created.Id);

        await _auditService.LogAsync("Provider", created.Id, "Create",
            null, JsonSerializer.Serialize(dto), createdBy);

        var result = await _providerRepository.GetWithScoresAsync(created.Id);
        return _mapper.Map<ProviderDto>(result);
    }

    public async Task<ProviderDto?> UpdateProviderAsync(int id, UpdateProviderDto dto, string updatedBy)
    {
        var provider = await _providerRepository.GetWithScoresAsync(id);
        if (provider == null) return null;

        if (await _providerRepository.NameExistsAsync(dto.Name, id))
            throw new InvalidOperationException($"Provider with name '{dto.Name}' already exists");

        var oldValues = JsonSerializer.Serialize(new
        {
            provider.Name, provider.Specialty, provider.Email,
            provider.Phone, provider.Location, provider.Status
        });

        provider.Name = dto.Name;
        provider.Specialty = dto.Specialty;
        provider.Email = dto.Email;
        provider.Phone = dto.Phone;
        provider.Location = dto.Location;
        provider.Status = dto.Status;
        provider.UpdatedBy = updatedBy;
        provider.UpdatedAt = DateTime.UtcNow;

        await _providerRepository.UpdateAsync(provider);
        _logger.LogInformation("Provider updated: {Name} (ID: {Id})", provider.Name, provider.Id);

        await _auditService.LogAsync("Provider", id, "Update",
            oldValues, JsonSerializer.Serialize(dto), updatedBy);

        return _mapper.Map<ProviderDto>(provider);
    }

    public async Task<bool> DeleteProviderAsync(int id, string deletedBy)
    {
        var provider = await _providerRepository.GetByIdAsync(id);
        if (provider == null) return false;

        provider.IsDeleted = true;
        provider.UpdatedBy = deletedBy;
        provider.UpdatedAt = DateTime.UtcNow;
        await _providerRepository.UpdateAsync(provider);

        _logger.LogInformation("Provider soft-deleted: {Name} (ID: {Id})", provider.Name, provider.Id);

        await _auditService.LogAsync("Provider", id, "Delete",
            JsonSerializer.Serialize(new { provider.Name }), null, deletedBy);

        return true;
    }

    public async Task<IEnumerable<string>> GetSpecialtiesAsync()
    {
        var providers = await _providerRepository.GetAllAsync();
        return providers.Select(p => p.Specialty).Distinct().OrderBy(s => s);
    }
}
