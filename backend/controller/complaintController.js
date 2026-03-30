import mongoose from "mongoose";
import Complaint from "../model/complaintSchema.js";
import Officer from "../model/officerSchema.js";
import Notification from "../model/notificationSchema.js";

// ===============================
// 🆔 Generate Next Issue ID
// ===============================

const generateNextIssueId = async () => {
  try {
    // Get the last complaint to determine next ID
    const lastComplaint = await Complaint.findOne()
      .sort({ createdAt: -1 })
      .exec();

    let nextNumber = 1;
    
    if (lastComplaint && lastComplaint.issueId) {
      // Extract number from issueId (e.g., "ISS26001" -> 1)
      const match = lastComplaint.issueId.match(/ISS26(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Format: ISS26 + 5 digit number (ISS26001, ISS26002, etc.)
    const issueId = `ISS26${String(nextNumber).padStart(5, '0')}`;
    return issueId;
  } catch (error) {
    console.error("❌ Error generating issue ID:", error);
    throw error;
  }
};

// ===============================
// 📝 Create Complaint Controller
// ===============================  

export const createComplaint = async (req, res) => {
  try {
    console.log("📝 Creating complaint...");
    console.log("   Request body:", req.body);
    console.log("   User info:", req.citizen);

    const { title, description, category, priority, location } = req.body;

    const citizenId = req.citizen.id; // from auth middleware (JWT token stores as 'id')
    
    if (!citizenId) {
      console.error("❌ No citizen ID found");
      return res.status(400).json({
        message: "Citizen ID not found in token",
        error: "Missing authentication"
      });
    }

    // Generate unique issue ID
    const issueId = await generateNextIssueId();
    console.log("🆔 Generated Issue ID:", issueId);

    // Auto-assign officer based on category
    const officer = await Officer.findOne({ department: category });
    if (!officer) {
      return res.status(400).json({
        message: "No officer available for the selected category",
      });
    }

    // Create new complaint
    const newComplaint = new Complaint({
      issueId,
      title,
      description,
      category,
      priority,
      location,
      citizen: citizenId,
      assignedOfficer: officer._id, // Assign officer
    });

    // Save to database
    const savedComplaint = await newComplaint.save();

    console.log("✅ Complaint created successfully:", issueId);

    // Notify citizen + assigned officer about the new complaint assignment.
    // (Ensures `/citizen/notifications` and `/officer/notifications` can show real data.)
    await Notification.create({
      citizen: citizenId,
      type: 'assignment',
      message: `New complaint submitted: ${issueId}. Assigned to ${officer.name}.`,
      link: `/citizen/track/${issueId}`,
      isRead: false,
    });

    await Notification.create({
      officer: officer._id,
      type: 'assignment',
      message: `New complaint assigned: ${savedComplaint.title} in ${savedComplaint.category} category.`,
      link: `/officer/issue/${savedComplaint.issueId || savedComplaint._id}`,
      isRead: false,
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint: savedComplaint
    });

  } catch (error) {
    console.error("❌ Error creating complaint:", error);
    res.status(500).json({
      message: "Error creating complaint",
      error: error.message
    });
  }
};

// ===============================
// 📋 Get Complaints by Citizen Controller
// ===============================  

export const getComplaintsByCitizen = async (req, res) => {
  try {
    const citizenId = req.citizen.id; // from auth middleware (JWT token stores as 'id')

    const complaints = await Complaint.find({ citizen: citizenId });

    res.status(200).json({
      message: "Complaints retrieved successfully",
      complaints
    });

  } catch (error) {
    res.status(500).json({
      message: "Error retrieving complaints",
      error: error.message
    });
  }
};

// ===============================
// 📋 Get Single Complaint by ID Controller
// ===============================  

export const getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const citizenId = req.citizen.id;

    console.log("🔍 Searching for complaint:", complaintId);
    console.log("   Citizen ID:", citizenId);

    // Try to find by issueId first (e.g., ISS26001), then by MongoDB _id
    const searchQuery = {
      $or: [
        { issueId: complaintId.toUpperCase() }
      ]
    };

    // Try to parse as MongoDB ObjectId
    try {
      const mongoId = new mongoose.Types.ObjectId(complaintId);
      searchQuery.$or.push({ _id: mongoId });
    } catch (e) {
      // Not a valid ObjectId, that's okay - just search by issueId
      console.log("   Note: Not a valid MongoDB ObjectId, searching by issueId only");
    }

    console.log("   Search query:", JSON.stringify(searchQuery));

    let complaint = await Complaint.findOne(searchQuery)
      .populate('citizen', 'name email')
      .populate('assignedOfficer', 'name email');

    console.log("   Found complaint:", complaint ? complaint.issueId : "Not found");

    if (!complaint) {
      console.log("   ❌ Complaint not found");
      return res.status(404).json({
        message: "Complaint not found",
        error: "No complaint with this ID"
      });
    }

    // Check if citizen owns this complaint
    if (complaint.citizen._id.toString() !== citizenId) {
      console.log("   ❌ Unauthorized - citizen mismatch");
      return res.status(403).json({
        message: "Unauthorized",
        error: "You don't have permission to view this complaint"
      });
    }

    console.log("   ✅ Complaint retrieved successfully");

    res.status(200).json({
      message: "Complaint retrieved successfully",
      complaint
    });

  } catch (error) {
    console.error("❌ Error retrieving complaint:", error);
    res.status(500).json({
      message: "Error retrieving complaint",
      error: error.message
    });
  }
};

// ===============================
// 📋 Get All Complaints Controller (for Officers)
// ===============================  

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('citizen', 'name email');

    res.status(200).json({
      message: "All complaints retrieved successfully",
      complaints
    });

  } catch (error) {
    res.status(500).json({
      message: "Error retrieving complaints",
      error: error.message
    });
  }
};

