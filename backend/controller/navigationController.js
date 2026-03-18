export const getUserNotifications = async (req, res) => {
  try {
    // Check for auth token - user must be authenticated
    const authToken = req.header("auth-token");
    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Simulated notifications - can be replaced with real database queries
    const notifications = [
      {
        id: 1,
        title: "New Issue Reported",
        message: "A new civic issue has been reported in your area",
        type: "issue",
        timestamp: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: 2,
        title: "Status Update",
        message: "Your reported issue has been assigned to an officer",
        type: "status",
        timestamp: new Date(Date.now() - 7200000),
        read: false,
      },
      {
        id: 3,
        title: "Resolution Pending",
        message: "An issue is awaiting your approval",
        type: "pending",
        timestamp: new Date(Date.now() - 10800000),
        read: false,
      },
    ];

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: err.message,
    });
  }
};

export const getNavigationConfig = async (req, res) => {
  try {
    const userRole = req.query.role || "citizen";

    const navigationConfig = {
      citizen: {
        primary: [
          { label: "Dashboard", path: "/citizen" },
          { label: "Report Issue", path: "/citizen/report" },
          { label: "My Issues", path: "/citizen/issues" },
          { label: "Track Issue", path: "/citizen/track" },
        ],
        help: {
          email: "support@civiceye.com",
          phone: "1-800-CIVIC-EYE",
          hours: "Monday - Friday, 9AM - 6PM EST",
        },
      },
      officer: {
        primary: [
          { label: "Dashboard", path: "/officer" },
          { label: "Assigned Issues", path: "/officer/issues" },
          { label: "Update Status", path: "/officer/update" },
        ],
        help: {
          email: "support@civiceye.com",
          phone: "1-800-CIVIC-EYE",
          hours: "Monday - Friday, 9AM - 6PM EST",
        },
      },
      admin: {
        primary: [
          { label: "Dashboard", path: "/admin" },
          { label: "Add Officer", path: "/admin/add-officer" },
          { label: "Analytics", path: "/admin/analytics" },
          { label: "All Issues", path: "/admin/issues" },
          { label: "Users", path: "/admin/users" },
          { label: "Departments", path: "/admin/departments" },
          { label: "Help", path: "/admin/help" },
        ],
        help: {
          email: "support@civiceye.com",
          phone: "1-800-CIVIC-EYE",
          hours: "Monday - Friday, 9AM - 6PM EST",
        },
      },
    };

    const config = navigationConfig[userRole.toLowerCase()] || navigationConfig.citizen;

    res.status(200).json({
      success: true,
      message: "Navigation configuration retrieved successfully",
      data: config,
      role: userRole.toLowerCase(),
    });
  } catch (err) {
    console.error("Error fetching navigation config:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch navigation configuration",
      error: err.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    // Simulated marking as read - replace with real database query
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: {
        notificationId,
        read: true,
      },
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: err.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // Check for auth token
    const authToken = req.header("auth-token");
    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Return user profile data from the authenticated user
    // In a real application, this would query the database using the token
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        name: "User",
        email: "user@example.com",
        role: "citizen",
        department: null,
        avatar: null,
        joinedDate: new Date(),
      },
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: err.message,
    });
  }
};
