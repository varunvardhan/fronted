// src/App.jsx
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import router from "./config/router"; // ✅ Correct default import
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { isSessionExpired, removeUserData } from "./Helper/LocalStorageHelper";

function App() {
    useEffect(() => {
        const checkSession = () => {
            if (isSessionExpired()) {
                removeUserData();
                router.navigate("/"); // ✅ Redirects to login page on session expiry
            }
        };

        const interval = setInterval(checkSession, 60000); // Check every 1 minute
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <>
            <ToastContainer />
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </>
    );
}

export default App;
