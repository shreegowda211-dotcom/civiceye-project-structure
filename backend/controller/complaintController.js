import mongoose from "mongoose";
import Complaint from "../model/complaintSchema.js";
import Officer from "../model/officerSchema.js";

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
    const officer = await Officer.findOne({ categories: category });
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
    const { complaintId } = req.params;
    const { status } = req.body;
    const officerId = req.officer?.id || req.officer?._id;

    console.log("🔄 Officer updating complaint:", complaintId);
    console.log("   New status:", status);

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        error: "Status must be one of: " + validStatuses.join(", ")
      });
    }

    // Find complaint by issueId or _id
    const searchQuery = {
      $or: [
        { issueId: complaintId.toUpperCase() },
        { _id: complaintId }
      ]
    };

    // Try to parse as MongoDB ObjectId if not issueId
    try {
      const mongoId = new mongoose.Types.ObjectId(complaintId);
      if (!searchQuery.$or.find(q => q._id)) {
        searchQuery.$or.push({ _id: mongoId });
      }
    } catch (e) {
      // Not a valid ObjectId, continue with issueId search
    }

    const complaint = await Complaint.findOne(searchQuery)
      .populate('citizen', 'name email')
      .populate('assignedOfficer', 'name email');

    if (!complaint) {
      console.log("❌ Complaint not found");
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

    // Update the complaint status
    complaint.status = status;
    complaint.assignedOfficer = officerId; // Assign to updating officer
    const updatedComplaint = await complaint.save();

    console.log("✅ Complaint status updated to:", status);

    res.status(200).json({
      message: "Complaint status updated successfully",
      complaint: updatedComplaint
    });

  } catch (error) {
    console.error("❌ Error updating complaint:", error);
    res.status(500).json({
      message: "Error updating complaint",
      error: error.message
    });
  }
};