# 💻 Laptop Configuration & Pricing Management System

A production-ready Enterprise Laptop Configuration & Pricing Management System built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic**, **MySQL/SQLite**, **JWT Authentication**, and **React.js**.

---

## 🌟 Key Features

- **🔐 JWT Authentication & Security**: Secure login system with bcrypt password hashing and token validation. Default admin (`admin@gmail.com` / `admin123`) is automatically created on DB startup if empty.
- **💻 Interactive Laptop Builder**: Select custom hardware components across 8 categories:
  - Processor
  - RAM
  - Storage
  - Graphics Card
  - Display
  - Battery
  - Keyboard
  - Operating System
- **⚡ Automatic Price Calculation & Live Breakdown**: Dynamic total calculation as components are selected or changed.
- **🛡️ Historical Price Preservation**: When a configuration is saved, a snapshot of every selected component's price is stored. If component prices change later in the catalog, saved configurations preserve their original prices.
- **📊 Real-time Dashboard**: Overview of Total Components, Total Configurations, Total Saved Configuration Value, and Latest Saved Configurations.
- **🛠️ Component Catalog CRUD**: Manage hardware components with strict validations (price cannot be negative, component names must be unique within a category).
- **🎨 Glassmorphic Responsive UI**: Built with React Router, Axios, React Hook Form, React Icons, and a custom CSS design system.

---

## 📁 Project Structure

```text
price management system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── components.py
│   │   │   ├── configurations.py
│   │   │   └── dashboard.py
│   │   ├── services/
│   │   │   └── pricing.py
│   │   ├── utils/
│   │   │   └── security.py
│   │   ├── middleware/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── alembic.ini
│   ├── .env
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteModal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ToastNotification.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── ComponentsPage.jsx
│   │   │   ├── ConfigBuilderPage.jsx
│   │   │   ├── ConfigDetailPage.jsx
│   │   │   ├── ConfigEditPage.jsx
│   │   │   ├── ConfigurationsPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework.
- **SQLAlchemy ORM**: Database mapping and queries.
- **Pydantic**: Request/response validation & settings management.
- **MySQL / SQLite**: Database storage (SQLite default for instant zero-config run; MySQL fully supported via `DATABASE_URL`).
- **Passlib & PyJWT**: Security and token creation.
- **Uvicorn**: ASGI web server.

### Frontend
- **React 18 & Vite**: Fast UI library and modern build tool.
- **React Router 6**: Client-side routing with protected layout guards.
- **React Hook Form**: Form validation and submission handling.
- **React Icons**: Modern icon suite.
- **Axios**: HTTP client with request/response interceptors.
- **Vanilla CSS**: Custom glassmorphism design system.

---

## 🚀 Quick Setup & Installation

### 1. Backend Setup

1. Open terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=sqlite:///./laptop_pricing.db
   SECRET_KEY=super-secret-laptop-pricing-system-key-2026-secure-jwt
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```
   *(For MySQL, update `DATABASE_URL` to `mysql+pymysql://user:password@localhost:3306/laptop_pricing_db`)*

5. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will run on `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install Node.js packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at `http://localhost:5173`.

---

## 🔑 Default Administrator Credentials

Upon starting the backend for the first time, default seed data and admin account will be automatically generated:

- **Email**: `admin@gmail.com`
- **Password**: `admin123`

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT token |
| `GET` | `/api/auth/me` | Retrieve current authenticated user profile |
| `GET` | `/api/components` | List hardware components (filterable by search & category) |
| `POST` | `/api/components` | Create new hardware component (category uniqueness & non-negative price enforced) |
| `PUT` | `/api/components/{id}` | Update existing hardware component |
| `DELETE` | `/api/components/{id}` | Delete hardware component |
| `GET` | `/api/configurations` | List all saved laptop configurations |
| `POST` | `/api/configurations` | Save new laptop configuration with historical price snapshot |
| `POST` | `/api/configurations/preview` | Preview configuration cost breakdown without saving |
| `GET` | `/api/configurations/{id}` | Get full details of saved configuration & locked snapshots |
| `PUT` | `/api/configurations/{id}` | Update configuration and re-snapshot prices |
| `DELETE` | `/api/configurations/{id}` | Delete laptop configuration |
| `GET` | `/api/dashboard` | Get summary metrics (totals, saved value, recent builds) |
