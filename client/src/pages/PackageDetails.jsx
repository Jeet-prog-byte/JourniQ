import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [travelers, setTravelers] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [specialReqs, setSpecialReqs] = useState('');
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const [pkgData, reviewData] = await Promise.all([
        api.getPackageById(id),
        api.getReviews(id)
      ]);
      setPkg(pkgData);
      setReviews(reviewData || []);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!travelDate) {
      showToast('Please select a travel date', 'error');
      return;
    }
    try {
      setBooking(true);
      await api.createBooking({
        package_id: parseInt(id),
        travelers,
        travel_date: travelDate,
        special_requests: specialReqs
      });
      showToast('Booking confirmed! Check your dashboard.', 'success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      setSubmittingReview(true);
      await api.addReview({ package_id: parseInt(id), ...reviewForm });
      showToast('Review added!', 'success');
      setReviewForm({ rating: 5, comment: '' });
      const updated = await api.getReviews(id);
      setReviews(updated);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div className="loading-container" style={{ minHeight: '100vh' }}><div className="spinner"></div><p className="loading-text">Loading package...</p></div>;
  if (loadError) return (
    <div className="empty-state" style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="icon">⚠️</div>
      <h3>Unable to load package</h3>
      <p>There was a problem connecting. Please try again.</p>
      <button className="btn btn-primary" onClick={loadData}>Retry</button>
    </div>
  );
  if (!pkg) return <div className="empty-state" style={{ minHeight: '100vh', paddingTop: '120px' }}><div className="icon">🔍</div><h3>Package not found</h3><p>This package may have been removed or the link is incorrect.</p></div>;

  const gallery = Array.isArray(pkg.gallery) ? pkg.gallery : [];
  const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  const included = Array.isArray(pkg.included) ? pkg.included : [];

  return (
    <div id="package-details-page">
      {/* Hero */}
      <div className="detail-hero">
        <img src={gallery[activeImg] || pkg.image_url} alt={pkg.title} />
        <div className="detail-hero-content">
          <div className="container">
            <span className="package-card-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>{pkg.category}</span>
            <h1>{pkg.title}</h1>
            <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px' }}>
              <span>📍 {pkg.destination}</span>
              <span>🕒 {pkg.duration} Days</span>
              <span>⭐ {pkg.rating}/5</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="detail-gallery" style={{ marginTop: '24px' }}>
            {gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${pkg.title} ${i + 1}`}
                className={i === activeImg ? 'active' : ''}
                onClick={() => setActiveImg(i)}
              />
            ))}
          </div>
        )}

        <div className="detail-layout">
          {/* Main Content */}
          <div>
            <div className="detail-section">
              <h2>📝 About This Trip</h2>
              <p className="detail-description">{pkg.description}</p>
            </div>

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <div className="detail-section">
                <h2>🗓️ Day-by-Day Itinerary</h2>
                <div className="itinerary-list">
                  {itinerary.map((item, i) => (
                    <div className="itinerary-item" key={i}>
                      <div className="itinerary-day">
                        <span className="day-label">Day</span>
                        <span className="day-num">{item.day}</span>
                      </div>
                      <div className="itinerary-content">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included */}
            {included.length > 0 && (
              <div className="detail-section">
                <h2>✅ What's Included</h2>
                <div className="included-grid">
                  {included.map((item, i) => (
                    <div className="included-item" key={i}>
                      <span className="check">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="detail-section">
              <h2>💬 Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((r, i) => (
                    <div className="review-card" key={i}>
                      <div className="review-header">
                        <div className="review-author">
                          <div className="review-avatar">{r.user_name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.user_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</div>
                          </div>
                        </div>
                        <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      </div>
                      <p className="review-text">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
              )}

              {/* Add Review */}
              {user && (
                <form onSubmit={handleReview} style={{ marginTop: '24px', background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: '16px' }}>Write a Review</h4>
                  <div className="booking-form-group">
                    <label>Rating</label>
                    <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>)}
                    </select>
                  </div>
                  <div className="booking-form-group">
                    <label>Your Review</label>
                    <textarea
                      rows={3}
                      placeholder="Share your experience..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <button className="btn btn-teal btn-sm" type="submit" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="booking-sidebar" id="booking-sidebar">
            <div className="booking-sidebar-price">
              <span className="amount">{formatPrice(pkg.price)}</span>
              <span className="per">/ person</span>
            </div>

            <div className="booking-form-group">
              <label>Travel Date</label>
              <input 
                type="date" 
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="booking-form-group">
              <label>Number of Travelers</label>
              <select value={travelers} onChange={(e) => setTravelers(Number(e.target.value))}>
                {Array.from({ length: Math.min(pkg.max_travelers, 10) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Traveler' : 'Travelers'}</option>
                ))}
              </select>
            </div>

            <div className="booking-form-group">
              <label>Special Requests (optional)</label>
              <textarea
                rows={3}
                placeholder="Any dietary preferences, mobility needs, etc."
                value={specialReqs}
                onChange={(e) => setSpecialReqs(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="booking-summary">
              <div className="booking-summary-row">
                <span>{formatPrice(pkg.price)} × {travelers} {travelers === 1 ? 'person' : 'people'}</span>
                <span>{formatPrice(pkg.price * travelers)}</span>
              </div>
              <div className="booking-summary-row">
                <span>Service Fee</span>
                <span>₹0</span>
              </div>
              <div className="booking-summary-row total">
                <span>Total</span>
                <span>{formatPrice(pkg.price * travelers)}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              onClick={handleBook}
              disabled={booking}
            >
              {booking ? 'Booking...' : user ? 'Confirm Booking' : 'Sign In to Book'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                🔒 Secure booking · Free cancellation
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