// ===============================
// 👮 Get Complaints for Officer (by Department)
// ===============================

export const getComplaintsForOfficer = async (req, res) => {
  try {
    console.log("\n👮 GET COMPLAINTS FOR OFFICER");
    console.log("   📋 Full req.officer object:", req.officer);
    
    const officerId = req.officer?.id || req.officer?._id;
    console.log("   🆔 Officer ID extracted:", officerId);
    
    if (!officerId) {
      console.log("   ❌ No officer ID found in token");
      return res.status(400).json({
        message: "No officer ID in token",
        error: "Missing officer identification"
      });
    }

    console.log("   🔍 Looking up officer with ID:", officerId);
    // Get officer details to know their department
    const officerData = await Officer.findById(officerId);
    console.log("   ✅ Officer lookup completed");
    
    if (!officerData) {
      console.log("   ❌ Officer not found in database");
      return res.status(404).json({
        message: "Officer not found",
        error: "Officer details not found"
      });
    }

    console.log("   ✅ Officer found:", officerData._id);
    console.log("   📝 Officer name:", officerData.name);
    console.log("   📂 Officer department:", officerData.department);

    // Get all complaints assigned to this officer's department (category)
    console.log("   🔎 Searching for complaints with category:", officerData.department);
    const complaints = await Complaint.find({ category: officerData.department })
      .populate('citizen', 'name email')
      .populate('assignedOfficer', 'name email department')
      .sort({ createdAt: -1 });

    console.log("   ✅ Found", complaints.length, "complaints for department:", officerData.department);

    res.status(200).json({
      message: "Officer complaints retrieved successfully",
      officer: {
        name: officerData.name,
        email: officerData.email,
        department: officerData.department
      },
      complaints
    });

  } catch (error) {
    console.error("\n❌ ERROR RETRIEVING OFFICER COMPLAINTS");
    console.error("   Error type:", error.constructor.name);
    console.error("   Error message:", error.message);
    console.error("   Error stack:", error.stack);
    console.error("   Full error:", error);
    
    res.status(500).json({
      message: "Error retrieving complaints",
      error: error.message,
      errorType: error.constructor.name
    });
  }
};

