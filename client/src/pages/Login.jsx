import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const data = await login(email, password);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2.5rem' }}>✈️</div>
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your JourniQ account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="login-email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="login-password"
            />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} type="submit" id="login-submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600 }}>Demo Accounts:</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Admin: admin@journiq.com / admin123</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>User: demo@journiq.com / demo123</p>
        </div>
      </div>
    </div>
  );
}
