import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { Navigate } from "react-router-dom";
import supabase from "../../utils/supabase";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole(profile?.role);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (role && userRole !== role) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
