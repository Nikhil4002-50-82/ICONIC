import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import supabase from '../utils/supabase'; // Ensure Supabase is initialized

function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.session);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div className="text-center">Loading...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/get-started" />;
}

export default ProtectedRoute;
