// src/models/Staff.js
import mongoose from "mongoose"

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address"
    ]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-\(\)]+$/.test(v)
      },
      message: "Please enter a valid phone number"
    }
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    trim: true,
    enum: [
      "Manager",
      "Assistant Manager", 
      "Team Lead",
      "Senior Developer",
      "Developer",
      "Full Stack Developer",
    ]
  },
  department: {
    type: String,
    trim: true,
    enum: [
      "",
      "Engineering",
      "Design",
      "Product",
      "Marketing",
    ]
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, "Address cannot exceed 500 characters"]
  },
  salary: {
    type: Number,
    min: [0, "Salary cannot be negative"],
    max: [10000000, "Salary seems too high"]
  },
  joiningDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v <= new Date()
      },
      message: "Joining date cannot be in the future"
    }
  },
  // status: {
  //   type: String,
  //   enum: ["Active", "Inactive", "On Leave", "Terminated"],
  //   default: "Active"
  // },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for full name display
staffSchema.virtual('displayName').get(function() {
  return this.name
})

// Virtual for experience calculation
staffSchema.virtual('experience').get(function() {
  if (!this.joiningDate) return null
  
  const now = new Date()
  const joining = new Date(this.joiningDate)
  const diffTime = Math.abs(now - joining)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffMonths / 12)
  
  if (diffYears > 0) {
    const remainingMonths = diffMonths % 12
    return `${diffYears} year${diffYears > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`
  } else {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`
  }
})

// Pre-save middleware to generate employee ID
staffSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    try {
      const count = await this.constructor.countDocuments()
      this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`
    } catch (error) {
      console.error('Error generating employee ID:', error)
    }
  }
  next()
})

// Indexes for better performance (email index is created by unique: true)
staffSchema.index({ role: 1 })
staffSchema.index({ department: 1 })
staffSchema.index({ status: 1 })
staffSchema.index({ createdAt: -1 })

const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema)

export default Staff