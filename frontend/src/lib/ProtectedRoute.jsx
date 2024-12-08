import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute Authentication Component
 * 
 * A wrapper component that restricts access to routes based on user authentication and roles.
 *
 * @param {Object} props - The component's props.
 * @param {React.ReactNode} props.children - The components to render if access is allowed.
 * @param {string[]} props.allowedRoles - An array of roles permitted to access the route.
 * @returns {React.ReactNode} - Returns the child components if the user is authenticated 
 * and has the required role, otherwise navigates to the appropriate route.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.account)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;