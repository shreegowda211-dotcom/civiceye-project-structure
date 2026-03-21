import citizen from "../model/citizenScheme.js";
import Feedback from "../model/feedbackSchema.js";
import Complaint from "../model/complaintSchema.js";
import Officer from "../model/officerSchema.js";
import bcrypt from "bcrypt";

 // 📧 Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

 // 🔑 Password validation regex
// Must contain:
// - Minimum 8 characters
// - At least 1 uppercase letter
// - At least 1 number
// - At least 1 special character
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; 


// ===============================
// 📝 Citizen Register Controller
// ===============================

export const citizenRegister = async (req, res) => {
  try {
    // #1 Extract data from request body
    const { name, email, password, confirmPassword } = req.body;

     // #2 Trim values
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase(); 

     // #3 Check required fields
    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } 

     // #4 Validate email format
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }  

     // #5 Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match!",
      });
    } 

     // #6 Validate password strength
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character (@$!%*?&).",
      });
    } 

    // #7 Check if citizen already exists
    const existingCitizen = await citizen.findOne({
      email: trimmedEmail,
    });

    if (existingCitizen) {
      return res.status(400).json({
        success: false,
        message: "Citizen already exists!",
      });
    }

    // #8 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // #9 Create new citizen
    await citizen.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: "Citizen",
    });

    // #10 Success response
    return res.status(201).json({
      success: true,
      message: "Citizen registered successfully!",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ===============================
// ⭐ Citizen feedback submission
// ===============================

export const submitFeedback = async (req, res) => {
  try {
    const citizenId = req.citizen?.id;
    if (!citizenId) {
      return res.status(401).json({ success: false, message: 'Unauthorized citizen' });
    }

    const { complaintId, officerId, rating, satisfactionScore, comments } = req.body;

    if (!complaintId || !officerId || !rating || satisfactionScore === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.citizen.toString() !== citizenId) {
      return res.status(404).json({ success: false, message: 'Complaint not found for this citizen' });
    }

    const officer = await Officer.findById(officerId);
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }

    const existing = await Feedback.findOne({ citizen: citizenId, complaint: complaintId, officer: officerId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Feedback already submitted for this issue/officer' });
    }

    const newFeedback = await Feedback.create({
      citizen: citizenId,
      officer: officerId,
      complaint: complaintId,
      rating,
      satisfactionScore,
      comments: comments || '',
    });

    return res.status(201).json({ success: true, message: 'Feedback saved', data: newFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while submitting feedback', error: error.message });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const citizenId = req.citizen?.id;
    if (!citizenId) {
      return res.status(401).json({ success: false, message: 'Unauthorized citizen' });
    }

    const feedbackList = await Feedback.find({ citizen: citizenId })
      .populate('officer', 'name email')
      .populate('complaint', 'issueId title')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, message: 'Feedback retrieved', data: feedbackList });
  } catch (error) {
    console.error('Error retrieving feedback:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while retrieving feedback', error: error.message });
  }
};

