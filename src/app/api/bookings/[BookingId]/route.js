// API route for specific booking management
import connectDB from "@/lib/utils/database";
import Booking from "@/lib/models/Booking";
import Room from "@/lib/models/room";

// GET specific booking by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { BookingId } = await params;

    if (!BookingId) {
      return new Response(
        JSON.stringify({ success: false, message: "Booking ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find booking and populate related data
    const booking = await Booking.findById(BookingId)
      .populate("rooms.roomId")
      .populate({
        path: "user",
        select: "name email phone",
      });

    if (!booking) {
      return new Response(
        JSON.stringify({ success: false, message: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching booking:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch booking",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT to update booking status
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { BookingId } = await params;
    const data = await req.json();

    if (!BookingId) {
      return new Response(
        JSON.stringify({ success: false, message: "Booking ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the booking
    const booking = await Booking.findById(BookingId);

    if (!booking) {
      return new Response(
        JSON.stringify({ success: false, message: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare update object
    const updateData = {};

    // Validate status if provided
    if (data.status) {
      const validStatuses = [
        "pending",
        "confirmed",
        "cancelled",
        "checked-in",
        "checked-out",
      ];
      if (!validStatuses.includes(data.status)) {
        return new Response(
          JSON.stringify({
            success: false,
            message:
              "Invalid status. Valid statuses are: " + validStatuses.join(", "),
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      updateData.status = data.status;

      // Set status change timestamp
      if (data.status === "confirmed") {
        updateData.confirmedAt = new Date();
      } else if (data.status === "cancelled") {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason =
          data.cancellationReason || "Cancelled by system";

        // Restore room availability if booking is cancelled
        // Check if rooms exists and is an array
        if (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0) {
          for (const bookedRoom of booking.rooms) {
            const room = await Room.findById(bookedRoom.roomId);
            if (room) {
              room.noOfRoom += bookedRoom.numberOfRooms; // Restore rooms
              if (room.noOfRoom > 0) {
                room.isAvailable = true;
              }
              await room.save();
            }
          }
        }
      } else if (data.status === "checked-out") {
        updateData.completedAt = new Date();

        // Restore room availability if booking is checked out
        // Check if rooms exists and is an array
        if (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0) {
          for (const bookedRoom of booking.rooms) {
            const room = await Room.findById(bookedRoom.roomId);
            if (room) {
              room.noOfRoom += bookedRoom.numberOfRooms; // Restore rooms
              if (room.noOfRoom > 0) {
                room.isAvailable = true;
              }
              await room.save();
            }
          }
        }
      }
    }

    // Validate payment status if provided
    if (data.paymentStatus) {
      const validPaymentStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partial",
      ];
      if (!validPaymentStatuses.includes(data.paymentStatus)) {
        return new Response(
          JSON.stringify({
            success: false,
            message:
              "Invalid payment status. Valid statuses are: " +
              validPaymentStatuses.join(", "),
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      updateData.paymentStatus = data.paymentStatus;

      if (data.paymentStatus === "paid") {
        updateData.paidAt = new Date();
        updateData.paymentMethod = data.paymentMethod || "system";
        updateData.transactionId = data.transactionId;
      }
    }

    // Add admin notes if provided
    if (data.adminNotes) {
      updateData.adminNotes = data.adminNotes;
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      BookingId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({
        path: "rooms.roomId",
        select: "name roomId location price",
      })
      .populate({
        path: "user",
        select: "name email phone",
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking updated successfully",
        booking: updatedBooking,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to update booking",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE booking (for cancellation)
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { BookingId } = await params;

    if (!BookingId) {
      return new Response(
        JSON.stringify({ success: false, message: "Booking ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the booking first to get rooms data
    const booking = await Booking.findById(BookingId);

    if (!booking) {
      return new Response(
        JSON.stringify({ success: false, message: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Restore room availability if booking has rooms
    if (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0) {
      for (const bookedRoom of booking.rooms) {
        const room = await Room.findById(bookedRoom.roomId);
        if (room) {
          room.noOfRoom += bookedRoom.numberOfRooms; // Restore rooms
          if (room.noOfRoom > 0) {
            room.isAvailable = true;
          }
          await room.save();
        }
      }
    }

    // Update booking to cancelled status instead of actual deletion
    const updatedBooking = await Booking.findByIdAndUpdate(
      BookingId,
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: "Cancelled by system",
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking cancelled successfully",
        booking: {
          _id: updatedBooking._id,
          status: updatedBooking.status,
          cancelledAt: updatedBooking.cancelledAt,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to cancel booking",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}