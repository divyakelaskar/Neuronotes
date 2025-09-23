import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { refreshAccessToken } from './utils/refreshAccessToken.js';
import { decodeJWT } from './utils/decodeJwt.js'; // your custom util

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let logoutTimer;

    const handleLogout = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (isMounted) setAuthenticated(false);
    };

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const payload = decodeJWT(token);

        const isExpired = !payload || payload.exp * 1000 < Date.now();

        if (!isExpired) {
          if (isMounted) setAuthenticated(true);

          // Schedule auto-logout exactly when token expires
          const timeout = payload.exp * 1000 - Date.now();
          logoutTimer = setTimeout(handleLogout, timeout);
          return;
        }

        // Token expired → try refreshing
        const newToken = await refreshAccessToken();

        if (!newToken) {
          handleLogout();
        } else {
          localStorage.setItem('accessToken', newToken);
          if (isMounted) setAuthenticated(true);

          const newPayload = decodeJWT(newToken);
          const timeout = newPayload.exp * 1000 - Date.now();
          logoutTimer = setTimeout(handleLogout, timeout);
        }
      } catch (err) {
        console.error(err);
        handleLogout();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <Navigate to="/auth" replace />;

  return children;
};

export default ProtectedRoute;
