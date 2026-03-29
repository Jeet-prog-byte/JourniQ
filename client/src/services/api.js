const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('journiq_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Packages
  getPackages: (params = '') => request(`/packages${params ? '?' + params : ''}`),
  getFeaturedPackages: () => request('/packages/featured'),
  getPackageById: (id) => request(`/packages/${id}`),

  // Bookings
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBookings: () => request('/bookings'),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),

  // Reviews
  getReviews: (packageId) => request(`/reviews/${packageId}`),
  addReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getStats: () => request('/admin/stats'),
  getAllBookings: () => request('/admin/bookings'),
  getAllUsers: () => request('/admin/users'),
  createPackage: (data) => request('/admin/packages', { method: 'POST', body: JSON.stringify(data) }),
  updatePackage: (id, data) => request(`/admin/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePackage: (id) => request(`/admin/packages/${id}`, { method: 'DELETE' }),
};
