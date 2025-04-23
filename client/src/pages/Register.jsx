"use client";

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const departments = [
  { id: "aiml", name: "AIML", color: "blue" },
  { id: "comp", name: "COMP", color: "blue" },
  { id: "extc", name: "EXTC", color: "blue" },
  { id: "elect", name: "ELECT", color: "blue" },
  { id: "civil", name: "CIVIL", color: "blue" },
  { id: "mech", name: "MECH", color: "blue" }
];

const roles = [
  { id: "student", name: "Student" },
  { id: "faculty", name: "Faculty" },
];

const years = [
  { id: "FE", name: "First Year" },
  { id: "SE", name: "Second Year" },
  { id: "TE", name: "Third Year" },
  { id: "BE", name: "Fourth Year" },
  { id: "NA", name: "Not Applicable" }
];

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    department: "",
    role: "student", // Default role
    uid: "", // For student ID
    password: "",
    confirmPassword: "",
    year: "FE",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    try {
      setLoading(true);

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.username || !formData.firstname || !formData.lastname || !formData.department) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate student UID format if role is student
      if (formData.role === "student") {
        if (!formData.uid) {
          setError("Student UID is required");
          setLoading(false);
          return;
        }
      }

      console.log("Submitting registration data:", formData);
      const result = await register(formData);
      console.log("Registration result:", result);

      if (result.success) {
        if (result.isFaculty) {
          // For faculty, show message but don't redirect yet
          setSuccessMessage(result.message);
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          // For students, redirect immediately to home
          setSuccessMessage(result.message);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Add department button component
  const DepartmentButton = ({ id, name, color }) => (
    <button
      type="button"
      onClick={() => setFormData({ ...formData, department: id })}
      className={`px-4 py-2 rounded-lg mr-2 mb-2 transition-colors duration-200 ${
        formData.department === id
          ? `bg-${color}-500 text-white`
          : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
      }`}
    >
      {name}
    </button>
  );

  // Replace the department select with buttons
  const renderDepartmentButtons = () => (
    <div className="mb-6">
      <label className="block text-gray-700 mb-2">
        Select Department <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap">
        {departments.map((dept) => (
          <DepartmentButton key={dept.id} {...dept} />
        ))}
      </div>
      {!formData.department && (
        <p className="text-red-500 text-sm mt-1">Please select a department</p>
      )}
    </div>
  );

  // Add year selection
  const renderYearSelection = () => (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2">
        Year <span className="text-red-500">*</span>
      </label>
      <select
        name="year"
        value={formData.year}
        onChange={handleChange}
        className="w-full p-2 border rounded-md"
        required
      >
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-md shadow-md p-6">
        <h1 className="text-2xl font-medium mb-6 text-center">Create an Account</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}
        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="firstname">
              First Name
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="lastname">
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your last name"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Role</label>
            <div className="flex gap-4">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={formData.role === role.id}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>

          {renderDepartmentButtons()}

          {/* Conditional Student UID field */}
          {formData.role === "student" && (
            <>
              {renderYearSelection()}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Student UID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="uid"
                  value={formData.uid}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your Student UID"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  <p>Enter your Student UID exactly as shown on your library card.</p>
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
