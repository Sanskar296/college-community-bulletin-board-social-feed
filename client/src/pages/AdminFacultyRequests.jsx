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

  useEffect(() => {
    // Check if user is admin or dev
    if (!user || (user.username !== "dev" && user.role !== "admin")) {
      navigate("/");
      return;
    }
    
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getFacultyRequests();
      console.log("Faculty requests:", response);
      
      if (response && response.requests) {
        setRequests(response.requests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching faculty requests:", err);
      setError("Failed to load requests. " + (err.message || ""));
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
