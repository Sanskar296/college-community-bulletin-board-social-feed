"use client";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ApiService from "../services";
import "../styles/Notice.css";

const departments = [
  { id: "all", name: "All Departments" },
  { id: "aiml", name: "CSE(AIML)" },
  { id: "comp", name: "Computer" },
  { id: "mech", name: "Mechanical" },
  { id: "civil", name: "Civil" },
  { id: "elect", name: "Electrical" },
  { id: "extc", name: "EXTC" },
];

function CreateNotice() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDevMode, setIsDevMode] = useState(false);

  // Check permissions when component loads
  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate("/login", { state: { from: "/create-notice" } });
      return;
    }
    
    // If logged in but not authorized to create notices, redirect to home
    if (!(user.role === 'faculty' || user.role === 'admin' || user.username === 'dev')) {
      navigate('/home');
      return;
    }
    
    // Debug authentication
    const token = localStorage.getItem('token');
    const devKey = localStorage.getItem('dev_key');
    
    // Check if in dev mode
    const devMode = user && user.username === "dev" && devKey === "dev123";
    setIsDevMode(devMode);
    
    console.log('Create Notice - Current user:', user);
    console.log('Create Notice - Has auth token:', !!token);
    console.log('Create Notice - Is dev user:', devMode);
    
    // Set token in API service
    if (devMode) {
      ApiService.setAuthToken("dev_token");
      console.log('🔧 DEV MODE ACTIVE - Using development token');
    } else if (token) {
      ApiService.setAuthToken(token);
    }
  }, [user, navigate]);

  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!allowedImageTypes.includes(file.type)) {
        setError("Please upload a valid image (JPG, JPEG, PNG, GIF, WEBP, or SVG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const DepartmentButton = ({ id, name }) => (
    <button
      type="button"
      onClick={() => setSelectedDepartment(id)}
      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
        selectedDepartment === id
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {name}
    </button>
  );

  const renderDepartmentButtons = () => (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2">
        Select Department
      </label>
      <div className="flex flex-wrap">
        {departments.map((dept) => (
          <DepartmentButton key={dept.id} {...dept} />
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please provide a title for the notice.");
      setFeedbackMessage("Please provide a title for the notice");
      setFeedbackType("error");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current auth token and refresh if needed
      const token = localStorage.getItem('token');
      const devKey = localStorage.getItem('dev_key');
      
      if (!token && !devKey) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Ensure token is set
      if (isDevMode) {
        console.log('🔧 DEV MODE - Using dev token for notice creation');
        ApiService.setAuthToken("dev_token");
      } else if (token) {
        console.log('Using regular token for notice creation');
        ApiService.setAuthToken(token);
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("department", selectedDepartment);
      if (image) {
        formData.append("image", image);
      }

      if (isDevMode) {
        console.log('🔧 DEV MODE - Submission data:', { 
          title, 
          department: selectedDepartment,
          imageDetails: image ? {
            name: image.name,
            type: image.type,
            size: `${(image.size / 1024).toFixed(2)} KB`
          } : 'No image'
        });
      }
      
      const response = await ApiService.createNotice(formData);
      
      if (isDevMode) {
        console.log('🔧 DEV MODE - API Response:', response);
      }

      if (response.success) {
        setFeedbackMessage("Notice posted successfully!");
        setFeedbackType("success");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to create notice");
      }
    } catch (err) {
      console.error('Notice creation error:', err);
      
      if (isDevMode) {
        console.log('🔧 DEV MODE - Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
      }
      
      // Special handling for auth errors
      if (err.message && err.message.includes('token')) {
        setError("Your session has expired. Please log in again.");
        setFeedbackMessage("Your session has expired. Please log in again.");
        setFeedbackType("error");
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login', { state: { from: '/create-notice' } });
        }, 3000);
      } else {
        setError(err.message || "Failed to create notice. Please try again.");
        setFeedbackMessage(err.message || "Failed to create notice");
        setFeedbackType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl font-medium mb-4">Create Notice</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          {renderDepartmentButtons()}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter notice title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Add Image</label>
            {!imagePreview ? (
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue cursor-pointer hover:bg-gray-50">
                  <span className="text-base">Upload Notice Image</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, JPEG, PNG, GIF, WEBP, SVG
                  </span>
                  <span className="text-xs text-gray-500">Max size: 5MB</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="relative mb-2">
                <img src={imagePreview} alt="Preview" className="max-h-64 rounded-md" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Notice"}
          </button>
        </form>
        
        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`feedback-message ${feedbackType}`}>
            {feedbackMessage}
          </div>
        )}
        
        {/* Dev Mode Indicator */}
        {isDevMode && (
          <div className="dev-mode-indicator">
            DEV MODE ACTIVE
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateNotice;
