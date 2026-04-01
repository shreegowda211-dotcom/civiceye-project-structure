import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    // Optional because this project uses a static admin account (no Admin collection).
    adminId: { type: mongoose.Schema.Types.ObjectId, required: false },
    adminName: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    targetType: { type: String, required: true, trim: true },
    targetId: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, targetType: 1 });

const AuditLog = mongoose.models.auditLog || mongoose.model('auditLog', auditLogSchema);
export default AuditLog;
