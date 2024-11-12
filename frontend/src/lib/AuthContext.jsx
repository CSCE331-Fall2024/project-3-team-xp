import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const [user, setUser] = useState(null);

    console.log(user);

    useEffect(() => {
        fetch(`http://${VITE_SERVER_URL}/api/user`, { credentials: "include" })
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

export const useAuth = () => useContext(AuthContext);