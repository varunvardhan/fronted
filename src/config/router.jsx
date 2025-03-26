import { createBrowserRouter } from "react-router-dom";
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
                <Login />
            </AuthProvider>
        ),
    },
    {
        path: "/dashboard",
        element: (
            <AuthProvider>
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
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
                path: "users", // This becomes /superadmin/users
                element: <UsersList />
            }
        ]
    },
]);

export default router;