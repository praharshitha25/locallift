import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import MakerDashboard from "./pages/maker/MakerDashboard";
import ShopDashboard from "./pages/shopkeeper/ShopDashboard";
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";
import Settlement from "./pages/Settlement";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/maker"
            element={
              <ProtectedRoute allowedRole="maker">
                <MakerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopkeeper"
            element={
              <ProtectedRoute allowedRole="shopkeeper">
                <ShopDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer"
            element={
              <ProtectedRoute allowedRole="freelancer">
                <FreelancerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settlement"
            element={
              <ProtectedRoute>
                <Settlement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
