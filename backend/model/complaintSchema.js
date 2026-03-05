import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  issueId: {
    type: String,
    unique: true,
    required: true,
    // Format: ISS26001, ISS26002, etc.
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    enum: ["Road Damage", "Garbage", "Streetlight", "Water Leakage", "Other"],
    required: true,
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },

  location: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Rejected"],
    default: "Pending",
  },

  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "citizen",
    required: true,
  },

  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "officer",
    default: null,
  },

}, { timestamps: true });

const Complaint = mongoose.model("complaint", complaintSchema);

export default Complaint;