// ===============================
// 🔄 Update Complaint Status (Officer)
// ===============================

export const updateComplaintStatus = async (req, res) => {
  try {
    console.log("🔍 Incoming request body:", req.body);
    console.log("🔍 Incoming request headers:", req.headers);
    console.log("🔍 Content-Type:", req.headers['content-type']);

    const { complaintId } = req.params;
    
    // Handle both JSON and FormData requests
    const status = req.body?.status || (req.body && Object.keys(req.body).find(key => key === 'status') ? req.body.status : null);
    const notes = req.body?.notes;
    const proofImage = req.file || req.body?.proofImage;
    
    let officerId = req.officer?.id || req.officer?._id;

    console.log("🔄 Officer updating complaint:", complaintId);
    console.log("   Status field:", status);
    console.log("   Has notes:", !!notes);
    console.log("   Has proof image:", !!proofImage);

    // Ensure officerId exists
    if (!officerId) {
      return res.status(401).json({
        message: "Unauthorized",
        error: "Officer ID not found in authentication token"
      });
    }

    // Convert to ObjectId if it's a string and valid
    if (typeof officerId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(officerId)) {
        console.log("❌ Invalid officer ID format:", officerId);
        return res.status(400).json({
          message: "Invalid officer ID",
          error: "Officer ID is not a valid identifier"
        });
      }
      officerId = new mongoose.Types.ObjectId(officerId);
    } else if (officerId instanceof mongoose.Types.ObjectId) {
      // Already an ObjectId, convert to string then back to ensure it's valid
      try {
        officerId = new mongoose.Types.ObjectId(officerId.toString());
      } catch (e) {
        console.log("❌ Invalid officer ObjectId:", officerId);
        return res.status(400).json({
          message: "Invalid officer ID",
          error: "Officer ID is corrupted"
        });
      }
    } else {
      // Try to convert whatever it is
      try {
        officerId = new mongoose.Types.ObjectId(String(officerId));
      } catch (e) {
        console.log("❌ Cannot convert officer ID to ObjectId:", officerId, e.message);
        return res.status(400).json({
          message: "Invalid officer ID",
          error: "Officer ID cannot be converted to a valid identifier"
        });
      }
    }

    // Validate status exists
    if (!status) {
      return res.status(400).json({
        message: "Bad request",
        error: "Status is required in request body"
      });
    }

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        error: "Status must be one of: " + validStatuses.join(", ")
      });
    }

    // Find complaint by issueId or _id (as ObjectId)
    const searchCriteria = [];

    // Try to parse as MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(complaintId)) {
      try {
        const mongoId = new mongoose.Types.ObjectId(complaintId);
        searchCriteria.push({ _id: mongoId });
        console.log("   ✅ Parsed as ObjectId");
      } catch (e) {
        console.log("   ⚠️ ObjectId parse failed:", e.message);
      }
    }

    // Also try as issueId (exact match, case-insensitive)
    searchCriteria.push({ issueId: complaintId });
    searchCriteria.push({ issueId: complaintId.toUpperCase() });
    searchCriteria.push({ issueId: complaintId.toLowerCase() });

    // Remove duplicates
    const seenValues = new Set();
    const uniqueSearchCriteria = searchCriteria.filter(criterion => {
      const key = JSON.stringify(criterion);
      if (seenValues.has(key)) return false;
      seenValues.add(key);
      return true;
    });

    const searchQuery = { $or: uniqueSearchCriteria };
    console.log("   🔍 Search query:", JSON.stringify(searchQuery, null, 2));

    if (!uniqueSearchCriteria.length) {
      return res.status(400).json({
        message: "Invalid complaint ID",
        error: "Complaint ID format is invalid"
      });
    }

    const complaint = await Complaint.findOne(searchQuery)
      .populate('citizen', 'name email')
      .populate('assignedOfficer', 'name email');

    if (!complaint) {
      console.log("❌ Complaint not found with ID:", complaintId);
      return res.status(404).json({
        message: "Complaint not found",
        error: "No complaint with this ID"
      });
    }

    // Get officer's department
    const officer = await Officer.findById(officerId);
    if (!officer) {
      return res.status(404).json({
        message: "Officer not found",
        error: "Could not find officer details"
      });
    }

    // Check if complaint belongs to officer's department
    if (complaint.category !== officer.department) {
      console.log("❌ Unauthorized - complaint not in officer's department");
      return res.status(403).json({
        message: "Unauthorized",
        error: "This complaint is not in your department"
      });
    }

    // Update the complaint status and officer notes
    complaint.status = status;
    complaint.assignedOfficer = officerId; // Assign to updating officer
    
    // Add resolution notes if provided
    if (notes) {
      complaint.resolutionNotes = notes;
    }
    
    // Add proof image path if provided
    if (proofImage) {
      // proofImage can be a multer file object with 'path' and 'filename' properties
      // or a string (fallback case)
      complaint.proofImagePath = typeof proofImage === 'string' ? proofImage : (proofImage.path || proofImage.filename);
    }
    
    const updatedComplaint = await complaint.save();

    console.log("✅ Complaint status updated to:", status);
    console.log("✅ Resolution notes saved:", !!notes);
    console.log("✅ Proof image saved:", !!proofImage);

    // Create notifications for officer + citizen based on status.
    // - Resolved -> type "resolved"
    // - Any other update -> type "status_update"
    const notifType = status === 'Resolved' ? 'resolved' : 'status_update';
    const citizenIdToNotify = updatedComplaint.citizen?._id || updatedComplaint.citizen;

    // Officer notification
    await Notification.create({
      officer: officerId,
      type: notifType,
      message: `Complaint ${updatedComplaint.issueId || updatedComplaint._id} status updated to ${status}.`,
      link: `/officer/issue/${updatedComplaint.issueId || updatedComplaint._id}`,
      isRead: false,
    });

    // Citizen notification (if we can identify citizen)
    if (citizenIdToNotify) {
      await Notification.create({
        citizen: citizenIdToNotify,
        type: notifType,
        message: `Your complaint ${updatedComplaint.issueId || updatedComplaint._id} status is now ${status}.`,
        link: `/citizen/track/${updatedComplaint.issueId || updatedComplaint._id}`,
        isRead: false,
      });
    }

    res.status(200).json({
      message: "Complaint status updated successfully",
      complaint: updatedComplaint
    });

  } catch (error) {
    console.error("❌ Error in updateComplaintStatus:", error);
    console.error("   Error name:", error.name);
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Full error:", JSON.stringify(error, null, 2));
    
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code,
        path: error.path
      } : undefined
    });
  }
};

