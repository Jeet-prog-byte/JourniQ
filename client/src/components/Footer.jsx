import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '4px' }}>
              <div className="logo-icon">✈</div>
              <span>JourniQ</span>
            </Link>
            <p>Discover the world's most breathtaking destinations with our curated travel packages. Your journey to extraordinary experiences starts here.</p>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>
            <Link to="/packages">All Packages</Link>
            <Link to="/packages?category=beach">Beach Getaways</Link>
            <Link to="/packages?category=mountain">Mountains</Link>
            <Link to="/packages?category=cultural">Cultural Tours</Link>
            <Link to="/packages?category=adventure">Adventures</Link>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <Link to="/">About Us</Link>
            <Link to="/">Careers</Link>
            <Link to="/">Blog</Link>
            <Link to="/">Press</Link>
            <Link to="/">Partners</Link>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <Link to="/">Help Center</Link>
            <Link to="/">Contact Us</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
            <Link to="/">FAQs</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 JourniQ. All rights reserved.</p>
          <p>Made with ❤️ for travelers worldwide</p>
        </div>
      </div>
    </footer>
  );
}
