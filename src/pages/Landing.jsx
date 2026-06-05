import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  Store,
  Package,
  Video,
  ArrowRight,
  MapPin,
  Handshake,
  Sparkles,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="bg-gradient-to-b from-[#F3FAF5] via-[#ECF8EF] to-[#FAFAF8] text-[#1A1A1A] min-h-screen">

      <Navbar />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-14 items-center bg-[#ECF9F0] rounded-[40px] shadow-[0_20px_90px_rgba(45,106,79,0.12)]">

        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F5EC] text-[#2D6A4F] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MapPin size={16} />
            Hyperlocal Commerce Network
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Lift Your
            <span className="text-[#2D6A4F]"> Neighborhood Economy</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
            Connect nearby makers, retailers, and creators through a
            hyperlocal commerce network built for collaboration,
            visibility, and local growth.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/login"
              className="bg-[#2D6A4F] hover:bg-[#24563f] text-white px-6 py-3 rounded-2xl font-medium transition"
            >
              Get Started
            </Link>

            <a
              href="#how-it-works"
              className="border border-gray-300 hover:bg-white px-6 py-3 rounded-2xl font-medium transition flex items-center gap-2"
            >
              See How It Works
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="relative">
          <div className="bg-gradient-to-br from-white via-[#F2FBF4] to-[#ECF9EE] rounded-3xl shadow-xl p-8 border border-[#D1E7D4]">

            <div className="space-y-5">

              <div className="flex items-center justify-between bg-[#F4A261]/10 p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  <Package className="text-[#F4A261]" />
                  <div>
                    <h3 className="font-semibold">Sarah's Resin Coasters</h3>
                    <p className="text-sm text-gray-500">
                      Delivered to Cornerstone Gifts
                    </p>
                  </div>
                </div>

                <span className="text-sm font-medium text-[#2D6A4F]">
                  Active
                </span>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between bg-[#2D6A4F]/10 p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  <Store className="text-[#2D6A4F]" />
                  <div>
                    <h3 className="font-semibold">Cornerstone Gifts</h3>
                    <p className="text-sm text-gray-500">
                      Selling local handmade products
                    </p>
                  </div>
                </div>

                <span className="text-sm font-medium text-[#2D6A4F]">
                  20 Sold
                </span>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between bg-[#52B788]/10 p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  <Video className="text-[#52B788]" />
                  <div>
                    <h3 className="font-semibold">Alex's Promo Reel</h3>
                    <p className="text-sm text-gray-500">
                      Instagram reach boosted locally
                    </p>
                  </div>
                </div>

                <span className="text-sm font-medium text-[#2D6A4F]">
                  Trending
                </span>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* PROBLEM SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-[#F4FBF4] rounded-[40px] shadow-[0_20px_60px_rgba(45,106,79,0.06)]">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Built For Real Local Problems
          </h2>

          <p className="text-gray-600 text-lg">
            Every role in the neighborhood economy struggles alone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-[#F7FBF6] p-8 rounded-3xl shadow-sm border border-[#D9E8D9]">
            <Package className="text-[#F4A261] mb-5" size={34} />

            <p className="text-gray-600 leading-relaxed">
              Home-based creators often lack visibility,
              shelf space, and affordable marketing.
            </p>
          </div>

          <div className="bg-[#F7FBF6] p-8 rounded-3xl shadow-sm border border-[#D9E8D9]">
            <Store className="text-[#2D6A4F] mb-5" size={34} />

            <h3 className="text-2xl font-semibold mb-4">
              Shopkeepers
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Local stores struggle to compete with generic
              supermarket inventory and online platforms.
            </p>
          </div>

          <div className="bg-[#F7FBF6] p-8 rounded-3xl shadow-sm border border-[#D9E8D9]">
            <Video className="text-[#52B788] mb-5" size={34} />

            <h3 className="text-2xl font-semibold mb-4">
              Freelancers
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Creative freelancers need paid gigs,
              portfolio work, and local business opportunities.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#ECF9F0] py-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              How It Works
            </h2>

            <p className="text-gray-600 text-lg">
              A simple 3-step ecosystem for local collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-6">
                <Handshake className="text-[#2D6A4F]" size={34} />
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Discover
              </h3>

              <p className="text-gray-600">
                Makers, retailers, and creators connect within
                a 5-10 mile local ecosystem.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#FFF1E6] flex items-center justify-center mx-auto mb-6">
                <Package className="text-[#F4A261]" size={34} />
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Consign
              </h3>

              <p className="text-gray-600">
                Products are placed on shelves through a
                risk-free digital consignment ledger.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#EAFBF3] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-[#52B788]" size={34} />
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Grow
              </h3>

              <p className="text-gray-600">
                Freelancers promote products locally and
                help businesses increase visibility and sales.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* LOOP SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 bg-[#F5FBF6] rounded-[40px] shadow-[0_20px_60px_rgba(45,106,79,0.06)]">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            A Self-Sustaining Local Economy
          </h2>

          <p className="text-gray-600 text-lg">
            Every successful sale strengthens all three sides of the network.
          </p>
        </div>

        <div className="bg-[#F7FBF6] rounded-3xl border border-[#D9E8D9] shadow-sm p-10">

          <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 items-center">

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#FFF1E6] mx-auto mb-5 flex items-center justify-center">
                <Package className="text-[#F4A261]" size={38} />
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Sarah
              </h3>

              <p className="text-gray-500">
                Local Maker
              </p>
            </div>

            <ArrowRight className="hidden md:block text-[#2D6A4F]" size={30} />

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#E8F5EC] mx-auto mb-5 flex items-center justify-center">
                <Store className="text-[#2D6A4F]" size={38} />
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Mr. Davis
              </h3>

              <p className="text-gray-500">
                Neighborhood Shopkeeper
              </p>
            </div>

            <ArrowRight className="hidden md:block text-[#2D6A4F]" size={30} />

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#EAFBF3] mx-auto mb-5 flex items-center justify-center">
                <Video className="text-[#52B788]" size={38} />
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Alex
              </h3>

              <p className="text-gray-500">
                Media Freelancer
              </p>
            </div>

          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border bg-[#FAFAF8] px-5 py-3 text-sm font-medium text-[#2D6A4F]">
              <span>Sarah</span>
              <ArrowRight size={16} />
              <span>Mr. Davis</span>
              <ArrowRight size={16} />
              <span>Alex</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="bg-[#EDF9EE] py-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Who Is This For?
            </h2>

            <p className="text-gray-600 text-lg">
              Designed for people building local economies together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="border border-[#D9E8D9] bg-[#F8FCF8] rounded-3xl p-8 hover:shadow-md transition">
              <h3 className="text-2xl font-semibold mb-4">
                Home-preneurs
              </h3>

              <p className="text-gray-600">
                Sell handmade goods without needing
                your own storefront.
              </p>
            </div>

            <div className="border border-[#D9E8D9] bg-[#F8FCF8] rounded-3xl p-8 hover:shadow-md transition">
              <h3 className="text-2xl font-semibold mb-4">
                Local Retailers
              </h3>

              <p className="text-gray-600">
                Fill shelves with unique local inventory
                and attract nearby customers.
              </p>
            </div>

            <div className="border border-[#D9E8D9] bg-[#F8FCF8] rounded-3xl p-8 hover:shadow-md transition">
              <h3 className="text-2xl font-semibold mb-4">
                Creative Freelancers
              </h3>

              <p className="text-gray-600">
                Get real paid gigs creating content
                for neighborhood businesses.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D1E7D4] bg-[#EDF9EE]">

        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-5">

          <div>
            <h3 className="text-2xl font-bold text-[#2D6A4F]">
              LocalLift
            </h3>

            <p className="text-gray-500 mt-2">
              Helping local products reach local shelves.
            </p>
          </div>

          <div className="flex items-center gap-6 text-gray-600 text-sm">
            <button className="hover:text-[#2D6A4F] transition">
              About
            </button>

            <button className="hover:text-[#2D6A4F] transition">
              Contact
            </button>

            <button className="hover:text-[#2D6A4F] transition">
              Community
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
