"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaImage, FaTrash } from "react-icons/fa"
import api from "../services/api"
import { AuthContext } from "../context/AuthContext"

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
      navigate("/login", { state: { from: "/create-post" } })
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
    
    console.log('Form Data:', {
      title: title.trim(),
      content: content.trim(),
      category: selectedCategory,
      department: selectedDepartment
    });
  
    if (!title.trim() || !content.trim() || !selectedCategory) {
      setError("Please fill in all required fields");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("category", selectedCategory);
      formData.append("department", selectedDepartment);
      
      if (image) {
        formData.append("image", image);
      }
  
      console.log('Submitting post data...');
      const response = await api.createPost(formData);
      console.log('Post creation response:', response);
  
      if (response.success) {
        navigate(`/post/${response.data._id}`);
      } else {
        throw new Error(response.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setError(err.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-md shadow-md p-6">
          <h1 className="text-2xl font-medium mb-6">Create a Post</h1>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-4 py-2 text-gray-600 mr-2 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePost