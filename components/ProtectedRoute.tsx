
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppUser } from '../types';
import Spinner from './Spinner';

interface ProtectedRouteProps {
  allowedRoles: Array<AppUser['role']>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { appUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Spinner />
        <span className="sr-only">Authenticating...</span>
      </div>
    );
  }

  if (!appUser || !allowedRoles.includes(appUser.role)) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // login, which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
