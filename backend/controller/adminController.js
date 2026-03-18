/**
 * @desc Delete citizen by ID
 * @route DELETE /api/admin/citizens/:id
 * @access Private/Admin
 */
export const deleteCitizen = async (req, res) => {
  try {
    const { id } = req.params;
    const citizen = await Citizen.findByIdAndDelete(id);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Citizen deleted successfully',
      data: { id: citizen._id },
    });
  } catch (error) {
    console.error('Error deleting citizen:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete citizen',
      error: error.message,
    });
  }
};
/**
 * @desc Update citizen by ID
 * @route PUT /api/admin/citizens/:id
 * @access Private/Admin
 */
export const updateCitizen = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // Prevent password change via this route
    delete updateData.password;
    const citizen = await Citizen.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Citizen updated successfully',
      data: citizen,
    });
  } catch (error) {
    console.error('Error updating citizen:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update citizen',
      error: error.message,
    });
  }
};
import Complaint from '../model/complaintSchema.js';
import Citizen from '../model/citizenScheme.js';
import Officer from '../model/officerSchema.js';
import Area from '../model/areaSchema.js';
import Feedback from '../model/feedbackSchema.js';
import Notification from '../model/notificationSchema.js';
import Settings from '../model/settingsSchema.js';

/**
 * @desc Get all complaints for admin dashboard
 * @route GET /api/admin/complaints
 * @access Private/Admin
 */

// Get all complaints with optional filters
export const getAllComplaints = async (req, res) => {
  try {
    const { status, priority, category, urgent, escalated, assignedOfficer } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (urgent !== undefined) filter.urgent = urgent === 'true';
    if (escalated !== undefined) filter.escalated = escalated === 'true';
    if (assignedOfficer) filter.assignedOfficer = assignedOfficer;

    const complaints = await Complaint.find(filter)
      .populate('assignedOfficer', 'name email department')
      .populate('citizen', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Complaints retrieved successfully',
      complaints: complaints || [],
      total: complaints.length,
    });
  } catch (error) {
    console.error('Error fetching complaints:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message,
    });
  }
};

/**
 * @desc Assign or reassign officer to complaint
 * @route PUT /api/admin/complaints/:complaintId/assign
 * @access Private/Admin
 */
export const assignOfficerToComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { officerId } = req.body;
    if (!officerId) {
      return res.status(400).json({ success: false, message: 'Officer ID required' });
    }

    const complaint = await Complaint.findOne({ $or: [{ issueId: complaintId }, { _id: complaintId }] });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const previousOfficerId = complaint.assignedOfficer; // may be null

    // Update complaint with new officer assignment
    complaint.assignedOfficer = officerId;
    await complaint.save();

    // Update officers load counts
    if (previousOfficerId && previousOfficerId.toString() !== officerId.toString()) {
      await Officer.findByIdAndUpdate(previousOfficerId, { $inc: { complaintsAssigned: -1 } });
    }
    await Officer.findByIdAndUpdate(officerId, { $inc: { complaintsAssigned: 1 } });

    const populatedComplaint = await Complaint.findById(complaint._id).populate('assignedOfficer', 'name email department');

    res.status(200).json({ success: true, message: 'Officer assigned', complaint: populatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign officer', error: error.message });
  }
};

/**
 * @desc Auto-assign all unassigned complaints by category (or global least-loaded fallback)
 * @route PUT /api/admin/complaints/auto-assign-category
 * @access Private/Admin
 */
let autoAssignRun = false;

export const autoAssignCategoryComplaints = async (req, res) => {
  try {
    if (autoAssignRun) {
      const unassignedComplaints = await Complaint.find({ assignedOfficer: null });
      return res.status(409).json({
        success: false,
        message: 'Auto-assign already run once',
        assignedCount: 0,
        totalChecked: unassignedComplaints.length,
      });
    }

    const unassignedComplaints = await Complaint.find({ assignedOfficer: null });
    if (!unassignedComplaints.length) {
      autoAssignRun = true;
      return res.status(200).json({ success: true, message: 'No unassigned complaints found', assignedCount: 0, totalChecked: 0 });
    }

    let assignedCount = 0;
    const details = [];

    for (const complaint of unassignedComplaints) {
      let officer = await Officer.findOne({ department: complaint.category }).sort({ complaintsAssigned: 1 }).lean();
      if (!officer) {
        officer = await Officer.findOne({}).sort({ complaintsAssigned: 1 }).lean();
      }

      if (!officer) {
        details.push({ issueId: complaint.issueId || complaint._id, assigned: false, reason: 'No available officers' });
        continue;
      }

      complaint.assignedOfficer = officer._id;
      complaint.status = 'In Progress';
      await complaint.save();

      await Officer.findByIdAndUpdate(officer._id, { $inc: { complaintsAssigned: 1 } });
      assignedCount += 1;
      details.push({ issueId: complaint.issueId || complaint._id, assigned: true, officerId: officer._id });
    }

    autoAssignRun = true;
    res.status(200).json({ success: true, message: 'Auto-assign completed', assignedCount, totalChecked: unassignedComplaints.length, details });
  } catch (error) {
    console.error('Error auto-assigning complaints by category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to auto-assign complaints', error: error.message });
  }
};

