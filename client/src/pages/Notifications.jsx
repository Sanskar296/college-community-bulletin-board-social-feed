import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ApiService from "../services";
import { FaBell, FaCheck, FaExclamationCircle } from "react-icons/fa";

function Notifications() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login", { state: { from: "/notifications" } });
      return;
    }

    fetchNotifications();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNotifications();
      
      if (response && response.success) {
        setNotifications(response.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await ApiService.markNotificationAsRead(notificationId);
      
      // Update notification in state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      
      // Update all notifications in state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const renderNotificationItem = (notification) => (
    <div 
      key={notification._id} 
      className={`p-4 rounded-lg shadow-sm mb-4 border-l-4 ${
        notification.read 
          ? 'border-gray-300 bg-white'
          : 'border-blue-500 bg-blue-50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className={`mr-3 mt-1 ${notification.read ? 'text-gray-400' : 'text-blue-500'}`}>
            <FaBell size={16} />
          </div>
          <div>
            <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            {notification.type === 'notice' && (
              <button 
                onClick={() => navigate(`/notice/${notification.entityId}`)}
                className="text-sm text-blue-600 hover:underline mt-2"
              >
                View Notice
              </button>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {!notification.read && (
          <button
            onClick={() => markAsRead(notification._id)}
            className="text-blue-600 hover:bg-blue-100 p-1 rounded-full"
            title="Mark as read"
          >
            <FaCheck size={14} />
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some(notification => !notification.read) && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
            <FaExclamationCircle className="mr-2" />
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <FaBell size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No notifications yet</h3>
            <p className="text-gray-500 mt-1">
              You'll be notified when there are new notices for your department
            </p>
          </div>
        ) : (
          <div>
            {notifications.map(renderNotificationItem)}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications; 