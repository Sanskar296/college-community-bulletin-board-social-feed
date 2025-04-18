"use client";

import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt, FaEdit } from "react-icons/fa";
import { format } from "date-fns";
import ApiService from "../services";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";

function DefaultProfileView() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-md shadow-md mb-6 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-400 to-gray-500 relative" />
        <div className="p-6 relative">
          <div className="absolute -top-16 left-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">?</span>
            </div>
          </div>
          <div className="ml-32">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-400">User Not Found</h1>
                <p className="text-gray-500">This user profile is not available</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-gray-500">This user might have:</p>
              <ul className="list-disc list-inside text-gray-500 ml-2">
                <li>Deleted their account</li>
                <li>Changed their username</li>
                <li>Been suspended</li>
                <li>Never existed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-md p-6 text-center">
        <p className="text-gray-500">No posts available</p>
        <Link to="/" className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

const DepartmentBadge = ({ department }) => {
  if (!department) return null;
  
  const deptInfo = {
    aiml: { bg: "bg-blue-100", text: "text-blue-800" },
    comp: { bg: "bg-green-100", text: "text-green-800" },
    extc: { bg: "bg-yellow-100", text: "text-yellow-800" },
    elect: { bg: "bg-red-100", text: "text-red-800" },
    civil: { bg: "bg-purple-100", text: "text-purple-800" },
    mech: { bg: "bg-gray-100", text: "text-gray-800" }
  };

  const { bg, text } = deptInfo[department] || { bg: "bg-blue-100", text: "text-blue-800" };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      {department.toUpperCase()}
    </span>
  );
};

function Profile() {
  const { user: currentUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { username } = useParams();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Special case for the developer account
        if (username === 'dev') {
          const devUser = {
            _id: "dev_user",
            username: "dev",
            role: "admin",
            firstname: "Developer",
            lastname: "Admin",
            department: "comp",
            createdAt: new Date().toISOString(),
            isApproved: true,
            status: 'active'
          };
          
          setProfileData(devUser);
          // Empty posts for dev user initially
          setPosts([]);
          setLoading(false);
          return;
        }
        
        console.log('Fetching profile for:', username);
        const response = await ApiService.getUserProfile(username);
        console.log('Profile API response:', response);

        if (response.success) {
          setProfileData(response.user);
          setPosts(response.posts || []);
        } else {
          setError(response.message || "Failed to load profile");
          setProfileData(null);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to load profile");
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading profile...</p>
      </div>
    );
  }

  // Show default view if no profile data
  if (!profileData || error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <DefaultProfileView />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-md shadow-md mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
            {profileData?.identifier && (
              <div className="absolute bottom-2 right-4 bg-white/90 px-3 py-1 rounded-full text-sm text-blue-600">
                {profileData.identifier.toUpperCase()}
              </div>
            )}
          </div>

          <div className="p-6 relative">
            <div className="absolute -top-16 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={profileData?.avatar || "/images/default_profile.jpg"}
                  alt={`${profileData?.firstname}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/default_profile.jpg";
                  }}
                />
              </div>
            </div>

            <div className="ml-32">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">
                    {profileData
                      ? `${profileData.firstname} ${profileData.lastname}`
                      : "Guest User"}
                  </h1>
                  {profileData && <p className="text-gray-500">@{profileData.username}</p>}
                </div>

                {currentUser && (
                  <Link
                    to="/edit-profile"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </Link>
                )}
              </div>

              {profileData && (
                <div className="mt-4 space-y-3">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">First Name</p>
                        <p className="font-medium">{profileData.firstname}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Name</p>
                        <p className="font-medium">{profileData.lastname}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Username</p>
                        <p className="font-medium">@{profileData.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Academic Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <DepartmentBadge department={profileData.department} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <span className={`inline-block ${
                          profileData.role === 'admin' || profileData.username === 'dev' 
                            ? 'bg-red-100 text-red-800' 
                            : profileData.role === 'faculty'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        } px-2 py-1 rounded text-sm`}>
                          {profileData.username === 'dev' 
                            ? 'Developer' 
                            : profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                        </span>
                      </div>
                      {profileData.role === 'student' && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">Year</p>
                            <p className="font-medium">{profileData.year}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Student UID</p>
                            <p className="font-medium">{profileData.uid}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Account Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Account Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          profileData.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profileData.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium">
                          {format(new Date(profileData.createdAt), "MMMM yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-md mb-6">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 text-center flex-1 ${
                "border-b-2 border-blue-500 text-blue-500 font-medium"
              }`}
            >
              Your Posts ({posts.length})
            </button>
          </div>

          <div className="p-4">
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {currentUser
                    ? "You haven't created any posts yet."
                    : "No posts available."}
                </p>
                {currentUser && (
                  <Link
                    to="/create-post"
                    className="inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Create Your First Post
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;