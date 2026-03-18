import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'citizen', required: true },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: 'officer', required: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'complaint', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  satisfactionScore: { type: Number, min: 0, max: 100, required: true },
  comments: { type: String, default: '' },
}, { timestamps: true });

const Feedback = mongoose.model('feedback', feedbackSchema);
export default Feedback;
