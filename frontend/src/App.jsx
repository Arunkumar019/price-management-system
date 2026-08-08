import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComponentsPage from './pages/ComponentsPage';
import ConfigBuilderPage from './pages/ConfigBuilderPage';
import ConfigurationsPage from './pages/ConfigurationsPage';
import ConfigDetailPage from './pages/ConfigDetailPage';
import ConfigEditPage from './pages/ConfigEditPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/components" element={<ComponentsPage />} />
            <Route path="/builder" element={<ConfigBuilderPage />} />
            <Route path="/configurations" element={<ConfigurationsPage />} />
            <Route path="/configurations/:id" element={<ConfigDetailPage />} />
            <Route path="/configurations/:id/edit" element={<ConfigEditPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
