const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    comment: String,
    rating: {
      type: String,
      min: 1,
      max: 5,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
