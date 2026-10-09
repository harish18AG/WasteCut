import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layouts & Guards
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Admin Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';

// Donor Dashboards
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorDonate from './pages/donor/DonorDonate';
import DonorHistory from './pages/donor/DonorHistory';

// NGO Dashboards
import NgoDashboard from './pages/ngo/NgoDashboard';
import NgoNearby from './pages/ngo/NgoNearby';
import NgoPickups from './pages/ngo/NgoPickups';

// Recipient Dashboards
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import RecipientBrowse from './pages/recipient/RecipientBrowse';
import RecipientRequests from './pages/recipient/RecipientRequests';

export const App: React.FC = () => {
  const { restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Secured Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="feedback" element={<AdminDashboard />} />
          <Route path="reports" element={<AdminDashboard />} />
        </Route>

        {/* Donor Secured Dashboard */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute allowedRoles={['DONOR']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DonorDashboard />} />
          <Route path="donate" element={<DonorDonate />} />
          <Route path="history" element={<DonorHistory />} />
        </Route>

        {/* NGO Secured Dashboard */}
        <Route
          path="/ngo"
          element={
            <ProtectedRoute allowedRoles={['NGO']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<NgoDashboard />} />
          <Route path="nearby" element={<NgoNearby />} />
          <Route path="pickups" element={<NgoPickups />} />
        </Route>

        {/* Recipient Secured Dashboard */}
        <Route
          path="/recipient"
          element={
            <ProtectedRoute allowedRoles={['RECIPIENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RecipientDashboard />} />
          <Route path="browse" element={<RecipientBrowse />} />
          <Route path="requests" element={<RecipientRequests />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
