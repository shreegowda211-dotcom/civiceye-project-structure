import Notification from '../model/notificationSchema.js';

export const getNotifications = async (req, res) => {
  try {
    const citizenId = req.citizen?.id || req.citizen?._id;

    if (!citizenId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notifications = await Notification.find({ citizen: citizenId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, message: 'Notifications retrieved', data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenId = req.citizen?.id || req.citizen?._id;

    if (!citizenId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notification = await Notification.findOne({ _id: id, citizen: citizenId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.read) {
      return res.status(200).json({ success: true, message: 'Notification already read', data: notification });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked read', data: notification });
  } catch (error) {
    console.error('Error marking notification read:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark notification read', error: error.message });
  }
};