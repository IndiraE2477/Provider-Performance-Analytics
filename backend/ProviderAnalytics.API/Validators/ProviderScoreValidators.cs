using FluentValidation;
using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Validators;

public class CreateProviderScoreValidator : AbstractValidator<CreateProviderScoreDto>
{
    public CreateProviderScoreValidator()
    {
        RuleFor(x => x.ProviderId)
            .GreaterThan(0).WithMessage("Provider ID is required");

        RuleFor(x => x.Score)
            .InclusiveBetween(0, 5).WithMessage("Score must be between 0 and 5");

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category must not exceed 100 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
    }
}

public class UpdateProviderScoreValidator : AbstractValidator<UpdateProviderScoreDto>
{
    public UpdateProviderScoreValidator()
    {
        RuleFor(x => x.Score)
            .InclusiveBetween(0, 5).WithMessage("Score must be between 0 and 5");

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category must not exceed 100 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
    }
}
