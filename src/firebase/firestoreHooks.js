import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "./config";

const readSnapshot = (snapshot) => snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
}));

export const emptyConstraints = [];

export const useCollection = (collectionName, constraints = emptyConstraints, enabled = true) => {
    const stableConstraints = useMemo(() => constraints, [constraints]);
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(Boolean(enabled));

    useEffect(() => {
        if (!enabled) {
            setItems([]);
            setError("");
            setLoading(false);
            return undefined;
        }

        setLoading(true);
        const collectionRef = collection(db, collectionName);
        const collectionQuery = stableConstraints.length > 0
            ? query(collectionRef, ...stableConstraints)
            : collectionRef;

        const unsubscribe = onSnapshot(
            collectionQuery,
            (snapshot) => {
                setItems(readSnapshot(snapshot));
                setError("");
                setLoading(false);
            },
            (err) => {
                setItems([]);
                setError(err.message || `Could not load ${collectionName}.`);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [collectionName, enabled, stableConstraints]);

    return { items, error, loading };
};
