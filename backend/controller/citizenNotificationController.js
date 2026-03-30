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

    const notification = await Notification.findOne({ _id: id, citizen: citizenId }).lean();
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.isRead) {
      return res.status(200).json({ success: true, message: 'Notification already read', data: notification });
    }

    // Avoid `save()` to prevent mongoose enum validation issues for older documents.
    await Notification.updateOne({ _id: id, citizen: citizenId }, { $set: { isRead: true } });

    res.status(200).json({ success: true, message: 'Notification marked read' });
  } catch (error) {
    console.error('Error marking notification read:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark notification read', error: error.message });
  }
};

// Not currently used by citizenRouter, but kept for completeness
export const markAllNotificationsRead = async (req, res) => {
  try {
    const citizenId = req.citizen?.id || req.citizen?._id;

    if (!citizenId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await Notification.updateMany({ citizen: citizenId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked read' });
  } catch (error) {
    console.error('Error marking all notifications read:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications read', error: error.message });
  }
};

