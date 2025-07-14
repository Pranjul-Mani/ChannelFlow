import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  description: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Floor",
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  noOfRoom: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
  },
  gst: {
    type: Number,
    default: 0,
  },
  amenities: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: true,
  },
  bed: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  balcony: {
    type: Boolean,
    default: true,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
}, {
  timestamps: true
});

export default mongoose.models.Room || mongoose.model("Room", roomSchema);