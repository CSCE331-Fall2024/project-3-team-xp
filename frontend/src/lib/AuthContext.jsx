import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    console.log(user);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/user", { credentials: "include" })
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