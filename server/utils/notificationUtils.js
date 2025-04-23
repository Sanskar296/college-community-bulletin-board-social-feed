import Notification from "../models/Notification.js";
import User from "../models/User.js";

/**
 * Create a notification for a single user
 * @param {string} userId - The recipient user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (notice, post, comment, system)
 * @param {string} entityId - ID of the related entity
 * @returns {Promise<Object>} The created notification
 */
export const createNotification = async (userId, title, message, type = 'system', entityId = null) => {
  try {
    const notification = new Notification({
      recipient: userId,
      title,
      message,
      type,
      entityId: entityId || undefined
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Create notifications for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (notice, post, comment, system)
 * @param {string} entityId - ID of the related entity
 * @returns {Promise<Array<Object>>} Array of created notifications
 */
export const createNotifications = async (userIds, title, message, type = 'system', entityId = null) => {
  try {
    const notifications = userIds.map(userId => ({
      recipient: userId,
      title,
      message,
      type,
      entityId: entityId || undefined
    }));
    
    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Error creating notifications:", error);
    return [];
  }
};

/**
 * Send notification to all users or filtered by department
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (notice, post, comment, system)
 * @param {string} entityId - ID of the related entity
 * @param {string} department - Filter by department (all for everyone)
 * @returns {Promise<Array<Object>>} Array of created notifications
 */
export const notifyAllUsers = async (title, message, type = 'system', entityId = null, department = 'all') => {
  try {
    // Find all users to notify (optionally filtered by department)
    const query = { status: 'active', isApproved: true };
    if (department !== 'all') {
      query.department = department;
    }
    
    const users = await User.find(query).select('_id');
    
    if (!users.length) {
      console.log("No users found to notify");
      return [];
    }
    
    // Extract user IDs
    const userIds = users.map(user => user._id);
    
    // Create notifications for all users
    return await createNotifications(userIds, title, message, type, entityId);
  } catch (error) {
    console.error("Error notifying users:", error);
    return [];
  }
}; 