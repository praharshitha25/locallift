import { Link } from "react-router-dom";

const Navbar = () => {
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
          <Link
            to="/maker"
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-100 transition"
          >
            Maker
          </Link>

          <Link
            to="/shopkeeper"
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-100 transition"
          >
            Shopkeeper
          </Link>

          <Link
            to="/freelancer"
            className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm hover:bg-[#24563f] transition"
          >
            Freelancer
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;