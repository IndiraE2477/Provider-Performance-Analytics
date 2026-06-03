using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;

namespace ProviderAnalytics.API.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context) { }

    public async Task<User?> GetByUsernameAsync(string username)
        => await _dbSet
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

    public async Task<User?> GetWithRoleAsync(int id)
        => await _dbSet
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
}
