import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { getDashboardPath } from "../../auth/AuthContext";

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

const roleDefaults = {
    maker: {
        rating: "New"
    },
    shopkeeper: {
        type: "Local Store",
        shelfSlots: 10,
        distance: 0,
        rating: "New"
    },
    freelancer: {
        skills: ["Local promotions"],
        ratePerGig: 1000,
        portfolio: "",
        rating: "New"
    }
};

const Login = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const fromPath = searchParams.get("from") || "";
    const inferredRole = roles.find(role => fromPath.includes(role.path))?.id;
    const initialRole = searchParams.get("role") || inferredRole || "maker";
    const defaultRole = roles.some(role => role.id === initialRole) ? initialRole : "maker";
    const [selectedRole, setSelectedRole] = useState(defaultRole);
    const [mode, setMode] = useState("login");
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState("");

    const activeRole = useMemo(
        () => roles.find(role => role.id === selectedRole) || roles[0],
        [selectedRole]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSigningIn(true);

        try {
            if (mode === "signup") {
                const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                await updateProfile(credential.user, { displayName: formData.name });
                await setDoc(doc(db, "users", credential.user.uid), {
                    name: formData.name,
                    email: formData.email,
                    role: activeRole.id,
                    photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=2D6A4F&color=fff`,
                    location: "Kurnool",
                    ...(roleDefaults[activeRole.id] || {}),
                    createdAt: serverTimestamp()
                });
                navigate(getDashboardPath(activeRole.id));
                return;
            }

            const credential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const userSnapshot = await getDoc(doc(db, "users", credential.user.uid));
            const role = userSnapshot.data()?.role || "maker";
            navigate(getDashboardPath(role));
        } catch (err) {
            setError(err.message || "Could not sign in.");
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
                    {mode === "login" ? "Sign in to continue" : "Create your LocalLift account"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            placeholder="Name"
                            required
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                        placeholder="Password"
                        minLength={6}
                        required
                    />

                    {mode === "signup" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            >
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">{activeRole.description}</p>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSigningIn}
                        className="w-full bg-[#2D6A4F] hover:bg-[#24563f] disabled:bg-gray-400 text-white py-3 rounded-2xl transition font-medium"
                    >
                        {isSigningIn ? "Please wait..." : mode === "login" ? "Login" : `Sign Up as ${activeRole.label}`}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    {mode === "login" ? "New to LocalLift?" : "Already have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === "login" ? "signup" : "login");
                            setError("");
                        }}
                        className="font-semibold text-[#2D6A4F] hover:underline"
                    >
                        {mode === "login" ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
