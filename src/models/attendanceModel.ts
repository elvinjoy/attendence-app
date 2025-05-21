// models/attendanceModel.ts
import mongoose from 'mongoose';

// Define the Attendance Schema based on the UI design
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
    enum: ['Present', 'Absent', 'Half Day', 'Online'],
    default: 'Present'
  },
  checkInTime: {
    type: String, // Store as string in format "HH:MM"
  },
  checkOutTime: {
    type: String, // Store as string in format "HH:MM"
  },
  department: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  empId: {
    type: String, // This is the display ID like "Emp 01" shown in the UI
    required: true
  }
}, { 
  timestamps: true 
});

// Create a compound index to ensure an employee can only have one attendance record per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Create the Attendance model
export const Attendance = mongoose.model('Attendance', attendanceSchema);