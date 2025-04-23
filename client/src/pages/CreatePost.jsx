"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaImage, FaTrash } from "react-icons/fa"
import ApiService from "../services"
import { AuthContext } from "../context/AuthContext"
import "../styles/Notice.css"

const categories = [
  { id: "events", name: "Events" },
  { id: "academic", name: "Academic Updates" },
  { id: "lost-found", name: "Lost & Found" },
  { id: "issues", name: "Campus Issues" },
  { id: "general", name: "General Discussion" },
]

const departments = [
  { id: "all", name: "All Departments" },
  { id: "aiml", name: "CSE(AIML)" },
  { id: "comp", name: "Computer" },
  { id: "mech", name: "Mechanical" },
  { id: "civil", name: "Civil" },
  { id: "elect", name: "Electrical" },
  { id: "extc", name: "EXTC" },
]

function CreatePost() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/create-post" } });
      return;
    }
    
    // Debug authentication
    const token = localStorage.getItem('token');
    const devKey = localStorage.getItem('dev_key');
    
    // Check if in dev mode
    const devMode = user && user.username === "dev" && devKey === "dev123";
    setIsDevMode(devMode);
    
    console.log('Create Post - Current user:', user);
    console.log('Create Post - Has auth token:', !!token);
    console.log('Create Post - Is dev user:', devMode);
    
    // Set token in API service
    if (devMode) {
      ApiService.setAuthToken("dev_token");
      console.log('🔧 DEV MODE ACTIVE - Using development token');
    } else if (token) {
      ApiService.setAuthToken(token);
    }
  }, [user, navigate])

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isDevMode, setIsDevMode] = useState(false);
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const CategoryButton = ({ id, name }) => (
    <button
      type="button"
      onClick={() => setSelectedCategory(id)}
      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
        selectedCategory === id
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {name}
    </button>
  );

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

  const renderCategoryButtons = () => (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2">
        Select Category <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap">
        {categories.map((cat) => (
          <CategoryButton key={cat.id} {...cat} />
        ))}
      </div>
      {!selectedCategory && (
        <p className="text-red-500 text-sm mt-1">Please select a category</p>
      )}
    </div>
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
      setError("Title cannot be empty");
      setFeedbackMessage("Title cannot be empty");
      setFeedbackType("error");
      return;
    }

    if (!content.trim()) {
      setError("Content cannot be empty");
      setFeedbackMessage("Content cannot be empty");
      setFeedbackType("error");
      return;
    }

    if (!selectedCategory) {
      setError("Please select a category");
      setFeedbackMessage("Please select a category");
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
        console.log('🔧 DEV MODE - Using dev token for post creation');
        ApiService.setAuthToken("dev_token");
      } else if (token) {
        console.log('Using regular token for post creation');
        ApiService.setAuthToken(token);
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("category", selectedCategory);
      formData.append("department", selectedDepartment);
      
      if (image) {
        formData.append("image", image);
      }

      if (isDevMode) {
        console.log('🔧 DEV MODE - Submission data:', { 
          title: title.trim(), 
          content: content.length > 20 ? content.substring(0, 20) + '...' : content,
          category: selectedCategory,
          department: selectedDepartment,
          imageDetails: image ? {
            name: image.name,
            type: image.type,
            size: `${(image.size / 1024).toFixed(2)} KB`
          } : 'No image'
        });
      }

      console.log('Submitting post data...');
      const response = await ApiService.createPost(formData);
      
      if (isDevMode) {
        console.log('🔧 DEV MODE - API Response:', response);
      }

      if (response.success) {
        setFeedbackMessage("Post created successfully!");
        setFeedbackType("success");
        
        // Navigate after a short delay to show the feedback message
        setTimeout(() => {
          if (response.data && response.data._id) {
            navigate(`/post/${response.data._id}`);
          } else {
            // If we got success but no post ID, go to home
            navigate('/home');
          }
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Post creation error:', err);
      
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
          navigate('/login', { state: { from: '/create-post' } });
        }, 3000);
      } else {
        setError(err.message || "Failed to create post. Please try again.");
        setFeedbackMessage(err.message || "Failed to create post");
        setFeedbackType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Create a New Post</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          {renderCategoryButtons()}
          {renderDepartmentButtons()}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Give your post a title"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="content">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Write your post content here..."
              rows={8}
              required
            />
          </div>

          {/* Image upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Add Image (Optional)</label>

            {imagePreview ? (
              <div className="relative mb-2">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-64 rounded-md" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center">
                    <FaImage className="text-gray-400 text-3xl mb-2" />
                    <span className="text-gray-500">Click to upload an image</span>
                    <span className="text-xs text-gray-400 mt-1">
                      Supported formats: JPG, JPEG, PNG, GIF, WEBP, SVG
                    </span>
                    <span className="text-xs text-gray-400">Max size: 5MB</span>
                  </div>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.gif,.webp,.svg" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              {loading ? "Creating Post..." : "Create Post"}
            </button>
          </div>
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
  )
}

export default CreatePost