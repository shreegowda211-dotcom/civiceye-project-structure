import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'citizen', required: true },
  type: { type: String, enum: ['info', 'warning', 'alert', 'update'], default: 'info' },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Notification = mongoose.model('notification', notificationSchema);
export default Notification;
