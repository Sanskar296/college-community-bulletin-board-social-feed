import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,  // Use environment variable for API URL
  timeout: 10000,   // Increased timeout for slower connections
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.url, config.method);
    
    // Check for dev mode first
    const devKey = localStorage.getItem("dev_key");
    if (devKey === "dev123") {
      console.log('🔧 DEV MODE - Using dev token for request');
      config.headers.Authorization = `Bearer dev_token`;
      return config;
    }

    // Normal auth token handling
    const token = localStorage.getItem("token");
    if (token) {
      console.log('Using auth token for request:', token.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No auth token available for request');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response.data;
  },
  async (error) => {
    console.error('Response error:', error.response || error);
    
    const originalRequest = error.config;
    
    // Check if the error is due to an expired token (401) and it's not a refresh token request
    // and we haven't already tried to refresh the token for this request
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/auth/refresh-token') &&
        !originalRequest.url.includes('/auth/login')) {
      
      console.log('Token expired, attempting to refresh...');
      originalRequest._retry = true;
      
      // Dev mode bypass
      if (localStorage.getItem('dev_key') === 'dev123') {
        console.log('Dev mode - keeping dev token');
        return Promise.reject(error.response?.data || error);
      }
      
      try {
        // Get the current token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available to refresh');
        }
        
        // Call the refresh token endpoint
        const response = await axios.post(
          `${API_URL}/api/auth/refresh-token`, 
          {}, 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data && response.data.token) {
          console.log('Token refreshed successfully');
          
          // Store the new token
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
          return api(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear credentials on refresh failure
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Only redirect to login if we're not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
        }
      }
    }
    
    // For other errors or if refresh token fails
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !localStorage.getItem('dev_key')) {
      console.log('Authentication error - clearing credentials');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

const ApiService = {
  // Set auth token for API requests
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  },
  
  // Add basic HTTP methods
  get: async (endpoint, params = {}) => {
    try {
      return await api.get(endpoint, { params });
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  },
  
  post: async (endpoint, data = {}, config = {}) => {
    try {
      return await api.post(endpoint, data, config);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  },
  
  put: async (endpoint, data = {}, config = {}) => {
    try {
      return await api.put(endpoint, data, config);
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  },
  
  delete: async (endpoint, config = {}) => {
    try {
      return await api.delete(endpoint, config);
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  },
  
  // Auth endpoints
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post("/api/auth/login", credentials); // Updated path
      console.log('Login response:', response);
      if (response?.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        ApiService.setAuthToken(response.token);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error.response || error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Sending registration data:', userData);
      const response = await api.post("/api/auth/register", userData);
      console.log('Registration response:', response);
      
      if (response.success) {
        // Store token and user data if registration is successful
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error("Registration error:", error.response || error);
      throw error.response?.data || error;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await api.post('/api/auth/reset-password', data);
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  getCurrentUser: () => api.get("/api/auth/me"), // Updated path
  
  // Fix posts endpoints
  getPosts: async ({ category, department, sort = 'latest', page = 1 } = {}) => {
    try {
      console.log('Fetching posts with params:', { category, department, sort, page });
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (department && department !== 'all') params.append('department', department);
      params.append('sort', sort);
      params.append('page', page);

      const response = await api.get(`/api/posts?${params}`);
      console.log('Raw posts response:', response);

      // Handle different response structures
      if (response.success === false) {
        throw new Error(response.message || 'Failed to fetch posts');
      }

      // Normalize the response structure
      const posts = response.posts || response.data?.posts || [];
      
      return {
        success: true,
        data: { 
          posts,
          total: response.total || response.data?.total || posts.length,
          page: response.page || response.data?.page || page
        }
      };
    } catch (error) {
      console.error('Posts fetch error:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch posts',
        data: { posts: [] } 
      };
    }
  },

  getUserPosts: async (username) => {
    try {
      console.log('Fetching user posts:', username);
      const response = await api.get(`/api/posts/user/${username}`); // Fixed: Updated endpoint
      console.log('User posts response:', response);
      return response || [];
    } catch (error) {
      console.error('User posts fetch error:', error);
      return [];
    }
  },

  getPost: async (id) => {
    try {
      console.log('Fetching post details:', id);
      const response = await api.get(`/api/posts/${id}`);
      console.log('Post details response:', response);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Post details fetch error:', error);
      return {
        success: false,
        message: error.message || 'Failed to load post details',
        data: null
      };
    }
  },

  createPost: async (postData) => {
    try {
      console.log('Creating post with data:', postData);
      
      // Get auth token
      const token = localStorage.getItem('token');
      const devKey = localStorage.getItem('dev_key');
      
      if (!token && !devKey) {
        throw new Error('Authentication required');
      }
      
      // Set appropriate token and check dev mode
      let authToken = token;
      const isDevMode = devKey === 'dev123';
      
      if (isDevMode) {
        console.log('🔧 DEV MODE - Using dev token for post creation');
        authToken = 'dev_token';
      }

      // Log the FormData contents for debugging
      if (postData instanceof FormData) {
        console.log('FormData entries:');
        for (let [key, value] of postData.entries()) {
          console.log(`${key}: ${value}`);
        }
      }

      console.log(`Making API request with ${isDevMode ? 'dev token' : 'regular token'}`);
      
      const response = await api.post("/api/posts", postData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${authToken}`
        }
      });

      console.log('Post creation API response:', response);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to create post');
      }

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Post creation error:', error);
      return {
        success: false,
        message: error.message || "Failed to create post",
        data: null
      };
    }
  },
  
  // Fix notices endpoints
  getNotices: async (department = 'all') => {
    try {
      const params = new URLSearchParams();
      if (department !== 'all') params.append('department', department);
      
      const response = await api.get(`/api/notices?${params}`);
      return response;
    } catch (error) {
      console.error('Notices fetch error:', error);
      throw error;
    }
  },

  createNotice: async (noticeData) => {
    try {
      console.log('Creating notice with data:', noticeData);
      
      // Get auth token
      const token = localStorage.getItem('token');
      const devKey = localStorage.getItem('dev_key');
      
      if (!token && !devKey) {
        throw new Error('Authentication required');
      }
      
      // Set appropriate token and check dev mode
      let authToken = token;
      const isDevMode = devKey === 'dev123';
      
      if (isDevMode) {
        console.log('🔧 DEV MODE - Using dev token for notice creation');
        authToken = 'dev_token';
      }
      
      // Log the FormData contents for debugging
      if (noticeData instanceof FormData) {
        console.log('Notice FormData entries:');
        for (let [key, value] of noticeData.entries()) {
          console.log(`${key}: ${value}`);
        }
      }
      
      console.log(`Making API request with ${isDevMode ? 'dev token' : 'regular token'}`);
      
      const response = await api.post("/api/notices", noticeData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${authToken}`
        }
      });
      
      console.log('Notice creation API response:', response);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to create notice');
      }
      
      return response;
    } catch (error) {
      console.error('Notice creation error:', error);
      return {
        success: false,
        message: error.message || "Failed to create notice"
      };
    }
  },

  // Fix profile endpoint
  getUserProfile: async (username) => {
    try {
      if (!username) {
        throw new Error('Username is required');
      }

      const normalizedUsername = username.toLowerCase().trim();
      console.log('Fetching profile for:', normalizedUsername);

      // Try to get user profile
      const response = await api.get(`/api/auth/users/${normalizedUsername}`);
      console.log('Raw profile response:', response);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to load profile');
      }

      if (!response.user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: response.user,
        posts: response.posts || []
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        message: error.message || 'Failed to load profile'
      };
    }
  },
  
  getDiscussions: async (category = null) => {
    const url = category ? `/api/discussions?category=${category}` : '/api/discussions';
    return api.get(url);
  },

  createDiscussion: async (discussionData) => {
    return api.post('/api/discussions', discussionData);
  },

  joinDiscussion: async (discussionId) => {
    return api.get(`/api/discussions/${discussionId}`);
  },

  sendMessage: async (discussionId, content) => {
    return api.post(`/api/discussions/${discussionId}/messages`, { content });
  },

  getMessages: async (discussionId) => {
    return api.get(`/api/discussions/${discussionId}/messages`);
  },

  createFacultyRequest: async () => {
    try {
      const response = await api.post('/api/auth/faculty-request');
      console.log('Faculty request API response:', response);
      return response;
    } catch (error) {
      console.error('Faculty request error:', error);
      throw error;
    }
  },

  // For admin/developer
  getFacultyRequests: async () => {
    try {
      console.log('Making request to get faculty requests');
      
      // Double-check authentication
      const devKey = localStorage.getItem('dev_key');
      const token = localStorage.getItem('token');
      
      if (!token && !devKey) {
        console.error('No authentication available for faculty requests');
        return { 
          success: false, 
          message: "Authentication required", 
          requests: [] 
        };
      }
      
      const response = await api.get('/api/auth/faculty-requests');
      console.log('Faculty requests response raw:', response);
      
      // Handle different response structures
      if (!response) {
        return { success: false, message: "No response from server", requests: [] };
      }
      
      // If we got a direct array of requests without success wrapper
      if (Array.isArray(response)) {
        return { success: true, requests: response };
      }
      
      // Normal response with success flag
      if (typeof response.success !== 'undefined') {
        if (!response.success) {
          return { success: false, message: response.message || "Request failed", requests: [] };
        }
        return response; // Return the response as is, it has the right structure
      }
      
      // If response exists but has no success flag or requests array
      if (response.requests) {
        return { success: true, requests: response.requests };
      }
      
      // Last fallback
      return { success: true, requests: [], message: "No faculty requests found" };
    } catch (error) {
      console.error('Get faculty requests error:', error);
      // Return empty array instead of throwing error
      return { 
        success: false, 
        message: error.message || "Failed to fetch faculty requests", 
        requests: [] 
      };
    }
  },

  approveFacultyRequest: async (requestId, approve = true) => {
    try {
      const endpoint = approve 
        ? `/api/auth/faculty-requests/${requestId}/approve`
        : `/api/auth/faculty-requests/${requestId}/reject`;
        
      const response = await api.post(endpoint);
      return response;
    } catch (error) {
      console.error('Faculty request action error:', error);
      throw error;
    }
  },
  
  rejectFacultyRequest: async (requestId) => {
    try {
      const response = await api.post(`/api/auth/faculty-requests/${requestId}/reject`);
      return response;
    } catch (error) {
      console.error('Reject faculty request error:', error);
      throw error;
    }
  },

  // Notification endpoints
  getNotifications: async () => {
    try {
      const response = await api.get("/api/notifications");
      return response;
    } catch (error) {
      console.error("Notifications fetch error:", error);
      return { success: false, message: "Failed to fetch notifications" };
    }
  },

  getUnreadNotificationsCount: async () => {
    try {
      const response = await api.get("/api/notifications/unread/count");
      return response;
    } catch (error) {
      console.error("Notification count error:", error);
      return { success: false, message: "Failed to fetch unread notification count", count: 0 };
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error("Mark notification read error:", error);
      return { success: false, message: "Failed to mark notification as read" };
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.put("/api/notifications/read-all");
      return response;
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      return { success: false, message: "Failed to mark all notifications as read" };
    }
  },

  // Post voting
  votePost: async (postId, vote) => {
    try {
      console.log('Voting on post:', postId, vote);
      const response = await api.post(`/api/posts/${postId}/vote`, { vote });
      console.log('Vote response:', response);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Vote error:', error);
      return {
        success: false,
        message: error.message || "Failed to vote on post"
      };
    }
  },

  // Comment methods
  createComment: async (postId, content) => {
    try {
      console.log('Creating comment on post:', postId);
      const response = await api.post(`/api/posts/${postId}/comments`, { content });
      console.log('Comment creation response:', response);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Comment creation error:', error);
      return {
        success: false,
        message: error.message || "Failed to create comment"
      };
    }
  },

  // Create a reply to a comment
  createReply: async (commentId, content) => {
    try {
      console.log('Creating reply to comment:', commentId);
      const response = await api.post(`/api/comments/${commentId}/replies`, { content });
      console.log('Reply creation response:', response);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Reply creation error:', error);
      return {
        success: false,
        message: error.message || "Failed to create reply"
      };
    }
  },

  // Vote on a comment
  voteComment: async (commentId, vote) => {
    try {
      console.log('Voting on comment:', commentId, vote);
      const response = await api.post(`/api/comments/${commentId}/vote`, { vote });
      console.log('Comment vote response:', response);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Comment vote error:', error);
      return {
        success: false,
        message: error.message || "Failed to vote on comment"
      };
    }
  },
};

export default ApiService;
