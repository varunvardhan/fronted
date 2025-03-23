// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { isSessionExpired, removeUserData } from "./Helper/LocalStorageHelper";
import Dashboard from './Pages/Dashboard';
import ProtectedRoute from './config/ProtectedRoute';
import Login from './Pages/Login';

function App() {
    useEffect(() => {
        const checkSession = () => {
            if (isSessionExpired()) {
                removeUserData();
                window.location.href = "/"; // Redirect to login page on session expiry
            }
        };

        const interval = setInterval(checkSession, 60000); // Check every 1 minute
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <>
            <ToastContainer />
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Public Route */}
                        <Route path="/" element={<Login />} />

                        {/* Protected Route */}
                        <Route
                            path="dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </Router>
        </>
    );
}

export default App;