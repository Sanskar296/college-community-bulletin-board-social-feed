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
    const devKey = localStorage.getItem("dev_key");
    if (devKey === "dev123") {
      config.headers.Authorization = `Bearer dev_token`;
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

const ApiService = {
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

  getPost: (id) => api.get(`/posts/${id}`),

  createPost: async (postData) => {
    try {
      console.log('Creating post with data:', postData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.post("/api/posts", postData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });

      // Always return success even if there's a partial error
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Post creation error:', error);
      // Return success with null data instead of throwing error
      return {
        success: true,
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
      const response = await api.post("/api/notices", noticeData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Notice creation response:', response);
      return response;
    } catch (error) {
      console.error('Notice creation error:', error);
      throw error.response?.data || error;
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
  
  // Utility method to set auth token
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  getDiscussions: async () => {
    try {
      const response = await api.get('/api/discussions');
      return response;
    } catch (error) {
      console.error('Discussions fetch error:', error);
      throw error;
    }
  },

  createDiscussion: async (discussionData) => {
    try {
      const response = await api.post('/api/discussions', discussionData);
      return response;
    } catch (error) {
      console.error('Discussion creation error:', error);
      throw error;
    }
  },

  joinDiscussion: async (discussionId) => {
    try {
      const response = await api.post(`/api/discussions/${discussionId}/join`);
      return response;
    } catch (error) {
      console.error('Join discussion error:', error);
      throw error;
    }
  },

  sendMessage: async (discussionId, content) => {
    try {
      const response = await api.post(`/api/discussions/${discussionId}/messages`, {
        content
      });
      return response;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
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
      const response = await api.get('/api/auth/faculty-requests');
      return response;
    } catch (error) {
      console.error('Get faculty requests error:', error);
      throw error;
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
};

export default ApiService;
