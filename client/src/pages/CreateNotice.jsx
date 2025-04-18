"use client";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ApiService from "../services";

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
    }
  }, [user, navigate]);

  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

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

    if (!title.trim() || !image) {
      setError("Please provide both a title and an image.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("department", selectedDepartment);
      if (image) {
        formData.append("image", image);
      }

      console.log('Submitting notice:', { title, department: selectedDepartment });
      const response = await ApiService.createNotice(formData);
      console.log('Notice creation response:', response);

      if (response.success) {
        navigate("/");
      } else {
        throw new Error(response.message || "Failed to create notice");
      }
    } catch (err) {
      console.error('Notice creation error:', err);
      setError(err.message || "Failed to create notice. Please try again.");
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
                    required
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
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Notice"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateNotice;
