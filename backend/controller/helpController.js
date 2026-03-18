export const getHelpContent = async (req, res) => {
  try {
    const helpContent = [
      {
        id: 1,
        category: "Getting Started",
        title: "Admin Portal Overview",
        content: "Welcome to the CivicEye Admin Portal. This comprehensive platform allows you to manage users, monitor issues, and generate reports for your civic governance system.",
        icon: "BookOpen"
      },
      {
        id: 2,
        category: "User Management",
        title: "Managing Citizens",
        content: "Citizens can report civic issues through the platform. Monitor their activities, track their reports, and maintain their account status from the Users dashboard.",
        icon: "Users"
      },
      {
        id: 3,
        category: "User Management",
        title: "Managing Officers",
        content: "Department officers handle issue resolution. You can assign them to specific departments, track their performance, and manage their access levels.",
        icon: "UserCheck"
      },
      {
        id: 4,
        category: "Department Management",
        title: "Department Setup",
        content: "Configure departments like Roads, Water, Sanitation, etc. Assign officers to departments and set up escalation policies for issue handling.",
        icon: "Building"
      },
      {
        id: 5,
        category: "Issue Management",
        title: "Issue Tracking",
        content: "Monitor all reported civic issues in real-time. Track status changes, view analytics, and generate comprehensive reports on issue resolution.",
        icon: "AlertCircle"
      },
      {
        id: 6,
        category: "Reporting",
        title: "Generate Reports",
        content: "Create custom reports on platform performance, department efficiency, citizen satisfaction, and issue resolution metrics.",
        icon: "BarChart3"
      },
      {
        id: 7,
        category: "Support",
        title: "Contact Support",
        content: "Need assistance? Contact our support team at support@civiceye.com or call 1-800-CIVIC-EYE for technical assistance.",
        icon: "Phone"
      },
      {
        id: 8,
        category: "Security",
        title: "Account Security",
        content: "Maintain strong passwords, enable two-factor authentication, and regularly review your admin access logs for security.",
        icon: "Lock"
      }
    ];

    res.status(200).json({
      success: true,
      message: "Help content retrieved successfully",
      data: helpContent,
      total: helpContent.length
    });
  } catch (err) {
    console.error("Error fetching help content:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch help content",
      error: err.message
    });
  }
};

export const searchHelp = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const helpContent = [
      {
        id: 1,
        category: "Getting Started",
        title: "Admin Portal Overview",
        content: "Welcome to the CivicEye Admin Portal. This comprehensive platform allows you to manage users, monitor issues, and generate reports for your civic governance system.",
        icon: "BookOpen"
      },
      {
        id: 2,
        category: "User Management",
        title: "Managing Citizens",
        content: "Citizens can report civic issues through the platform. Monitor their activities, track their reports, and maintain their account status from the Users dashboard.",
        icon: "Users"
      },
      {
        id: 3,
        category: "User Management",
        title: "Managing Officers",
        content: "Department officers handle issue resolution. You can assign them to specific departments, track their performance, and manage their access levels.",
        icon: "UserCheck"
      },
      {
        id: 4,
        category: "Department Management",
        title: "Department Setup",
        content: "Configure departments like Roads, Water, Sanitation, etc. Assign officers to departments and set up escalation policies for issue handling.",
        icon: "Building"
      },
      {
        id: 5,
        category: "Issue Management",
        title: "Issue Tracking",
        content: "Monitor all reported civic issues in real-time. Track status changes, view analytics, and generate comprehensive reports on issue resolution.",
        icon: "AlertCircle"
      },
      {
        id: 6,
        category: "Reporting",
        title: "Generate Reports",
        content: "Create custom reports on platform performance, department efficiency, citizen satisfaction, and issue resolution metrics.",
        icon: "BarChart3"
      },
      {
        id: 7,
        category: "Support",
        title: "Contact Support",
        content: "Need assistance? Contact our support team at support@civiceye.com or call 1-800-CIVIC-EYE for technical assistance.",
        icon: "Phone"
      },
      {
        id: 8,
        category: "Security",
        title: "Account Security",
        content: "Maintain strong passwords, enable two-factor authentication, and regularly review your admin access logs for security.",
        icon: "Lock"
      }
    ];

    const searchLower = query.toLowerCase();
    const results = helpContent.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );

    res.status(200).json({
      success: true,
      message: `Found ${results.length} help articles matching your search`,
      data: results,
      total: results.length
    });
  } catch (err) {
    console.error("Error searching help content:", err);
    res.status(500).json({
      success: false,
      message: "Failed to search help content",
      error: err.message
    });
  }
};

export const getHelpByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const helpContent = [
      {
        id: 1,
        category: "Getting Started",
        title: "Admin Portal Overview",
        content: "Welcome to the CivicEye Admin Portal. This comprehensive platform allows you to manage users, monitor issues, and generate reports for your civic governance system.",
        icon: "BookOpen"
      },
      {
        id: 2,
        category: "User Management",
        title: "Managing Citizens",
        content: "Citizens can report civic issues through the platform. Monitor their activities, track their reports, and maintain their account status from the Users dashboard.",
        icon: "Users"
      },
      {
        id: 3,
        category: "User Management",
        title: "Managing Officers",
        content: "Department officers handle issue resolution. You can assign them to specific departments, track their performance, and manage their access levels.",
        icon: "UserCheck"
      },
      {
        id: 4,
        category: "Department Management",
        title: "Department Setup",
        content: "Configure departments like Roads, Water, Sanitation, etc. Assign officers to departments and set up escalation policies for issue handling.",
        icon: "Building"
      },
      {
        id: 5,
        category: "Issue Management",
        title: "Issue Tracking",
        content: "Monitor all reported civic issues in real-time. Track status changes, view analytics, and generate comprehensive reports on issue resolution.",
        icon: "AlertCircle"
      },
      {
        id: 6,
        category: "Reporting",
        title: "Generate Reports",
        content: "Create custom reports on platform performance, department efficiency, citizen satisfaction, and issue resolution metrics.",
        icon: "BarChart3"
      },
      {
        id: 7,
        category: "Support",
        title: "Contact Support",
        content: "Need assistance? Contact our support team at support@civiceye.com or call 1-800-CIVIC-EYE for technical assistance.",
        icon: "Phone"
      },
      {
        id: 8,
        category: "Security",
        title: "Account Security",
        content: "Maintain strong passwords, enable two-factor authentication, and regularly review your admin access logs for security.",
        icon: "Lock"
      }
    ];

    const categoryLower = category.toLowerCase();
    const results = helpContent.filter(item =>
      item.category.toLowerCase() === categoryLower
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No help articles found for category: ${category}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${results.length} articles in ${category}`,
      data: results,
      total: results.length
    });
  } catch (err) {
    console.error("Error fetching help by category:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch help content by category",
      error: err.message
    });
  }
};
