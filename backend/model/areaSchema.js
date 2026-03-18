import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: false, default: '' },
  description: { type: String, required: false, default: '' },
  // assignedOfficer will hold the ObjectId of an Officer
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'officer', required: false },
  // simple bbox or geo placeholder for future map integration
  geo: {
    type: { type: String, enum: ['Polygon', 'MultiPolygon', 'Point', 'LineString'], required: false },
    coordinates: { type: Array, required: false },
  },
}, { timestamps: true });

const Area = mongoose.model('area', areaSchema);
export default Area;
