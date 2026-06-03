using AutoMapper;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name));

        CreateMap<Provider, ProviderDto>()
            .ForMember(dest => dest.AverageScore, opt => opt.MapFrom(src =>
                src.Scores.Any() ? Math.Round(src.Scores.Average(s => s.Score), 2) : 0));

        CreateMap<Provider, ProviderDetailDto>()
            .ForMember(dest => dest.AverageScore, opt => opt.MapFrom(src =>
                src.Scores.Any() ? Math.Round(src.Scores.Average(s => s.Score), 2) : 0))
            .ForMember(dest => dest.Scores, opt => opt.MapFrom(src => src.Scores.OrderByDescending(s => s.EvaluationDate)));

        CreateMap<CreateProviderDto, Provider>();
        CreateMap<UpdateProviderDto, Provider>();

        CreateMap<ProviderScore, ProviderScoreDto>()
            .ForMember(dest => dest.ProviderName, opt => opt.MapFrom(src => src.Provider.Name));

        CreateMap<CreateProviderScoreDto, ProviderScore>()
            .ForMember(dest => dest.EvaluationDate, opt => opt.MapFrom(src =>
                src.EvaluationDate ?? DateTime.UtcNow));
    }
}
