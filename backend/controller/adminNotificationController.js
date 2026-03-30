// Placeholder for future admin notification features.
// Currently notifications are stored against citizen/officer only, so admin has no dedicated notifications route.

export const getAdminNotifications = async (req, res) => {
  return res.status(200).json({ success: true, notifications: [] });
};

