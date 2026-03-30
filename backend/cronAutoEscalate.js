import cron from 'node-cron';
import Complaint from './model/complaintSchema.js';
import Officer from './model/officerSchema.js';
import Notification from './model/notificationSchema.js';
import Settings from './model/settingsSchema.js';

// Example SLA: 48 hours (in ms)
const DEFAULT_SLA_HOURS = 48;
const MS_PER_HOUR = 60 * 60 * 1000;

async function autoEscalateComplaints() {
  try {
    // Optionally fetch SLA from settings
    let slaHours = DEFAULT_SLA_HOURS;
    const settings = await Settings.findOne();
    if (settings && settings.complaintSLAHours) {
      slaHours = settings.complaintSLAHours;
    }
    const now = new Date();
    const slaDate = new Date(now.getTime() - slaHours * MS_PER_HOUR);

    // Find complaints past SLA and not escalated
    const overdueComplaints = await Complaint.find({
      escalated: false,
      status: { $ne: 'Resolved' },
      createdAt: { $lte: slaDate }
    });

    for (const complaint of overdueComplaints) {
      complaint.escalated = true;
      complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;
      await complaint.save();

      // Notify assigned officer (if any)
      if (complaint.assignedOfficer) {
        await Notification.create({
          officer: complaint.assignedOfficer,
          type: 'escalation',
          message: `Complaint ${complaint.issueId || complaint._id} has been auto-escalated due to SLA breach.`,
          link: `/officer/complaints/${complaint._id}`
        });
      }
      // Notify admin (generic notification)
      await Notification.create({
        type: 'escalation',
        message: `Complaint ${complaint.issueId || complaint._id} auto-escalated (SLA breach).`,
        link: `/admin/complaints/${complaint._id}`
      });
    }
    if (overdueComplaints.length > 0) {
      console.log(`[AUTO-ESCALATE] Escalated ${overdueComplaints.length} complaints at ${now.toISOString()}`);
    }
  } catch (err) {
    console.error('[AUTO-ESCALATE] Error:', err);
  }
}

// Schedule to run every hour
cron.schedule('0 * * * *', autoEscalateComplaints);

export default autoEscalateComplaints;
