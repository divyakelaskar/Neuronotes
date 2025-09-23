import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { refreshAccessToken } from './utils/refreshAccessToken.js';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = await refreshAccessToken();
      setAuthenticated(!!token);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <Navigate to="/auth" />;
  return children;
};

export default ProtectedRoute;
