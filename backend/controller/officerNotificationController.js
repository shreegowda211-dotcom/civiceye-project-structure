import Notification from '../model/notificationSchema.js';

export const getOfficerNotifications = async (req, res) => {
  try {
    const officerId = req.officer?.id || req.officer?._id;

    if (!officerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notifications = await Notification.find({ officer: officerId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching officer notifications:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markOfficerNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const officerId = req.officer?.id || req.officer?._id;

    if (!officerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notification = await Notification.findOne({ _id: id, officer: officerId }).lean();
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.isRead) {
      return res.status(200).json({ success: true, message: 'Notification already read' });
    }

    // Avoid `save()` to prevent mongoose enum validation issues for older documents.
    await Notification.updateOne({ _id: id, officer: officerId }, { $set: { isRead: true } });

    res.status(200).json({ success: true, message: 'Notification marked read' });
  } catch (error) {
    console.error('Error marking officer notification read:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark notification read', error: error.message });
  }
};

// Not currently wired to any route, but kept for consistency
export const markAllOfficerNotificationsRead = async (req, res) => {
  try {
    const officerId = req.officer?.id || req.officer?._id;

    if (!officerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await Notification.updateMany({ officer: officerId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked read' });
  } catch (error) {
    console.error('Error marking all officer notifications read:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications read', error: error.message });
  }
};

