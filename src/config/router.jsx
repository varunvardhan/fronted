// src/config/router.js
import { createBrowserRouter, Route } from "react-router-dom";
import { AuthProvider } from '../context/AuthContext';
import SuperAdmin from '../Pages/SuperAdmin';
import Dashboard from '../Pages/Dashboard';
import AdminRegister from '../Pages/AdminRegister';
import UsersList from '../Pages/UsersList';
import ProtectedRoute from './components/ProtectedRoute';
import Login from '../Pages/Login';

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <AuthProvider>
                <Route>
                    <Route path="/" element={<Login />} />
                    <Route
                        path="dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </AuthProvider>
        ),
    },
    {
        path: "/superadmin",
        element: (
            <AuthProvider>
                <ProtectedRoute>
                    <SuperAdmin />
                </ProtectedRoute>
            </AuthProvider>
        ),
        children: [
            {
                path: "admin-register", // This becomes /superadmin/admin-register
                element: <AdminRegister />
            },
            {
                path: "users", // This becomes /superadmin/admin-register
                element: <UsersList />
            }
        ]
    },
]);

export default router;