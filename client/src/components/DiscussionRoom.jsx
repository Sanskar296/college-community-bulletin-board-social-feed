"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaTimes, FaPaperPlane, FaUsers } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import ApiService from "../services";

function DiscussionRoom({ room, onClose }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages when room changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For demo rooms, use placeholder messages
        if (room.id === "demo1" || room.id === "demo2") {
          setMessages([
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
          setLoading(false);
          return;
        }
        
        // For real rooms, fetch messages from API
        const response = await ApiService.getMessages(room.id || room._id);
        
        if (response && response.success) {
          // Transform data to match component expectations
          const formattedMessages = Array.isArray(response.data) ? response.data.map(msg => ({
            id: msg._id,
            content: msg.content,
            author: msg.author,
            timestamp: msg.createdAt
          })) : [];
          
          setMessages(formattedMessages);
          setError(null);
        } else {
          setError(response?.message || "Failed to load messages");
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (room && (room.id || room._id)) {
      fetchMessages();
    }
  }, [room]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    
    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now(),
      content: messageContent,
      author: user,
      timestamp: new Date().toISOString(),
      pending: true
    };
    
    setMessages(prevMessages => [...prevMessages, tempMessage]);

    try {
      // For demo rooms, just keep the optimistic update
      if (room.id === "demo1" || room.id === "demo2") {
        // Remove pending flag after a short delay to simulate API call
        setTimeout(() => {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === tempMessage.id ? {...msg, pending: false} : msg
            )
          );
        }, 500);
        return;
      }
      
      // For real rooms, send message to API
      const response = await ApiService.sendMessage(room.id || room._id, messageContent);
      
      if (response && response.success && response.data) {
        // Transform server response to match UI format
        const serverMessage = {
          id: response.data._id,
          content: response.data.content,
          author: response.data.author,
          timestamp: response.data.createdAt
        };
        
        // Replace the temporary message with the real one from the server
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? serverMessage : msg
          )
        );
        setError(null);
      } else {
        // Mark message as failed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? {...msg, failed: true, pending: false} : msg
          )
        );
        setError("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Mark message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessage.id ? {...msg, failed: true, pending: false} : msg
        )
      );
      setError("Failed to send message");
    }
  };
  
  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (err) {
      return 'just now';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Room Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">{room.name}</h2>
          <div className="flex items-center text-sm text-gray-500">
            <FaUsers className="mr-1" />
            <span>{room.participants} participants</span>
            <span className="mx-2">•</span>
            <span>{room.category}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-red-100 text-red-500 rounded-full"
          title="Close discussion"
        >
          <FaTimes />
        </button>
      </div>

      {/* Discussion description */}
      {room.description && (
        <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
          {room.description}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No messages yet. Be the first to start the conversation!
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.author.username === user?.username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.author.username === user?.username
                    ? message.failed 
                      ? "bg-red-100 text-red-800" 
                      : message.pending 
                        ? "bg-blue-300 text-white" 
                        : "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span>{message.author.firstname || message.author.username}</span>
                  <span className={
                    message.author.username === user?.username 
                      ? message.failed 
                        ? "text-red-600" 
                        : "text-blue-200" 
                      : "text-gray-500"
                  }>
                    {message.failed ? "Failed to send" : formatMessageTime(message.timestamp)}
                  </span>
                </div>
                <div className="break-words">{message.content}</div>
                {message.failed && (
                  <div className="text-xs text-red-600 mt-1">
                    Tap to retry
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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
            disabled={!user}
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={!newMessage.trim() || !user}
          >
            <FaPaperPlane />
          </button>
        </div>
        {!user && (
          <div className="text-xs text-red-500 mt-2">
            Please log in to participate in the discussion
          </div>
        )}
      </form>
    </div>
  );
}

export default DiscussionRoom;
