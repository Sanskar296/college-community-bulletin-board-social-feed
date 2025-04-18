"use client";

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaPlus, FaUsers, FaLock, FaUnlock, FaClock } from "react-icons/fa";
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
  const [rooms, setRooms] = useState([
    {
      id: "demo1",
      name: "AIML Project Discussion Room",
      category: "academic",
      creator: { username: "sanskarkumarFE23", firstname: "Sanskar", lastname: "Kumar" },
      participants: 8,
      isLocked: false,
      scheduledTime: new Date(),
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
      scheduledTime: new Date(),
      description: "Planning upcoming college fest activities.",
      status: "active"
    }
  ]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await ApiService.getDiscussions();
        if (response.success) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error('Error fetching discussions:', error);
      }
    };

    fetchDiscussions();
  }, []);

  const handleJoinRoom = async (roomId) => {
    try {
      // For demo rooms, directly set as active
      const selectedRoom = rooms.find(room => room.id === roomId);
      if (selectedRoom) {
        setActiveRoom(selectedRoom);
        return;
      }

      // For real rooms, use the API
      const response = await ApiService.joinDiscussion(roomId);
      if (response.success) {
        setActiveRoom(response.data);
      }
    } catch (error) {
      console.error('Error joining discussion:', error);
    }
  };

  const handleCreateDiscussion = (newDiscussion) => {
    setRooms([newDiscussion, ...rooms]);
    setShowCreateModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Discussion Rooms</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
            >
              <FaPlus />
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
            <div className="space-y-1">
              {discussionCategories.map(category => (
                <button
                  key={category.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center text-${category.color}-600`}
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
            <div className="space-y-2">
              {rooms.map(room => (
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
                    <span>{room.participants} participants</span>
                    <FaClock className="ml-3 mr-1" />
                    <span>Starts in {new Date(room.scheduledTime).toLocaleTimeString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md min-h-[600px]">
          {activeRoom ? (
            <DiscussionRoom room={activeRoom} onClose={() => setActiveRoom(null)} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a room to join the discussion
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
