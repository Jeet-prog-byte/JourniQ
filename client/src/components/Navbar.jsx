import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">✈</div>
          <span>JourniQ</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/packages" className={isActive('/packages')}>Packages</Link>
          {user && <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="navbar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.name?.split(' ')[0]}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>▼</span>
              
              <div className={`navbar-dropdown ${dropdownOpen ? 'open' : ''}`}>
                <Link to="/dashboard">📊 Dashboard</Link>
                <Link to="/dashboard#profile">👤 Profile</Link>
                {user.role === 'admin' && <Link to="/admin">⚙️ Admin Panel</Link>}
                {deferredPrompt && (
                  <button onClick={handleInstallClick}>📱 Install App</button>
                )}
                <div className="divider"></div>
                <button onClick={handleLogout}>🚪 Logout</button>
              </div>
            </div>
          ) : (
            <>
              {deferredPrompt && (
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={handleInstallClick}
                  style={{ marginRight: '8px' }}
                >
                  📱 Install App
                </button>
              )}
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          <div className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </nav>
  );
}
