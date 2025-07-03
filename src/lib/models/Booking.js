import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  personDetails: [
    {
      name: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: Number,
        required: true,
      },
    },
  ],

  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  numberOfGuests: {
    type: Number,
    default: 1,
    min: 1
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  source: {
    type: String,
    default: "booking engine"
  },
  status: {
    type: String,
    enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'confirmed'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

}, {
  timestamps: true
});

// ✅ Fixed indexes to use correct field names
BookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ source: 1 });
BookingSchema.index({ roomType: 1 });
BookingSchema.index({ status: 1 });

// ✅ Fixed validation middleware for date fields
BookingSchema.pre('save', function (next) {
  if (this.checkOutDate <= this.checkInDate) {
    next(new Error('Check-out date must be after check-in date'));
  } else {
    next();
  }
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
