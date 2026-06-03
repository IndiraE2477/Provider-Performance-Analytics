import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdPerson, MdEmail, MdLock, MdBadge, MdSecurity, MdLocalHospital } from 'react-icons/md';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import type { ProviderListItem } from '../types';

interface FormErrors {
  username?: string;
  email?: string;
  fullName?: string;
  password?: string;
  confirmPassword?: string;
  roleId?: string;
  providerId?: string;
}

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(3);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [providers, setProviders] = useState<ProviderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  useEffect(() => {
    authService.getProviders().then(setProviders).catch(() => {});
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (roleId === 3 && !providerId) {
      newErrors.providerId = 'Please select a provider for Viewer role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.register({ username, email, fullName, password, confirmPassword, roleId, providerId: roleId === 3 ? providerId : null });
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      const serverErrors: string[] = error.response?.data?.errors || [];
      if (serverErrors.length > 0) {
        toast.error(serverErrors.join('. '));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 460 }}>
        <h1>Create Account</h1>
        <p className="subtitle">Register to access Provider Analytics</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              <MdPerson style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Username
            </label>
            <input
              id="username"
              type="text"
              className={`form-control ${errors.username ? 'error' : ''}`}
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fullName">
              <MdBadge style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className={`form-control ${errors.fullName ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <MdEmail style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <MdLock style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <MdLock style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="roleId">
              <MdSecurity style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Role
            </label>
            <select
              id="roleId"
              className={`form-control ${errors.roleId ? 'error' : ''}`}
              value={roleId}
              onChange={(e) => { setRoleId(Number(e.target.value)); setProviderId(null); }}
            >
              <option value={1}>Admin</option>
              <option value={2}>Manager</option>
              <option value={3}>Viewer</option>
            </select>
            {errors.roleId && <span className="error-text">{errors.roleId}</span>}
          </div>

          {roleId === 3 && (
            <div className="form-group">
              <label htmlFor="providerId">
                <MdLocalHospital style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Provider
              </label>
              <select
                id="providerId"
                className={`form-control ${errors.providerId ? 'error' : ''}`}
                value={providerId ?? ''}
                onChange={(e) => setProviderId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Select a provider</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.specialty}</option>
                ))}
              </select>
              {errors.providerId && <span className="error-text">{errors.providerId}</span>}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>

        <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#166534' }}>
          <strong>Note:</strong> Select the appropriate role for your account.
          Admins have full access, Managers can manage providers, Viewers have read-only access.
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
