import mongoose from "mongoose";

const floorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  description: String,
});

export default mongoose.models.Floor ||
  mongoose.model("Floor", floorSchema);
