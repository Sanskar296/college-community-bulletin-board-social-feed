"use client";

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaPlus, FaUsers, FaLock, FaUnlock, FaComments } from "react-icons/fa";
import DiscussionRoom from "./DiscussionRoom";
import ApiService from "../services"; // Fixed import to use services index
import CreateDiscussionModal from "./CreateDiscussionModal";

const discussionCategories = [
  { id: "academic", name: "Academic Discussions", color: "blue" },
  { id: "projects", name: "Project Collaboration", color: "green" },
  { id: "events", name: "Event Planning", color: "purple" },
  { id: "general", name: "General Chat", color: "gray" }
];

function Discussions() {
  const { user } = useContext(AuthContext);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([
    {
      id: "demo1",
      name: "AIML Project Discussion Room",
      category: "academic",
      creator: { username: "sanskarkumarFE23", firstname: "Sanskar", lastname: "Kumar" },
      participants: 8,
      isLocked: false,
      description: "Join us to discuss AIML Project implementation and ideas.",
      status: "active"
    },
    {
      id: "demo2",
      name: "Campus Event Planning Room",
      category: "events",
      creator: { username: "eventAdmin", firstname: "Event", lastname: "Admin" },
      participants: 12,
      isLocked: false,
      description: "Planning upcoming college fest activities.",
      status: "active"
    }
  ]);
  
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real discussions from the API
        const response = await ApiService.getDiscussions(activeCategory !== "all" ? activeCategory : null);
        
        if (response && response.success) {
          // Transform response format to match component expectations
          const formattedRooms = Array.isArray(response.data) ? response.data.map(room => ({
            id: room._id,
            name: room.name,
            category: room.category,
            creator: room.creator,
            participants: room.participants || 0,
            isLocked: room.isLocked,
            description: room.description,
            status: room.status
          })) : [];
          
          // Add demo rooms in development
          if (process.env.NODE_ENV !== 'production') {
            formattedRooms.unshift(...[
              {
                id: "demo1",
                name: "AIML Project Discussion",
                category: "academic",
                creator: { username: "sanskarkumarFE23", firstname: "Sanskar", lastname: "Kumar" },
                participants: 8,
                isLocked: false,
                description: "Join us to discuss AIML Project implementation and ideas.",
                status: "active"
              },
              {
                id: "demo2",
                name: "Campus Event Planning",
                category: "events",
                creator: { username: "eventAdmin", firstname: "Event", lastname: "Admin" },
                participants: 12,
                isLocked: false,
                description: "Planning upcoming college fest activities.",
                status: "active"
              }
            ]);
          }
          
          setRooms(formattedRooms);
          setError(null);
        } else {
          setError(response?.message || "Failed to load discussion rooms");
          setRooms([]);
        }
      } catch (error) {
        console.error('Error fetching discussions:', error);
        setError("Failed to load discussion rooms");
        
        // In case of error, still show demo rooms
        if (process.env.NODE_ENV !== 'production') {
          setRooms([
            {
              id: "demo1",
              name: "AIML Project Discussion",
              category: "academic",
              creator: { username: "sanskarkumarFE23", firstname: "Sanskar", lastname: "Kumar" },
              participants: 8,
              isLocked: false,
              description: "Join us to discuss AIML Project implementation and ideas.",
              status: "active"
            },
            {
              id: "demo2",
              name: "Campus Event Planning",
              category: "events",
              creator: { username: "eventAdmin", firstname: "Event", lastname: "Admin" },
              participants: 12,
              isLocked: false,
              description: "Planning upcoming college fest activities.",
              status: "active"
            }
          ]);
        } else {
          setRooms([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [activeCategory]);

  const handleJoinRoom = async (roomId) => {
    try {
      setError(null);
      
      // For demo rooms, directly set as active
      const selectedRoom = rooms.find(room => room.id === roomId);
      if (selectedRoom) {
        setActiveRoom(selectedRoom);
        return;
      }

      // For real rooms, use the API
      const response = await ApiService.joinDiscussion(roomId);
      if (response && response.success && response.data) {
        // Transform response format to match component expectations
        const roomData = {
          ...response.data,
          id: response.data._id // Ensure we have id property for consistency
        };
        setActiveRoom(roomData);
      } else {
        setError(response?.message || "Failed to join discussion room");
      }
    } catch (error) {
      console.error('Error joining discussion:', error);
      setError(error.message || "Failed to join discussion room");
    }
  };

  const handleCreateDiscussion = (newDiscussion) => {
    setRooms([newDiscussion, ...rooms]);
    setShowCreateModal(false);
  };
  
  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
  };
  
  // Filter rooms based on selected category
  const filteredRooms = activeCategory === "all" 
    ? rooms 
    : rooms.filter(room => room.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Discussion Rooms</h2>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                title="Create new discussion room"
              >
                <FaPlus />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
            <div className="space-y-1">
              <button
                key="all"
                onClick={() => handleCategorySelect("all")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center ${
                  activeCategory === "all" ? "bg-gray-100" : ""
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                All Categories
              </button>
              {discussionCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center text-${category.color}-600 ${
                    activeCategory === category.id ? "bg-gray-100" : ""
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full bg-${category.color}-500 mr-2`}></span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Rooms */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Rooms</h3>
            
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Loading rooms...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No discussion rooms found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => handleJoinRoom(room.id)}
                    className={`w-full text-left p-3 rounded-md text-sm hover:bg-gray-50 ${
                      activeRoom?.id === room.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{room.name}</span>
                      {room.isLocked ? <FaLock className="text-gray-400" /> : <FaUnlock className="text-green-500" />}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <FaUsers className="mr-1" />
                      <span>{room.participants || 0} participants</span>
                      <FaComments className="ml-3 mr-1" />
                      <span>{room.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md min-h-[600px]">
          {activeRoom ? (
            <DiscussionRoom room={activeRoom} onClose={() => setActiveRoom(null)} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <FaComments className="text-4xl mb-4 text-blue-200" />
              <p className="text-center">Select a discussion room to join the conversation</p>
              {!user && (
                <p className="text-center text-sm mt-2">
                  Please log in to create your own discussion rooms
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateDiscussionModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateDiscussion}
        />
      )}
    </div>
  );
}

export default Discussions;
