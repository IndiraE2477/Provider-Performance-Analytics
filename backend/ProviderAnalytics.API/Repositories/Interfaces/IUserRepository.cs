using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Repositories.Interfaces;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetWithRoleAsync(int id);
}
