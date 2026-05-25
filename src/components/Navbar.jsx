import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { clearDemoAuth, getDemoAuth } from "../auth/demoAuth";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [demoUser, setDemoUser] = useState(getDemoAuth());
  const navigate = useNavigate();

  useEffect(() => {
    const syncDemoUser = () => setDemoUser(getDemoAuth());
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));

    window.addEventListener("storage", syncDemoUser);
    window.addEventListener("local-lift-demo-auth", syncDemoUser);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", syncDemoUser);
      window.removeEventListener("local-lift-demo-auth", syncDemoUser);
    };
  }, []);

  const handleLogout = async () => {
    clearDemoAuth();
    if (user) {
      try {
        await signOut(auth);
      } catch (err) {
        // ignore sign out errors, demo auth cleared anyway
      }
    }
    navigate("/");
  };

  return (
    <nav className="w-full border-b bg-[#FAFAF8]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="text-2xl font-bold text-[#2D6A4F]"
        >
          LocalLift
        </Link>

        <div className="flex items-center gap-3">
          {user || demoUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm hover:bg-[#24563f] transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login?role=maker"
                className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-100 transition"
              >
                Maker
              </Link>

              <Link
                to="/login?role=shopkeeper"
                className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-100 transition"
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
