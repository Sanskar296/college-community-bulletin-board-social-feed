// This file is deprecated. Please use api.jsx instead.
// All functionality has been migrated to api.jsx
import ApiService from './api.jsx';

export const api = {
  // Notification endpoints are now available in api.jsx
  // These exported methods redirect to the main ApiService
  getNotifications: ApiService.getNotifications,
  getUnreadNotificationsCount: ApiService.getUnreadNotificationsCount,
  markNotificationAsRead: ApiService.markNotificationAsRead,
  markAllNotificationsAsRead: ApiService.markAllNotificationsAsRead,
  
  // Add other methods that might be referenced directly
  get: ApiService.get,
  post: ApiService.post,
  put: ApiService.put,
  delete: ApiService.delete,
  
  // Include any other methods that might be referenced
  createPost: ApiService.createPost,
  createNotice: ApiService.createNotice,
  resetPassword: ApiService.resetPassword,
  getNotices: ApiService.getNotices
};

// Also export the default ApiService as the default export
export default ApiService; 