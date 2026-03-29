# JourniQ — Travel Plan Booking Management Application

A full-stack travel booking platform built with React + Vite (frontend) and Node.js + Express (backend).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+

### Setup & Run

**1. Backend Server (Terminal 1):**
```bash
cd server
npm install
npm run seed    # Seeds database with 12 travel packages + demo accounts
npm start       # Starts on http://localhost:5000
```

**2. Frontend Dev Server (Terminal 2):**
```bash
cd client
npm install
npm run dev     # Starts on http://localhost:5173
```

**3. Open the app:** [http://localhost:5173](http://localhost:5173)

---

## 🔑 Demo Accounts

| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | admin@journiq.com   | admin123 |
| User  | demo@journiq.com    | demo123  |

---

## 🏗️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, React Router v6   |
| Styling  | Vanilla CSS (custom properties)   |
| State    | React Context API + useReducer    |
| Backend  | Node.js, Express.js               |
| Database | SQLite (sql.js)                   |
| Auth     | JWT (jsonwebtoken + bcryptjs)     |

---

## 📁 Project Structure

```
JourniQ/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Navbar, Footer, PackageCard, ProtectedRoute
│   │   ├── context/     # AuthContext (JWT state management)
│   │   ├── pages/       # Home, Packages, PackageDetails, Login, Register, Dashboard, AdminPanel
│   │   ├── services/    # API service layer
│   │   └── styles/      # Design system CSS
│   └── index.html
├── server/              # Express backend
│   ├── config/          # Database setup
│   ├── controllers/     # Business logic
│   ├── middleware/       # JWT auth middleware
│   ├── routes/          # API routes
│   ├── seed.js          # Database seeder
│   └── server.js        # Entry point
└── journiq.db           # SQLite database file
```

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Get profile (auth required)
- `PUT /api/auth/profile` — Update profile (auth required)

### Packages
- `GET /api/packages` — List packages (supports `?search=`, `?category=`, `?max_price=`, `?sort=`)
- `GET /api/packages/featured` — Featured packages
- `GET /api/packages/:id` — Package details

### Bookings
- `POST /api/bookings` — Create booking (auth required)
- `GET /api/bookings` — My bookings (auth required)
- `PUT /api/bookings/:id/cancel` — Cancel booking (auth required)

### Reviews
- `GET /api/reviews/:packageId` — Package reviews
- `POST /api/reviews` — Add review (auth required)

### Admin (auth + admin role required)
- `GET /api/admin/stats` — Dashboard statistics
- `GET /api/admin/bookings` — All bookings
- `GET /api/admin/users` — All users
- `POST /api/admin/packages` — Create package
- `PUT /api/admin/packages/:id` — Update package
- `DELETE /api/admin/packages/:id` — Delete package

---

## 💰 Pricing
All prices are in **Indian Rupees (₹/INR)**, ranging from ₹19,999 to ₹1,49,999 per person.

---

## 📱 Features
- ✅ User registration & JWT authentication
- ✅ Browse 12+ curated travel packages
- ✅ Search, filter by category/price/duration, and sort
- ✅ Detailed package pages with gallery, itinerary, reviews
- ✅ Booking with traveler count and date selection
- ✅ User dashboard with booking management & profile
- ✅ Admin panel with CRUD operations and analytics
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark theme with glassmorphism UI
