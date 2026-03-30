import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import PackageCard from '../components/PackageCard';

const categories = [
  { value: '', label: 'All' },
  { value: 'beach', label: '🏖️ Beach' },
  { value: 'mountain', label: '🏔️ Mountain' },
  { value: 'city', label: '🏙️ City' },
  { value: 'cultural', label: '🏛️ Cultural' },
  { value: 'adventure', label: '🧗 Adventure' },
];

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('max_price')) || 200000);
  const [sort, setSort] = useState('');

  useEffect(() => {
    fetchPackages();
  }, [category, sort, maxPrice]);

  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    const m = searchParams.get('max_price');
    if (s) setSearch(s);
    if (c) setCategory(c);
    if (m) setMaxPrice(Number(m));
  }, [searchParams]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (maxPrice < 200000) params.set('max_price', maxPrice);
      if (sort) params.set('sort', sort);
      
      const data = await api.getPackages(params.toString());
      setPackages(data || []);
    } catch (err) {
      console.error(err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchPackages();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMaxPrice(200000);
    setSort('');
    setSearchParams({});
  };

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="dashboard" id="packages-page">
      <div className="container">
        <div className="dashboard-header" style={{ marginBottom: '24px' }}>
          <div>
            <h1>Travel Packages</h1>
            <p className="welcome">Discover your next destination from our curated collection</p>
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            {packages.length} packages found
          </div>
        </div>

        <div className="packages-layout">
          {/* Filter Panel */}
          <div className="filter-panel" id="filter-panel">
            <h3>🔍 Filters</h3>

            <div className="filter-group">
              <label>Search</label>
              <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder="Search destinations..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <div className="filter-categories">
                {categories.map(c => (
                  <button 
                    key={c.value}
                    className={`filter-category ${category === c.value ? 'active' : ''}`}
                    onClick={() => setCategory(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Max Budget: {formatINR(maxPrice)}</label>
              <input 
                type="range" 
                min="10000" 
                max="200000" 
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="range-values">
                <span>₹10,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="duration">Duration</option>
              </select>
            </div>

            <div className="filter-actions">
              <button className="btn btn-primary btn-sm" onClick={handleSearch}>Apply</button>
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
            </div>
          </div>

          {/* Package Grid */}
          <div>
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading packages...</p>
              </div>
            ) : fetchError ? (
              <div className="empty-state">
                <div className="icon">⚠️</div>
                <h3>Could not load packages</h3>
                <p>There was a problem connecting to the server. Please try again.</p>
                <button className="btn btn-primary" onClick={fetchPackages}>Retry</button>
              </div>
            ) : packages.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No packages found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
                <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="packages-grid">
                {packages.map(pkg => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
