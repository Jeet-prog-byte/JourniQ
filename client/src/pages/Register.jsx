import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(form.name, form.email, form.password, form.phone);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2.5rem' }}>🌍</div>
        <h1>Create Account</h1>
        <p className="subtitle">Join JourniQ and start exploring the world</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              id="register-name"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              id="register-email"
            />
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input 
              type="text" 
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              id="register-phone"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              id="register-password"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              id="register-confirm-password"
            />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} type="submit" id="register-submit">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
