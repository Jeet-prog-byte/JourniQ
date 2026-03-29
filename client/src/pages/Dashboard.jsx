import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(location.hash === '#profile' ? 'profile' : 'bookings');
  const [toast, setToast] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    loadBookings();
    if (user) setProfileForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    if (location.hash === '#profile') {
      setTab('profile');
    } else {
      setTab('bookings');
    }
  }, [location.hash]);

  const loadBookings = async () => {
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(id);
      showToast('Booking cancelled', 'success');
      loadBookings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile(profileForm);
      updateUser(updated);
      showToast('Profile updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const completed = bookings.filter(b => b.status === 'completed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="dashboard" id="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="welcome">Welcome back, {user?.name?.split(' ')[0]}! 👋</p>
          </div>
          <Link to="/packages" className="btn btn-primary">+ Book a Trip</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--accent-gold)' }}>📋</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>✅</div>
            <div className="stat-value">{confirmed.length}</div>
            <div className="stat-label">Upcoming Trips</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--info)' }}>🏆</div>
            <div className="stat-value">{completed.length}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--error)' }}>❌</div>
            <div className="stat-value">{cancelled.length}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['bookings', 'profile'].map(t => (
            <button 
              key={t}
              className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setTab(t)}
            >
              {t === 'bookings' ? '📦 My Bookings' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div className="dashboard-section">
            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🧳</div>
                <h3>No bookings yet</h3>
                <p>Start your journey by exploring our amazing travel packages!</p>
                <Link to="/packages" className="btn btn-primary">Explore Packages</Link>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(b => (
                  <div className="booking-card" key={b.id}>
                    <div className="booking-card-image">
                      <img src={b.image_url} alt={b.package_title} />
                    </div>
                    <div className="booking-card-info">
                      <h3>{b.package_title}</h3>
                      <div className="destination">📍 {b.destination}</div>
                      <div className="booking-card-details">
                        <span>📅 {new Date(b.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>👥 {b.travelers} {b.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                        <span>🕒 {b.duration} Days</span>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{formatPrice(b.total_price)}</span>
                      </div>
                    </div>
                    <div className="booking-card-actions">
                      <span className={`status-badge status-${b.status}`}>{b.status}</span>
                      {b.status === 'confirmed' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Member since {new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={user?.role || ''} disabled style={{ opacity: 0.5, textTransform: 'capitalize' }} />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop: '20px' }}>Save Changes</button>
            </form>
          </div>
        )}
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
