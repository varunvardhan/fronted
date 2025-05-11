import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from '../context/AuthContext';
import SuperAdmin from '../Pages/SuperAdmin';
import Dashboard from '../Pages/Dashboard';
import AdminRegister from '../Pages/AdminRegister';
import UsersList from '../Pages/UsersList';
import ProtectedRoute from './components/ProtectedRoute';
import Login from '../Pages/Login';
import UserStatsTable from '../Pages/UserStatsTable'; 

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
        element: <SuperAdmin />,
        children: [
          {
            path: "admin-register",
            element: <AdminRegister />
          },
          {
            path: "users",
            element: <UsersList />
          },
          {
            path: "user-stats",
            element: <UserStatsTable />
          },
          {
            index: true,
            element: <Navigate to="admin-register" replace />
          }
        ]
      }
]);

export default router;