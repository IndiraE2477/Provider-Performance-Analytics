namespace ProviderAnalytics.API.DTOs;

public class ProviderDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Specialty { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? Location { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal AverageScore { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public class ProviderDetailDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Specialty { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? Location { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal AverageScore { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public string? CreatedBy { get; init; }
    public string? UpdatedBy { get; init; }
    public List<ProviderScoreDto> Scores { get; init; } = new();
}

public record CreateProviderDto(
    string Name,
    string Specialty,
    string? Email,
    string? Phone,
    string? Location
);

public record UpdateProviderDto(
    string Name,
    string Specialty,
    string? Email,
    string? Phone,
    string? Location,
    string Status
);
