"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaVideo, FaMicrophone, FaDesktop, FaTimes, FaPaperPlane } from "react-icons/fa";

function DiscussionRoom({ room, onClose }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    // Demo messages for the rooms
    {
      id: 1,
      content: "Welcome to the discussion room!",
      author: room.creator,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      content: "Feel free to participate in the discussion.",
      author: room.creator,
      timestamp: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      author: user,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Room Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">{room.name}</h2>
          <p className="text-sm text-gray-500">{room.participants} participants</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FaVideo />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FaMicrophone />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FaDesktop />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 text-red-500 rounded-full"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.author.username === user.username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.author.username === user.username
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              <div className="text-xs mb-1">
                {message.author.username}
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
}

export default DiscussionRoom;
