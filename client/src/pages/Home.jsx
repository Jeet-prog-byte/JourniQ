import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PackageCard from '../components/PackageCard';

const testimonials = [
  { name: 'Ananya Gupta', location: 'Mumbai', text: 'JourniQ made our Bali trip absolutely magical! Every detail was perfectly arranged. The luxury villa was beyond expectations.', rating: 5 },
  { name: 'Vikram Singh', location: 'Delhi', text: 'The Ladakh expedition was life-changing. The team handled everything from permits to camping. Truly a once-in-a-lifetime experience!', rating: 5 },
  { name: 'Meera Nair', location: 'Kochi', text: 'Booked the Kerala Backwaters package for our anniversary. The houseboat was dreamy and the Ayurvedic spa was heavenly. Thank you JourniQ!', rating: 5 },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [searchDest, setSearchDest] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getFeaturedPackages().then(setFeatured).catch(console.error);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchDest) params.set('search', searchDest);
    if (searchCategory) params.set('category', searchCategory);
    if (searchBudget) params.set('max_price', searchBudget);
    navigate(`/packages?${params.toString()}`);
  };

  return (
    <div id="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600&q=80" alt="Beautiful tropical beach" />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">✨ India's #1 Curated Travel Platform</div>
            <h1>
              Explore the World's Most <span className="highlight">Extraordinary</span> Destinations
            </h1>
            <p>
              Discover handcrafted travel experiences that take you beyond the ordinary. 
              From serene beaches to majestic mountains, every journey is designed to create 
              memories that last a lifetime.
            </p>
            <div className="hero-actions">
              <Link to="/packages" className="btn btn-primary btn-lg">Explore Packages</Link>
              <Link to="/register" className="btn btn-secondary btn-lg">Start Your Journey</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="number">500+</div>
                <div className="label">Happy Travelers</div>
              </div>
              <div className="hero-stat">
                <div className="number">50+</div>
                <div className="label">Destinations</div>
              </div>
              <div className="hero-stat">
                <div className="number">4.8</div>
                <div className="label">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-bar" id="search-bar">
          <div className="search-field">
            <label>Destination</label>
            <input 
              type="text" 
              placeholder="Where do you want to go?" 
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="search-divider"></div>
          <div className="search-field">
            <label>Category</label>
            <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="beach">🏖️ Beach</option>
              <option value="mountain">🏔️ Mountain</option>
              <option value="city">🏙️ City</option>
              <option value="cultural">🏛️ Cultural</option>
              <option value="adventure">🧗 Adventure</option>
            </select>
          </div>
          <div className="search-divider"></div>
          <div className="search-field">
            <label>Budget</label>
            <select value={searchBudget} onChange={(e) => setSearchBudget(e.target.value)}>
              <option value="">Any Budget</option>
              <option value="25000">Under ₹25,000</option>
              <option value="75000">Up to ₹75,000</option>
              <option value="125000">Up to ₹1,25,000</option>
              <option value="200000">Up to ₹2,00,000</option>
            </select>
          </div>
          <button className="search-btn" onClick={handleSearch}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* Featured Packages */}
      <section className="section" id="featured-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">Featured Destinations</h2>
            <p className="section-subtitle">Handpicked travel experiences loved by our travelers</p>
          </div>
          <div className="packages-grid">
            {featured.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/packages" className="btn btn-secondary btn-lg">View All Packages →</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section" style={{ background: 'var(--primary-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">Why Choose JourniQ</h2>
            <p className="section-subtitle">We make travel planning effortless and extraordinary</p>
          </div>
          <div className="stats-grid">
            {[
              { icon: '🎯', title: 'Curated Experiences', desc: 'Every package is handcrafted by travel experts with years of local knowledge.' },
              { icon: '💰', title: 'Best Value', desc: 'Transparent pricing in INR with no hidden charges. Get the best deals guaranteed.' },
              { icon: '🛡️', title: 'Safe & Secure', desc: 'Your bookings are protected with our secure payment system and 24/7 support.' },
              { icon: '⭐', title: 'Top Rated', desc: '4.8/5 average rating from 500+ verified travelers. Read real reviews before booking.' },
            ].map((item, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-icon" style={{ background: 'var(--surface)', fontSize: '2rem' }}>{item.icon}</div>
                <div className="stat-value" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.title}</div>
                <div className="stat-label" style={{ lineHeight: '1.6' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" id="testimonials-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">What Our Travelers Say</h2>
            <p className="section-subtitle">Real stories from real travelers who explored with JourniQ</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-author-avatar">{t.name.charAt(0)}</div>
                  <div className="testimonial-author-info">
                    <h4>{t.name}</h4>
                    <p>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(45,212,191,0.1))', textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Ready for Your Next Adventure?</h2>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '16px auto 36px' }}>
            Join thousands of happy travelers who have discovered extraordinary destinations with JourniQ.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">Get Started — It's Free</Link>
        </div>
      </section>
    </div>
  );
}
