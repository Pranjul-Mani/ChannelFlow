import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    /** Who is creating / owning this booking */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /** Guest‑by‑guest information */
    personDetails: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        phone: { type: String },   // optional
        email: { type: String },   // optional

        /** (Optional) link the guest to the room they’ll occupy */
        assignedRoom: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Room",
        },
      },
    ],

    /** One entry per room being booked */
    rooms: [
      {
        /** Specific room chosen */
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Room",
          required: true,
        },

        /** Rate plan selected for that room (e.g. ‘EP’, ‘CP’, ‘MAP’) */
        rateType: {
          type: String,
          // required: true,
        },

        /** Occupancy */
        adults: { type: Number, default: 2 },
        children: { type: Number, default: 0 },

        /** If the user overrides the calculated total */
        customPrice: { type: Number, default: null },
        numberOfRooms: { type: Number, min: 1 },
      },
    ],

    /** Stay dates */
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },

    /** Grand total for the whole booking (after any overrides) */
    totalAmount: { type: Number, required: true },

    /** Booking channel */
    source: {
      type: String,
      enum: ["walk-in", "booking engine", "ota", "website"],
      default: "booking engine",
    },

    /** Lifecycle state of the booking */
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "checked-in",
        "checked-out",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
