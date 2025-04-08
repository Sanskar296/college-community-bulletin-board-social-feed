"use client";

import { useState, useEffect } from "react";
import api from "../services/api";

// Add department tabs configuration
const departments = [
  { id: "all", name: "All Notices" },
  { id: "aiml", name: "CSE(AIML)" },
  { id: "comp", name: "Computer" },
  { id: "mech", name: "Mechanical" },
  { id: "civil", name: "Civil" },
  { id: "elect", name: "Electrical" },
  { id: "extc", name: "EXTC" },
];

function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await api.getNotices();
        console.log('Fetched notices:', response); // Debugging log
        setNotices(response || []);
      } catch (err) {
        console.error('Error fetching notices:', err);
        setError("Failed to load notices");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(notice => 
    activeDepartment === "all" || notice.department === activeDepartment
  );

  const getImageUrl = (notice) => {
    if (!notice.image?.path) return null;
    // Ensure path starts with /uploads/
    const path = notice.image.path.startsWith('/uploads/') 
      ? notice.image.path 
      : `/uploads/${notice.image.filename}`;
    return `http://localhost:5000${path}`;
  };

  return (
    <div className="px-2">
      {/* Department Tabs */}
      <div className="mb-4 border-b">
        <div className="flex overflow-x-auto no-scrollbar">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDepartment(dept.id)}
              className={`px-4 py-2 whitespace-nowrap ${
                activeDepartment === dept.id
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading notices...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No notices available for {departments.find(d => d.id === activeDepartment)?.name}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice._id}
              className="bg-white border-l-4 border-yellow-500 p-4 rounded-md shadow-md"
            >
              <h3 className="font-medium mb-2">{notice.title}</h3>
              {notice.image && (
                <div className="aspect-w-16 aspect-h-9 mb-2">
                  <img
                    src={getImageUrl(notice)}
                    alt={notice.title}
                    className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      console.log('Image URL:', getImageUrl(notice)); // Debug log
                      setLightboxImage(getImageUrl(notice));
                      setLightboxOpen(true);
                    }}
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                </div>
              )}
              {notice.content && (
                <p className="text-sm text-gray-600 mb-2">{notice.content}</p>
              )}
              {notice.author && (
                <p className="text-xs text-gray-500 mb-2">
                  Posted by {notice.author.firstname} {notice.author.lastname}
                </p>
              )}
              <div className="text-xs text-gray-500">
                {new Date(notice.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setLightboxOpen(false)}
        >
          <img src={lightboxImage} alt="Notice" className="max-h-full max-w-full" />
        </div>
      )}
    </div>
  );
}

export default NoticeBoard;
