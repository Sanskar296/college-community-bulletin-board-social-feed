import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ApiService from "../services";

function AdminFacultyRequests() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // First useEffect just for authentication check
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth for admin page, user:', user);
      
      // Wait a moment to ensure user data is loaded
      setTimeout(() => {
        if (!user) {
          console.log('No user found, waiting...');
          // Give it more time before redirecting
          setTimeout(() => {
            if (!user) {
              console.log('Still no user, redirecting to home');
              navigate("/");
              return;
            }
            setAuthChecked(true);
          }, 1000);
        } else if (user.username !== "dev" && user.role !== "admin") {
          console.log('User is not admin or dev, redirecting to home');
          navigate("/");
          return;
        } else {
          console.log('User is authorized:', user);
          setAuthChecked(true);
        }
      }, 500);
    };
    
    checkAuth();
  }, [user, navigate]);
  
  // Second useEffect to fetch data only after auth is confirmed
  useEffect(() => {
    if (authChecked && user) {
      fetchRequests();
    }
  }, [authChecked, user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching faculty requests...');
      
      // Add debug info about current user
      console.log('Current user:', user);
      
      // Debug token info
      const token = localStorage.getItem('token');
      const devKey = localStorage.getItem('dev_key');
      console.log('Auth token exists:', !!token);
      console.log('Dev key exists:', !!devKey);
      
      // Ensure token is set in API service
      if (user && user.username === "dev" && devKey === "dev123") {
        console.log('Setting dev token for API requests');
        ApiService.setAuthToken("dev_token");
      } else if (token) {
        console.log('Setting user token for API requests:', token.substring(0, 10) + '...');
        ApiService.setAuthToken(token);
      } else {
        console.error('No authentication token available');
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }
      
      const response = await ApiService.getFacultyRequests();
      console.log("Faculty requests response:", response);
      
      if (response && response.success && response.requests) {
        console.log("Setting requests:", response.requests);
        setRequests(response.requests);
      } else {
        console.log("No requests found or response error:", response);
        setRequests([]);
        if (response && !response.success) {
          setError(response.message || "Failed to load requests");
        }
      }
    } catch (err) {
      console.error("Error fetching faculty requests:", err);
      setError("Failed to load requests. " + (err.message || ""));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, approve) => {
    try {
      setSuccessMessage(null);
      setError(null);
      
      if (approve) {
        await ApiService.approveFacultyRequest(requestId);
        setSuccessMessage("Faculty request approved successfully!");
      } else {
        // Check if rejectFacultyRequest exists in API service, otherwise use approveFacultyRequest with reject parameter
        if (typeof ApiService.rejectFacultyRequest === 'function') {
          await ApiService.rejectFacultyRequest(requestId);
        } else {
          await ApiService.approveFacultyRequest(requestId, false);
        }
        setSuccessMessage("Faculty request rejected.");
      }
      
      // Refresh the list
      fetchRequests();
    } catch (err) {
      console.error("Error handling request:", err);
      setError(err.message || "Failed to process request");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading faculty requests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Faculty Access Requests</h1>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">{error}</div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">{successMessage}</div>
      )}

      <div className="grid gap-4">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request._id} className="bg-white p-6 rounded-lg shadow-md">
              {/* Faculty Details Section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Faculty Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 font-medium">Name</p>
                    <p className="text-lg">{request.firstname} {request.lastname}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Username</p>
                    <p className="text-lg">@{request.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Department</p>
                    <p className="text-lg">{request.department.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Request Date</p>
                    <p className="text-lg">{new Date(request.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRequest(request._id, false)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleRequest(request._id, true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No pending faculty requests</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFacultyRequests;
