import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import DoctorDashboard from "./components/DoctorDashboard";
import UserDashboard from "./components/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import { registerServiceWorker } from "./serviceWorkerRegistration";
import { useEffect } from "react";


function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
