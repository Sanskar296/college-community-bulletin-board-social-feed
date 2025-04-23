import { useState } from "react";
import ApiService from "../services";

function CreateDiscussionModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "general",
    description: "",
    isLocked: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.createDiscussion(formData);
      
      if (response && response.success && response.data) {
        // Format the data to match component expectations
        const formattedRoom = {
          id: response.data._id,
          name: response.data.name,
          category: response.data.category,
          description: response.data.description,
          creator: response.data.creator,
          participants: response.data.participants || 1,
          isLocked: response.data.isLocked,
          status: response.data.status
        };
        
        onSuccess(formattedRoom);
        onClose();
      } else {
        setError(response?.message || "Failed to create discussion room");
      }
    } catch (err) {
      console.error("Error creating discussion:", err);
      setError(err.message || "Failed to create discussion room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Discussion Room</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Room Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter a name for your discussion room"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="academic">Academic Discussion</option>
              <option value="projects">Project Collaboration</option>
              <option value="events">Event Planning</option>
              <option value="general">General Chat</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Describe what this discussion room is about"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Private Room (Locked)</span>
            </label>
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDiscussionModal;
