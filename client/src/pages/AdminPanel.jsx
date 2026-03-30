import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    title: '', destination: '', description: '', price: '', duration: '',
    max_travelers: 20, category: 'beach', image_url: '', is_featured: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const [statsData, bookingsData, usersData, packagesData] = await Promise.all([
        api.getStats(),
        api.getAllBookings(),
        api.getAllUsers(),
        api.getPackages()
      ]);
      setStats(statsData);
      setBookings(bookingsData || []);
      setUsers(usersData || []);
      setPackages(packagesData || []);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm('Delete this package?')) return;
    try {
      await api.deletePackage(id);
      showToast('Package deleted', 'success');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    try {
      await api.createPackage({
        ...modalForm,
        price: Number(modalForm.price),
        duration: Number(modalForm.duration),
        max_travelers: Number(modalForm.max_travelers)
      });
      showToast('Package created!', 'success');
      setShowModal(false);
      setModalForm({ title: '', destination: '', description: '', price: '', duration: '', max_travelers: 20, category: 'beach', image_url: '', is_featured: false });
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const navItems = [
    { key: 'overview', icon: '📊', label: 'Overview' },
    { key: 'packages', icon: '📦', label: 'Packages' },
    { key: 'bookings', icon: '📋', label: 'Bookings' },
    { key: 'users', icon: '👥', label: 'Users' },
  ];

  if (loading) return <div className="loading-container" style={{ minHeight: '100vh' }}><div className="spinner"></div><p className="loading-text">Loading admin panel...</p></div>;
  if (loadError) return (
    <div className="empty-state" style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="icon">⚠️</div>
      <h3>Failed to load admin data</h3>
      <p>There was a problem connecting to the server. Please try again.</p>
      <button className="btn btn-primary" onClick={loadData}>Retry</button>
    </div>
  );

  return (
    <div className="admin-layout" id="admin-page">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h3>Admin Panel</h3>
        {navItems.map(item => (
          <button
            key={item.key}
            className={`admin-nav-item ${tab === item.key ? 'active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Overview */}
        {tab === 'overview' && stats && (
          <>
            <h1>Dashboard Overview</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--accent-gold)' }}>👥</div>
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(45,212,191,0.15)', color: 'var(--accent-teal)' }}>📦</div>
                <div className="stat-value">{stats.totalPackages}</div>
                <div className="stat-label">Travel Packages</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--info)' }}>📋</div>
                <div className="stat-value">{stats.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>💰</div>
                <div className="stat-value">{formatPrice(stats.totalRevenue)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.confirmedBookings}</div>
                <div className="stat-label">Confirmed Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--error)' }}>{stats.cancelledBookings}</div>
                <div className="stat-label">Cancelled Bookings</div>
              </div>
            </div>
          </>
        )}

        {/* Packages */}
        {tab === 'packages' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1>Manage Packages</h1>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Package</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Destination</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td>{p.destination}</td>
                    <td style={{ color: 'var(--accent-gold)' }}>{formatPrice(p.price)}</td>
                    <td>{p.duration} days</td>
                    <td><span className="package-card-badge" style={{ position: 'static' }}>{p.category}</span></td>
                    <td>⭐ {p.rating}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeletePackage(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <>
            <h1>All Bookings</h1>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Package</th>
                  <th>Travelers</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.user_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{b.user_email}</div>
                    </td>
                    <td>{b.package_title}</td>
                    <td>{b.travelers}</td>
                    <td>{new Date(b.travel_date).toLocaleDateString('en-IN')}</td>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{formatPrice(b.total_price)}</td>
                    <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Users */}
        {tab === 'users' && (
          <>
            <h1>User Management</h1>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`status-badge ${u.role === 'admin' ? 'status-confirmed' : 'status-completed'}`}>{u.role}</span></td>
                    <td>{u.phone || '—'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Create Package Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Package</h2>
            <form onSubmit={handleCreatePackage}>
              <div className="booking-form-group">
                <label>Title</label>
                <input type="text" value={modalForm.title} onChange={e => setModalForm({...modalForm, title: e.target.value})} required />
              </div>
              <div className="booking-form-group">
                <label>Destination</label>
                <input type="text" value={modalForm.destination} onChange={e => setModalForm({...modalForm, destination: e.target.value})} required />
              </div>
              <div className="booking-form-group">
                <label>Description</label>
                <textarea rows={3} value={modalForm.description} onChange={e => setModalForm({...modalForm, description: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="booking-form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={modalForm.price} onChange={e => setModalForm({...modalForm, price: e.target.value})} required />
                </div>
                <div className="booking-form-group">
                  <label>Duration (days)</label>
                  <input type="number" value={modalForm.duration} onChange={e => setModalForm({...modalForm, duration: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="booking-form-group">
                  <label>Category</label>
                  <select value={modalForm.category} onChange={e => setModalForm({...modalForm, category: e.target.value})}>
                    <option value="beach">Beach</option>
                    <option value="mountain">Mountain</option>
                    <option value="city">City</option>
                    <option value="cultural">Cultural</option>
                    <option value="adventure">Adventure</option>
                  </select>
                </div>
                <div className="booking-form-group">
                  <label>Max Travelers</label>
                  <input type="number" value={modalForm.max_travelers} onChange={e => setModalForm({...modalForm, max_travelers: e.target.value})} />
                </div>
              </div>
              <div className="booking-form-group">
                <label>Image URL</label>
                <input type="text" value={modalForm.image_url} onChange={e => setModalForm({...modalForm, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Package</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