/**
 * @desc Mark complaint as urgent
 * @route PUT /api/admin/complaints/:complaintId/urgent
 * @access Private/Admin
 */
export const markComplaintUrgent = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ issueId: complaintId }, { _id: complaintId }] },
      { urgent: true },
      { new: true }
    );
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.status(200).json({ success: true, message: 'Complaint marked urgent', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark urgent', error: error.message });
  }
};

/**
 * @desc Escalate complaint
 * @route PUT /api/admin/complaints/:complaintId/escalate
 * @access Private/Admin
 */
export const escalateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ $or: [{ issueId: complaintId }, { _id: complaintId }] });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const newLevel = (complaint.escalationLevel || 0) + 1;
    const updated = await Complaint.findByIdAndUpdate(
      complaint._id,
      {
        escalated: true,
        escalationLevel: newLevel,
        $push: {
          escalationTimeline: {
            level: newLevel,
            officer: complaint.assignedOfficer || null,
            note: 'Escalated by admin',
            date: new Date(),
          },
        },
      },
      { new: true }
    ).populate('assignedOfficer', 'name email');

    // Notify citizen on escalation
    if (complaint.citizen) {
      await Notification.create({
        citizen: complaint.citizen,
        type: 'alert',
        message: `Your complaint ${complaint.issueId || complaint._id} has been escalated to level ${newLevel}.`,
        link: `/citizen/track/${complaint._id}`,
      });
    }

    res.status(200).json({ success: true, message: 'Complaint escalated', complaint: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to escalate', error: error.message });
  }
};

/**
 * @desc Get all citizens
 * @route GET /api/admin/citizens
 * @access Private/Admin
 */
export const getAllCitizens = async (req, res) => {
  try {
    const citizens = await Citizen.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Citizens retrieved successfully',
      data: citizens || [],
      total: citizens.length,
    });
  } catch (error) {
    console.error('Error fetching citizens:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch citizens',
      error: error.message,
    });
  }
};

/**
 * @desc Get all officers
 * @route GET /api/admin/officers
 * @access Private/Admin
 */
export const getAllOfficers = async (req, res) => {
  try {
    const officers = await Officer.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Officers retrieved successfully',
      data: officers || [],
      total: officers.length,
    });
  } catch (error) {
    console.error('Error fetching officers:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch officers',
      error: error.message,
    });
  }
};

/**
 * @desc Get all feedback entries
 * @route GET /api/admin/feedback
 * @access Private/Admin
 */
export const getAllFeedback = async (req, res) => {
  try {
    // optionally filter by officer or complaint if query is provided
    const { officerId, complaintId } = req.query;
    const filter = {};
    if (officerId) filter.officer = officerId;
    if (complaintId) filter.complaint = complaintId;

    const feedback = await Feedback.find(filter)
      .populate('citizen', 'name email')
      .populate('officer', 'name email')
      .populate('complaint', 'issueId title')
      .sort({ createdAt: -1 })
      .lean();

    const avgRating = feedback.length ? feedback.reduce((acc, item) => acc + item.rating, 0) / feedback.length : 0;
    const avgSatisfaction = feedback.length ? feedback.reduce((acc, item) => acc + item.satisfactionScore, 0) / feedback.length : 0;

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: feedback || [],
      total: feedback.length,
      averageRating: Number(avgRating.toFixed(2)),
      averageSatisfaction: Number(avgSatisfaction.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching feedback:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message,
    });
  }
};

/**
 * @desc Get admin settings
 * @route GET /api/admin/settings
 * @access Private/Admin
 */
export const getAdminSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      success: true,
      message: 'Admin settings retrieved',
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin settings',
      error: error.message,
    });
  }
};

/**
 * @desc Update admin settings
 * @route PUT /api/admin/settings
 * @access Private/Admin
 */
export const updateAdminSettings = async (req, res) => {
  try {
    const payload = req.body;
    const settings = await Settings.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      message: 'Admin settings updated',
      data: settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin settings',
      error: error.message,
    });
  }
};

