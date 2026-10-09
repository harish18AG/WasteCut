import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'DONOR' | 'NGO' | 'RECIPIENT')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default page based on role if unauthorized
    const defaultPaths = {
      ADMIN: '/admin',
      DONOR: '/donor',
      NGO: '/ngo',
      RECIPIENT: '/recipient',
    };
    return <Navigate to={defaultPaths[user.role] || '/'} replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
