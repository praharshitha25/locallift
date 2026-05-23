import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";

import Login from "./pages/auth/Login";

import MakerDashboard from "./pages/maker/MakerDashboard";
import ShopDashboard from "./pages/shopkeeper/ShopDashboard";
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/maker" element={<MakerDashboard />} />

        <Route path="/shopkeeper" element={<ShopDashboard />} />

        <Route path="/freelancer" element={<FreelancerDashboard />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;