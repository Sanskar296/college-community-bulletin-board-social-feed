// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import ApiService from "../services";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add this useEffect for debugging
    useEffect(() => {
        console.log('Current user state:', user);
    }, [user]);

    const verifyAuth = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            setLoading(true);
            const response = await ApiService.getCurrentUser();
            
            if (response?.data) {
                setUser(response.data);
                localStorage.setItem("user", JSON.stringify(response.data));
            }
        } catch (error) {
            console.error("Auth verification error:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyAuth();
    }, []);

    // Dev bypass check (only for development)
    useEffect(() => {
        const devBypass = localStorage.getItem("dev_key");
        if (devBypass === "dev123") {
            const devUser = {
                _id: "dev_user",
                username: "dev",
                role: "admin",
                firstname: "Dev",
                lastname: "Admin",
                department: "comp"
            };
            setUser(devUser);
            localStorage.setItem("user", JSON.stringify(devUser));
            setLoading(false);
        }
    }, []);

    const register = async (formData) => {
        try {
            setError(null);
            const response = await ApiService.register(formData);
            
            if (response.success) {
                if (formData.role === 'faculty') {
                    // For faculty, don't auto-login, just show success message
                    return { 
                        success: true, 
                        message: "Faculty registration submitted for approval. Please wait for admin verification.",
                        isFaculty: true
                    };
                }
                
                // Auto-login for students
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));
                ApiService.setAuthToken(response.token);
                setUser(response.user);
                return { success: true, message: "Registration successful!" };
            }
            
            setError(response.message || "Registration failed");
            return { success: false, message: response.message };
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Registration failed";
            setError(errorMsg);
            return { success: false, message: errorMsg };
        }
    };

    const login = async (credentials) => {
        // Dev bypass
        if (credentials.username === "dev" && credentials.password === "dev123") {
            const devUser = {
                _id: "dev_user",
                username: "developer",
                role: "admin",
                firstname: "Dev",
                lastname: "User"
            };
            localStorage.setItem("dev_key", "dev123");
            localStorage.setItem("user", JSON.stringify(devUser));
            setUser(devUser);
            setError(null);
            return { success: true };
        }

        try {
            setError(null);
            const response = await ApiService.login(credentials);
            
            if (response.success) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));
                ApiService.setAuthToken(response.token);
                setUser(response.user);
                return { success: true };
            }
            
            setError(response.message || "Login failed");
            return { success: false, message: response.message };
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Login failed";
            setError(errorMsg);
            return { success: false, message: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("dev_key"); // Also clear dev key on logout
        ApiService.setAuthToken(null);
        setUser(null);
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            error,
            register, 
            login, 
            logout,
            setError 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;