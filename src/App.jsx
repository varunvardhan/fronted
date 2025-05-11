// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { isSessionExpired, removeUserData } from "./Helper/LocalStorageHelper";

// Import all your pages
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import SuperAdmin from './Pages/SuperAdmin';
import AdminRegister from './Pages/AdminRegister';
import UsersList from './Pages/UsersList';
import UserStatsTable from './Pages/UserStatsTable';
import ProtectedRoute from './config/ProtectedRoute';

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

                        {/* Protected Routes */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />

                        {/* SuperAdmin Protected Routes */}
                        <Route 
                            path="/superadmin" 
                            element={
                                <ProtectedRoute>
                                    <SuperAdmin />
                                </ProtectedRoute>
                            } 
                        >
                            <Route index element={<Navigate to="admin-register" replace />} />
                            <Route path="admin-register" element={<AdminRegister />} />
                            <Route path="users" element={<UsersList />} />
                            <Route path="user-stats" element={<UserStatsTable />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </>
    );
}

export default App;