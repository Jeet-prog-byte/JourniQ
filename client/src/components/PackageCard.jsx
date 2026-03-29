import { useNavigate } from 'react-router-dom';

export default function PackageCard({ pkg }) {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '★'.repeat(full);
    if (half) stars += '½';
    return stars;
  };

  return (
    <div className="package-card" onClick={() => navigate(`/packages/${pkg.id}`)} id={`package-card-${pkg.id}`}>
      <div className="package-card-image">
        <img src={pkg.image_url} alt={pkg.title} loading="lazy" />
        <span className="package-card-badge">{pkg.category}</span>
        {pkg.is_featured === 1 && <span className="package-card-featured">★ Featured</span>}
        <div className="package-card-price">
          {formatPrice(pkg.price)} <span>/ person</span>
        </div>
      </div>
      <div className="package-card-content">
        <h3>{pkg.title}</h3>
        <div className="package-card-location">
          📍 {pkg.destination}
        </div>
        <div className="package-card-meta">
          <div className="package-card-meta-item">
            🕒 {pkg.duration} Days
          </div>
          <div className="package-card-meta-item">
            👥 Max {pkg.max_travelers}
          </div>
          <div className="package-card-rating">
            <span className="stars">{renderStars(pkg.rating)}</span>
            {pkg.rating}
          </div>
        </div>
      </div>
    </div>
  );
}
