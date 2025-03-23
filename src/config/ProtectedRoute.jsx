// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isLogin } = useAuth();

    // If the user is not logged in, redirect to the login page
    if (!isLogin()) {
        return <Navigate to="/" replace />;
    }

    // If the user is logged in, render the children (protected component)
    return children;
};

export default ProtectedRoute;