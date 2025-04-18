"use client";

import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login, user, authError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      // Redirect to home or to the page they were trying to access
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);
  
  // Show auth context errors if present
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user types
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim() || !formData.password) {
      setFormError("Please enter both username and password");
      return;
    }
    
    setFormError(null);
    setLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        // Redirect to home or to the page they were trying to access
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      } else if (result.message?.includes("pending approval") || result.message?.includes("not approved")) {
        setFormError(
          "Your faculty account is pending admin approval. Please wait for verification or contact the administrator."
        );
      } else {
        setFormError(result.message || "Login failed");
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-md shadow-md p-6">
        <h1 className="text-2xl font-medium mb-6 text-center">Log In</h1>
        {formError && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-500 hover:underline mt-2 inline-block"
            >
              Forgot your password?
            </Link>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
