import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'citizen' },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: 'officer' },
  type: {
    type: String,
    enum: ['assignment', 'status_update', 'resolved', 'escalation', 'system'],
    default: 'system',
  },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Notification = mongoose.model('notification', notificationSchema);
export default Notification;
