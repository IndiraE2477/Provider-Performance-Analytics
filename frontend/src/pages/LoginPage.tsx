import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdLock, MdEmail } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store';
import { loginAsync, selectAuth } from '../store/slices/authSlice';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(loginAsync({ emailOrUsername: email, password }));
    if (loginAsync.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.fullName}!`);
      navigate('/dashboard');
    } else {
      toast.error(result.payload as string || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <MdLock size={28} color="#fff" />
          </div>
        </div>
        <h1>Provider Performance</h1>
        <p className="subtitle">Analytics Dashboard</p>

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