// ===============================
// 📊 Get Officer Performance Analytics
// ===============================

export const getOfficerPerformance = async (req, res) => {
  try {
    console.log("\n📊 GET OFFICER PERFORMANCE ANALYTICS");
    
    const officerId = req.officer?.id || req.officer?._id;
    console.log("   🆔 Officer ID:", officerId);
    
    if (!officerId) {
      console.log("   ❌ No officer ID found in token");
      return res.status(400).json({
        message: "No officer ID in token",
        error: "Missing officer identification"
      });
    }

    // Get officer details
    const officer = await Officer.findById(officerId);
    
    if (!officer) {
      console.log("   ❌ Officer not found");
      return res.status(404).json({
        message: "Officer not found",
        error: "Officer details not found"
      });
    }

    console.log("   ✅ Officer found:", officer.name);
    
    // Get all complaints assigned to this officer
    const complaints = await Complaint.find({ assignedOfficer: officerId });
    
    console.log("   📋 Total complaints assigned:", complaints.length);
    
    // Calculate basic stats
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const rejected = complaints.filter(c => c.status === 'Rejected').length;
    const totalAssigned = complaints.length;
    
    // Calculate resolution times (in hours)
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved' && c.updatedAt && c.createdAt);
    const resolutionTimes = resolvedComplaints.map(c => {
      const timeInMs = new Date(c.updatedAt) - new Date(c.createdAt);
      return timeInMs / (1000 * 60 * 60); // Convert to hours
    });
    
    const avgResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length / 24 // Convert to days
      : 0;
    
    const fastestResolution = resolutionTimes.length > 0 
      ? Math.min(...resolutionTimes).toFixed(1)
      : '0';
    
    const slowestResolution = resolutionTimes.length > 0 
      ? Math.max(...resolutionTimes).toFixed(1)
      : '0';
    
    // Calculate this month and last month averages
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    const thisMonthResolved = complaints.filter(c => 
      c.status === 'Resolved' && 
      new Date(c.updatedAt) >= currentMonthStart
    );
    
    const lastMonthResolved = complaints.filter(c => 
      c.status === 'Resolved' && 
      new Date(c.updatedAt) >= lastMonthStart && 
      new Date(c.updatedAt) <= lastMonthEnd
    );
    
    const thisMonthTimes = thisMonthResolved
      .filter(c => c.createdAt)
      .map(c => (new Date(c.updatedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
    
    const lastMonthTimes = lastMonthResolved
      .filter(c => c.createdAt)
      .map(c => (new Date(c.updatedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
    
    const thisMonthAvg = thisMonthTimes.length > 0 
      ? thisMonthTimes.reduce((a, b) => a + b, 0) / thisMonthTimes.length
      : 0;
    
    const lastMonthAvg = lastMonthTimes.length > 0
      ? lastMonthTimes.reduce((a, b) => a + b, 0) / lastMonthTimes.length
      : 0;
    
    // Calculate improvement percentage
    const improvementPercentage = lastMonthAvg > 0 
      ? ((lastMonthAvg - thisMonthAvg) / lastMonthAvg) * 100
      : 0;
    
    // Build monthly data for chart
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      const monthComplaintsCount = complaints.filter(c =>
        c.status === 'Resolved' &&
        new Date(c.updatedAt) >= monthStart &&
        new Date(c.updatedAt) <= monthEnd
      ).length;
      
      const monthName = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyData.push({
        month: monthName,
        count: monthComplaintsCount
      });
    }
    
    // Build recent activities
    const recentComplaints = complaints
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
    
    const recentActivities = recentComplaints.map(c => ({
      id: c._id,
      action: `Complaint ${c.status}`,
      description: c.title,
      time: new Date(c.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: c.status
    }));
    
    // Calculate performance rank (based on resolution rate)
    const resolutionRate = totalAssigned > 0 ? (resolved / totalAssigned) * 100 : 0;
    const performanceRank = resolutionRate >= 80 ? 5 : resolutionRate >= 60 ? 10 : 20;
    
    console.log("   ✅ Performance metrics calculated");
    
    res.status(200).json({
      message: "Officer performance retrieved successfully",
      totalAssigned,
      resolved,
      pending,
      inProgress,
      rejected,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      thisMonthAvg: thisMonthAvg.toFixed(1),
      lastMonthAvg: lastMonthAvg.toFixed(1),
      fastestResolution,
      slowestResolution,
      improvementPercentage: improvementPercentage.toFixed(1),
      performanceRank,
      monthlyData,
      recentActivities,
      officer: {
        name: officer.name,
        email: officer.email,
        department: officer.department
      }
    });
    
  } catch (error) {
    console.error("\n❌ ERROR RETRIEVING OFFICER PERFORMANCE");
    console.error("   Error:", error.message);
    
    res.status(500).json({
      message: "Error retrieving performance data",
      error: error.message
    });
  }
};