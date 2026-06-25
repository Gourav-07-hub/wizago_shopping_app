import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, default: 'Warlock' },
  dept: { type: String, default: 'Spells Control' },
  status: { type: String, default: 'On Duty' },
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
