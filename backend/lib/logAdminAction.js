import mongoose from "mongoose";
import AuditLog from "../model/auditLogSchema.js";

/**
 * Creates a new audit log entry for admin/system actions.
 * Supports projects with static admin accounts (no Admin collection).
 */
export async function logAdminAction({
  adminId,
  adminName,
  action,
  targetType,
  targetId,
  description,
}) {
  const doc = {
    adminName: String(adminName || "Admin"),
    action: String(action || "").trim(),
    targetType: String(targetType || "").trim(),
    targetId: String(targetId || "").trim(),
    description: String(description || "").trim(),
  };

  // Only persist adminId if it looks like a real ObjectId.
  if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
    doc.adminId = adminId;
  }

  await AuditLog.create(doc);
}

