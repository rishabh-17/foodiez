import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import RootSelector from './pages/RootSelector';
import AdminLoginPage from './pages/AdminLoginPage';
import RestaurantLoginPage from './pages/RestaurantLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminOrders from './pages/admin/AdminOrders';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantMenu from './pages/restaurant/RestaurantMenu';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootSelector />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/restaurant/login" element={<RestaurantLoginPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <AdminRestaurants />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <AdminOrders />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Restaurant Owner Protected Routes */}
          <Route
            path="/restaurant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <DashboardLayout>
                  <RestaurantDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/menu"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <DashboardLayout>
                  <RestaurantMenu />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/orders"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <DashboardLayout>
                  <RestaurantOrders />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
