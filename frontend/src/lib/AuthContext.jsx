import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

/**
 * AuthContext Authentication Component
 * 
 * Tesponsible for managing authentication state 
 * and providing the authenticated user data to its children components.
 * It fetches the user data from the backend and shares it through React's context API.
 * 
 * @param {Object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that will have access to the authentication context.
 */
export const AuthProvider = ({ children }) => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [user, setUser] = useState(null);

    console.log(user);

    /**
     * Fetches the authenticated user data from the backend upon component mount.
     */
    useEffect(() => {
        fetch(`${VITE_BACKEND_URL}/api/user`, { credentials: "include" })
            .then((response) => response.json())
            .then((data) => {
                if (!data.error) setUser(data);
            })
            .catch((error) => console.error("Error fetching user data:", error));
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to access the authentication context.
 * 
 * @returns {Object} - The authentication context, containing the user state and setUser function.
 */
export const useAuth = () => useContext(AuthContext);