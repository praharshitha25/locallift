import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, Home, LayoutDashboard } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { getDashboardPath, useAuth } from "../auth/AuthContext";

const pageTitles = {
  "/": "Home",
  "/login": "Login",
  "/maker": "Maker Dashboard",
  "/shopkeeper": "Shop Dashboard",
  "/freelancer": "Freelancer Dashboard",
  "/settlement": "Settlement",
};

const Navbar = () => {
  const { currentUser, userDoc } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const historyState = window.history.state;
    setCanGoBack(typeof historyState === "object" && historyState?.idx > 0);
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      // Keep navigation responsive even if Firebase has already cleared the session.
    }
    navigate("/");
  };

  const currentDashboardPath = userDoc ? getDashboardPath(userDoc.role) : "/";
  const pageTitle = pageTitles[location.pathname] || "LocalLift";
  const showBackButton = location.pathname !== "/" && location.pathname !== "/login";
  const roleLabel = userDoc?.role ? userDoc.role.charAt(0).toUpperCase() + userDoc.role.slice(1) : "";

  return (
    <nav className="w-full border-b bg-[#FAFAF8]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {showBackButton && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={!canGoBack}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}

          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-[#2D6A4F]">
            <Home size={22} />
            LocalLift
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="rounded-full bg-[#ECF9EE] px-3 py-1 font-semibold text-[#2D6A4F]">
              {pageTitle}
            </span>
            {roleLabel && <span className="rounded-full border border-[#D1E7D4] px-3 py-1 text-[#2D6A4F]">{roleLabel}</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentUser ? (
            <>
              <Link
                to={currentDashboardPath}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2D6A4F] px-4 py-2 text-sm text-[#2D6A4F] hover:bg-[#E8F5EC] transition"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              <Link
                to="/settlement"
                className="px-4 py-2 rounded-xl border text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Settlements
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm hover:bg-[#24563f] transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login?role=maker"
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm hover:bg-[#24563f] transition"
              >
                Maker
              </Link>

              <Link
                to="/login?role=shopkeeper"
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm hover:bg-[#24563f] transition"
              >
                Shopkeeper
              </Link>

              <Link
                to="/login?role=freelancer"
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm hover:bg-[#24563f] transition"
              >
                Freelancer
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
