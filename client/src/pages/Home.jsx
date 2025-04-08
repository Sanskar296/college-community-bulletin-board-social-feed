"use client";

import { useState, useEffect } from "react";
import Courses from "../components/Courses";
import Schedule from "../components/Schedule";
import Exams from "../components/Exams";
import Discussions from "../components/Discussions";
import Library from "../components/Library";
import HelpCenter from "../components/HelpCenter";
import CategorySidebar from "../components/CategorySidebar";
import NoticeBoard from "../components/NoticeBoard";
import PostCard from "../components/PostCard";
import ApiService from "../services/api"; // Fix: Changed from ApiService to api

const categories = [
  { id: "all", name: "All Categories" },
  { id: "events", name: "Events" },
  { id: "academic", name: "Academic" },
  { id: "lost-found", name: "Lost & Found" },
  { id: "issues", name: "Issues" },
  { id: "general", name: "General" }
];

const departments = [
  { id: "all", name: "All Departments" },
  { id: "aiml", name: "CSE(AIML)" },
  { id: "comp", name: "Computer" },
  { id: "mech", name: "Mechanical" },
  { id: "civil", name: "Civil" },
  { id: "elect", name: "Electrical" },
  { id: "extc", name: "EXTC" }
];

function Home() {
  const [activeView, setActiveView] = useState("notices"); // Changed default to notices
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching posts with params:', {
          category: selectedCategory,
          department: selectedDepartment,
          sort: sortBy
        });

        const response = await ApiService.getPosts({
          category: selectedCategory,
          department: selectedDepartment,
          sort: sortBy
        });

        console.log('Posts fetch response:', response);

        if (response.success) {
          console.log('Setting posts:', response.data.posts);
          setPosts(response.data.posts);
        } else {
          throw new Error(response.message || 'Failed to fetch posts');
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    if (activeView === 'posts') {
      fetchPosts();
    }
  }, [activeView, selectedCategory, selectedDepartment, sortBy]);

  const renderSortingBar = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border">
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Category</label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Department</label>
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2 border rounded-md text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Sort By</label>
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setSortBy("latest")}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                sortBy === "latest"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`flex-1 px-3 py-2 text-sm font-medium border-x ${
                sortBy === "popular"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSortBy("comments")}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                sortBy === "comments"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Comments
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case "notices":
        return (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="bg-red-500 p-4 rounded-t-lg">
              <h2 className="text-xl font-bold text-white text-center">Notice Board</h2>
            </div>
            <div className="p-4">
              <NoticeBoard />
            </div>
          </div>
        );
      case "posts":
        return (
          <div className="space-y-4">
            {renderSortingBar()}
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        );
      case "courses":
        return <Courses />;
      case "schedule":
        return <Schedule />;
      case "exams":
        return <Exams />;
      case "discussions":
        return <Discussions />;
      case "library":
        return <Library />;
      case "help-center":
        return <HelpCenter />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <CategorySidebar onSelect={setActiveView} />
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          {renderContent()}
        </div>

        {/* Right Sidebar */}
        <div className="md:w-1/4 flex flex-col gap-4">
          {/* Community Rules */}
          <div className="bg-white rounded-md shadow-md p-4">
            <h2 className="text-lg font-medium mb-3">Community Rules</h2>
            <ul className="text-sm space-y-2">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Be respectful to fellow students and faculty</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>No spam or self-promotion</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Use appropriate categories for your posts</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Report inappropriate content</span>
              </li>
            </ul>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-md shadow-md p-4">
            <h2 className="text-lg font-medium mb-3">Upcoming Events</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <h3 className="font-medium">Hack2Crack 2.0 2025</h3>
                <p className="text-sm text-gray-500">March 20-21 • Class and Library</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <h3 className="font-medium">GDG Community Talk</h3>
                <p className="text-sm text-gray-500">Oct 22 • Seminar Hall</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-3">
                <h3 className="font-medium">Vidisha Night</h3>
                <p className="text-sm text-gray-500">Feb 21 • Open Ground</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;