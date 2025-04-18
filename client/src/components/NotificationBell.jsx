import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import ApiService from "../services";

function NotificationBell() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Set up polling for new notifications every 60 seconds
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getUnreadNotificationsCount();
      if (response && response.success) {
        setUnreadCount(response.count || 0);
      }
    } catch (err) {
      console.error("Error fetching notification count:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate("/notifications");
  };

  if (!user) return null;

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-white hover:bg-blue-700 rounded-full focus:outline-none"
      aria-label="Notifications"
    >
      <FaBell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

export default NotificationBell; 