/**
 * @desc Create a new officer
 * @route POST /api/admin/officers
 * @access Private/Admin
 */
export const createOfficer = async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if officer already exists
    const existingOfficer = await Officer.findOne({ email });
    if (existingOfficer) {
      return res.status(409).json({
        success: false,
        message: 'Officer with this email already exists',
      });
    }

    // Create new officer
    const newOfficer = new Officer({
      name,
      email,
      password,
      department,
      phone,
      role: 'Officer',
    });

    await newOfficer.save();

    res.status(201).json({
      success: true,
      message: 'Officer created successfully',
      data: {
        id: newOfficer._id,
        name: newOfficer.name,
        email: newOfficer.email,
        department: newOfficer.department,
      },
    });
  } catch (error) {
    console.error('Error creating officer:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create officer',
      error: error.message,
    });
  }
};

/**
 * @desc Update officer by ID
 * @route PUT /api/admin/officers/:id
 * @access Private/Admin
 */
export const updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update to prevent accidental changes
    delete updateData.password;

    const officer = await Officer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Officer updated successfully',
      data: officer,
    });
  } catch (error) {
    console.error('Error updating officer:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update officer',
      error: error.message,
    });
  }
};

/**
 * @desc Delete officer by ID
 * @route DELETE /api/admin/officers/:id
 * @access Private/Admin
 */
export const deleteOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    const officer = await Officer.findByIdAndDelete(id);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Officer deleted successfully',
      data: { id: officer._id },
    });
  } catch (error) {
    console.error('Error deleting officer:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete officer',
      error: error.message,
    });
  }
};

/**
 * @desc Get all areas/zones
 * @route GET /api/admin/areas
 * @access Private/Admin
 */
export const getAllAreas = async (req, res) => {
  try {
    const areas = await Area.find().populate('assignedOfficer', 'name email department').sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, message: 'Areas retrieved successfully', data: areas || [], total: areas.length });
  } catch (error) {
    console.error('Error fetching areas:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch areas', error: error.message });
  }
};

/**
 * @desc Create a new area/zone
 * @route POST /api/admin/areas
 * @access Private/Admin
 */
export const createArea = async (req, res) => {
  try {
    const { name, code, description, assignedOfficer, geo } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Area name is required' });
    const newArea = new Area({ name, code, description, assignedOfficer: assignedOfficer || null, geo: geo || null });
    await newArea.save();
    // Optionally update officer.area if assignedOfficer provided
    if (assignedOfficer) {
      await Officer.findByIdAndUpdate(assignedOfficer, { area: name });
    }
    res.status(201).json({ success: true, message: 'Area created', data: newArea });
  } catch (error) {
    console.error('Error creating area:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create area', error: error.message });
  }
};

/**
 * @desc Update area/zone
 * @route PUT /api/admin/areas/:id
 * @access Private/Admin
 */
export const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const area = await Area.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('assignedOfficer', 'name email');
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
    // If assignedOfficer changed, update officer record
    if (updateData.assignedOfficer) {
      await Officer.findByIdAndUpdate(updateData.assignedOfficer, { area: area.name });
    }
    res.status(200).json({ success: true, message: 'Area updated', data: area });
  } catch (error) {
    console.error('Error updating area:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update area', error: error.message });
  }
};

/**
 * @desc Delete area/zone
 * @route DELETE /api/admin/areas/:id
 * @access Private/Admin
 */
export const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await Area.findByIdAndDelete(id);
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
    res.status(200).json({ success: true, message: 'Area deleted', data: { id: area._id } });
  } catch (error) {
    console.error('Error deleting area:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete area', error: error.message });
  }
};

/**
 * @desc Assign officer to area
 * @route PUT /api/admin/areas/:id/assign
 * @access Private/Admin
 */
export const assignOfficerToArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;
    if (!officerId) return res.status(400).json({ success: false, message: 'Officer ID required' });
    const area = await Area.findByIdAndUpdate(id, { assignedOfficer: officerId }, { new: true }).populate('assignedOfficer', 'name email');
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
    await Officer.findByIdAndUpdate(officerId, { area: area.name });
    res.status(200).json({ success: true, message: 'Officer assigned to area', data: area });
  } catch (error) {
    console.error('Error assigning officer to area:', error.message);
    res.status(500).json({ success: false, message: 'Failed to assign officer', error: error.message });
  }
};

/**
 * @desc Get admin profile
 * @route GET /api/admin/profile
 * @access Private/Admin
 */
export const getAdminProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        name: 'Admin User',
        email: 'admin@civiceye.com',
        role: 'Admin',
        department: 'Administration',
      },
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile',
      error: error.message,
    });
  }
};
