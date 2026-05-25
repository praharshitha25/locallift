const demoAuthKey = "localLiftDemoAuth";

export const setDemoAuth = (role) => {
    localStorage.setItem(demoAuthKey, JSON.stringify({ role, signedInAt: Date.now() }));
    window.dispatchEvent(new Event("local-lift-demo-auth"));
};

export const clearDemoAuth = () => {
    localStorage.removeItem(demoAuthKey);
    window.dispatchEvent(new Event("local-lift-demo-auth"));
};

export const getDemoAuth = () => {
    try {
        return JSON.parse(localStorage.getItem(demoAuthKey));
    } catch {
        return null;
    }
};
