import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase/config";
import { setDemoAuth } from "../../auth/demoAuth";

const roles = [
    {
        id: "maker",
        label: "Maker",
        description: "Manage products, consignments, and local shop discovery.",
        path: "/maker"
    },
    {
        id: "shopkeeper",
        label: "Shopkeeper",
        description: "Track local inventory, sales, and maker relationships.",
        path: "/shopkeeper"
    },
    {
        id: "freelancer",
        label: "Freelancer",
        description: "Find nearby gigs and promote local products.",
        path: "/freelancer"
    }
];

const Login = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialRole = searchParams.get("role");
    const defaultRole = roles.some(role => role.id === initialRole) ? initialRole : "maker";
    const [selectedRole, setSelectedRole] = useState(defaultRole);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState("");

    const activeRole = useMemo(
        () => roles.find(role => role.id === selectedRole) || roles[0],
        [selectedRole]
    );

    const handleContinue = async () => {
        setError("");
        setIsSigningIn(true);

        try {
            await signInAnonymously(auth);
            navigate(activeRole.path);
        } catch (err) {
            // Fallback to demo auth when Firebase auth is unavailable
            setDemoAuth(activeRole.id);
            navigate(activeRole.path);
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
            <div className="bg-white border shadow-sm rounded-3xl p-8 w-full max-w-md">
                <h1 className="text-4xl font-bold text-center text-[#2D6A4F] mb-3">
                    LocalLift
                </h1>

                <p className="text-gray-500 text-center mb-8">
                    Choose your role to continue
                </p>

                <div className="grid grid-cols-3 gap-2 mb-6">
                    {roles.map(role => (
                        <button
                            key={role.id}
                            type="button"
                            onClick={() => setSelectedRole(role.id)}
                            className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${selectedRole === role.id
                                ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {role.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-2xl bg-[#F5F5F0] border p-4 mb-6">
                    <p className="font-semibold text-gray-900 mb-1">{activeRole.label}</p>
                    <p className="text-sm text-gray-600">{activeRole.description}</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={isSigningIn}
                    className="w-full bg-[#2D6A4F] hover:bg-[#24563f] disabled:bg-gray-400 text-white py-3 rounded-2xl transition font-medium"
                >
                    {isSigningIn ? "Signing in..." : `Continue as ${activeRole.label}`}
                </button>
            </div>
        </div>
    );
};

export default Login;
