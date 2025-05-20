// models/attendanceModel.ts
import mongoose from 'mongoose';

// Define the Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['present', 'absent', 'half-day', 'leave', 'work-from-home'],
    default: 'present'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  workHours: {
    type: Number
  },
  notes: {
    type: String
  },
  location: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Create a compound index to ensure an employee can only have one attendance record per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Create the Attendance model
export const Attendance = mongoose.model('Attendance', attendanceSchema);