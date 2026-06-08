namespace ProviderAnalytics.API.DTOs;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}

public record ProviderQueryParams(
    string? Search = null,
    string? Specialty = null,
    string? Status = null,
    string SortBy = "Name",
    string SortOrder = "asc",
    int Page = 1,
    int PageSize = 10
);

public record ErrorLogQueryParams(
    string? Search = null,
    string? Method = null,
    int? StatusCode = null,
    string SortBy = "Timestamp",
    string SortOrder = "desc",
    int Page = 1,
    int PageSize = 10
);

public record AuditLogQueryParams(
    string? Search = null,
    string? ActionType = null,
    string? EntityName = null,
    string SortBy = "Timestamp",
    string SortOrder = "desc",
    int Page = 1,
    int PageSize = 10
);

public record ApiResponse<T>(bool Success, string Message, T? Data = default);

public record ApiErrorResponse(bool Success, string Message, List<string>? Errors = null);
