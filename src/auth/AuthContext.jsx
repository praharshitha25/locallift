import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext({
    currentUser: null,
    userDoc: null,
    loading: true,
    error: ""
});

export const rolePaths = {
    maker: "/maker",
    shopkeeper: "/shopkeeper",
    freelancer: "/freelancer"
};

export const getDashboardPath = (role) => rolePaths[role] || "/maker";

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userDoc, setUserDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let unsubscribeUser = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            setLoading(true);
            setCurrentUser(firebaseUser);
            setUserDoc(null);
            setError("");

            if (!firebaseUser) {
                setLoading(false);
                if (unsubscribeUser) {
                    unsubscribeUser();
                    unsubscribeUser = null;
                }
                return;
            }

            const userRef = doc(db, "users", firebaseUser.uid);
            unsubscribeUser = onSnapshot(
                userRef,
                (snapshot) => {
                    setUserDoc(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
                    setLoading(false);
                },
                (snapshotError) => {
                    setError(snapshotError.message || "Could not load your profile.");
                    setLoading(false);
                }
            );
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUser) unsubscribeUser();
        };
    }, []);

    const value = useMemo(
        () => ({
            currentUser,
            userDoc,
            loading,
            error
        }),
        [currentUser, userDoc, loading, error]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
