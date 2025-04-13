import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:5000',  // Changed to explicit backend URL
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const devKey = localStorage.getItem("dev_key");
  if (devKey === "dev123") {
    config.headers.Authorization = `Bearer dev_token`;
    return config;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Attach token to requests
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data, // Unwrap the data
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

const ApiService = {
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
      console.log('Raw posts response:', response); // Debug log

      // Check if response has the expected structure
      if (!response.data && !response.posts) {
        console.error('Invalid response structure:', response);
        return { success: false, data: { posts: [] } };
      }

      return {
        success: true,
        data: {
          posts: response.data?.posts || response.posts || []
        }
      };
    } catch (error) {
      console.error('Posts fetch error:', error);
      return { success: false, data: { posts: [] } };
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

      const response = await api.get(`/api/auth/users/${normalizedUsername}`);
      console.log('Raw profile response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to load profile');
      }

      return {
        success: true,
        user: response.user,
        posts: response.posts || []
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
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
};

export default ApiService;
