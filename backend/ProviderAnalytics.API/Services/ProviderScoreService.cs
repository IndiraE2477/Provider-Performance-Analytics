using AutoMapper;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Services;

public class ProviderScoreService : IProviderScoreService
{
    private readonly IProviderScoreRepository _scoreRepository;
    private readonly IProviderRepository _providerRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ProviderScoreService> _logger;

    public ProviderScoreService(
        IProviderScoreRepository scoreRepository,
        IProviderRepository providerRepository,
        IMapper mapper,
        ILogger<ProviderScoreService> logger)
    {
        _scoreRepository = scoreRepository;
        _providerRepository = providerRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<ProviderScoreDto>> GetScoresByProviderAsync(int providerId)
    {
        var scores = await _scoreRepository.GetByProviderIdAsync(providerId);
        return _mapper.Map<IEnumerable<ProviderScoreDto>>(scores);
    }

    public async Task<ProviderScoreDto?> GetScoreByIdAsync(int id)
    {
        var score = await _scoreRepository.GetByIdAsync(id);
        return score == null ? null : _mapper.Map<ProviderScoreDto>(score);
    }

    public async Task<ProviderScoreDto> CreateScoreAsync(CreateProviderScoreDto dto, string evaluatedBy, int? evaluatorProviderId = null)
    {
        var provider = await _providerRepository.GetByIdAsync(dto.ProviderId);
        if (provider == null)
            throw new InvalidOperationException($"Provider with ID {dto.ProviderId} not found");

        var score = _mapper.Map<ProviderScore>(dto);
        score.EvaluatedBy = await ResolveEvaluatorNameAsync(evaluatedBy, evaluatorProviderId);
        score.CreatedAt = DateTime.UtcNow;

        var created = await _scoreRepository.AddAsync(score);
        _logger.LogInformation("Score created for Provider {ProviderId}: {Score}", dto.ProviderId, dto.Score);

        var scores = await _scoreRepository.GetByProviderIdAsync(created.ProviderId);
        var result = scores.FirstOrDefault(s => s.Id == created.Id);
        return _mapper.Map<ProviderScoreDto>(result);
    }

    public async Task<ProviderScoreDto?> UpdateScoreAsync(int id, UpdateProviderScoreDto dto, string evaluatedBy, int? evaluatorProviderId = null)
    {
        var score = await _scoreRepository.GetByIdAsync(id);
        if (score == null) return null;

        score.Score = dto.Score;
        score.Category = dto.Category ?? score.Category;
        score.Notes = dto.Notes ?? score.Notes;
        score.EvaluatedBy = await ResolveEvaluatorNameAsync(evaluatedBy, evaluatorProviderId);

        await _scoreRepository.UpdateAsync(score);
        _logger.LogInformation("Score updated (ID: {Id}): {Score}", id, dto.Score);

        return _mapper.Map<ProviderScoreDto>(score);
    }

    public async Task<bool> DeleteScoreAsync(int id)
    {
        var score = await _scoreRepository.GetByIdAsync(id);
        if (score == null) return false;

        await _scoreRepository.DeleteAsync(score);
        _logger.LogInformation("Score deleted (ID: {Id})", id);
        return true;
    }

    private async Task<string> ResolveEvaluatorNameAsync(string username, int? evaluatorProviderId)
    {
        if (evaluatorProviderId.HasValue)
        {
            var provider = await _providerRepository.GetByIdAsync(evaluatorProviderId.Value);
            if (provider != null)
                return provider.Name;
        }
        return username;
    }
}
