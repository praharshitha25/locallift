import { Navigate, useLocation } from "react-router-dom";
import { getDashboardPath, useAuth } from "../auth/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
    const location = useLocation();
    const { currentUser, userDoc, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
                <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm text-gray-700">
                    Checking session...
                </div>
            </div>
        );
    }

    if (!currentUser || !userDoc?.role) {
        return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (allowedRole && userDoc.role !== allowedRole) {
        return <Navigate to={getDashboardPath(userDoc.role)} replace />;
    }

    return children;
};

export default ProtectedRoute;
