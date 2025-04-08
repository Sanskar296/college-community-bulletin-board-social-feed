"use client";

import { FaBook, FaCalendarAlt, FaUsers, FaGraduationCap, FaClipboardList, FaStickyNote, FaPen } from "react-icons/fa";

function Sidebar({ onSelect, onClose }) {
  const handleSelect = (option) => {
    onSelect(option);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4">
      {/* Content Sections */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Content</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleSelect("notices")}
              className="flex items-center p-2 w-full text-left rounded-md hover:bg-gray-100"
            >
              <FaStickyNote className="mr-2" />
              <span>Notices</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSelect("posts")}
              className="flex items-center p-2 w-full text-left rounded-md hover:bg-gray-100"
            >
              <FaPen className="mr-2" />
              <span>Posts</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Community Section */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Community</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleSelect("discussions")}
              className="flex items-center p-2 w-full text-left rounded-md hover:bg-gray-100"
            >
              <FaUsers className="mr-2" />
              <span>Discussions</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Academic Section */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Academic</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleSelect("courses")}
              className="flex items-center p-2 w-full text-left rounded-md hover:bg-gray-100"
            >
              <FaGraduationCap className="mr-2" />
              <span>Courses</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSelect("schedule")}
              className="flex items-center p-2 w-full text-left rounded-md hover:bg-gray-100"
            >
              <FaCalendarAlt className="mr-2" />
              <span>Schedule</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSelect("exams")}
              className="flex items-center p-2 w-full text-left rounded-md hover:bg-gray-100"
            >
              <FaClipboardList className="mr-2" />
              <span>Exams</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Resources Section */}
      <div>
        <h3 className="text-md font-medium mb-2">Resources</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleSelect("library")}
              className="flex items-center p-2 w-full text-left rounded-md hover:bg-gray-100"
            >
              <FaBook className="mr-2" />
              <span>Library</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSelect("help-center")}
              className="flex items-center p-2 w-full text-left rounded-md hover:bg-gray-100"
            >
              <FaUsers className="mr-2" />
              <span>Help Center</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;

