// API route for specific booking management with improved error handling
import connectDB from "@/lib/utils/database";
import Booking from "@/lib/models/Booking";
import Room from "@/lib/models/room";

// GET specific booking by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { BookingId } = await params;
    console.log("GET - BookingId received:", BookingId);

    if (!BookingId) {
      console.log("GET - No BookingId provided");
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
      console.log("GET - Booking not found for ID:", BookingId);
      return new Response(
        JSON.stringify({ success: false, message: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("GET - Booking found successfully");
    return new Response(
      JSON.stringify({
        success: true,
        booking,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GET - Error fetching booking:", error);
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
    console.log("PUT - Starting booking update process");
    await connectDB();

    // More robust parameter extraction
    const resolvedParams = await params;
    const BookingId = resolvedParams?.BookingId;
    // console.log("PUT - BookingId received:", BookingId, "Type:", typeof BookingId);

    if (!BookingId) {
      // console.log("PUT - No BookingId provided");
      return new Response(
        JSON.stringify({ success: false, message: "Booking ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body with error handling
    let data;
    try {
      data = await req.json();
      // console.log("PUT - Request data:", JSON.stringify(data, null, 2));
    } catch (jsonError) {
      // console.error("PUT - Error parsing JSON:", jsonError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid JSON in request body",
          error: jsonError.message 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the booking
    // console.log("PUT - Searching for booking with ID:", BookingId);
    const booking = await Booking.findById(BookingId);

    if (!booking) {
      // console.log("PUT - Booking not found for ID:", BookingId);
      return new Response(
        JSON.stringify({ success: false, message: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // console.log("PUT - Current booking status:", booking.status);
    // console.log("PUT - Current booking rooms:", booking.rooms?.length || 0);

    // Prepare update object
    const updateData = {};

    // Validate status if provided
    if (data.status) {
      console.log("PUT - Updating status from", booking.status, "to", data.status);
      
      const validStatuses = [
        "pending",
        "confirmed",
        "cancelled",
        "checked-in",
        "checked-out",
        "completed",
      ];
      
      if (!validStatuses.includes(data.status)) {
        console.log("PUT - Invalid status provided:", data.status);
        return new Response(
          JSON.stringify({
            success: false,
            message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      updateData.status = data.status;

      // Set status change timestamp
      if (data.status === "confirmed") {
        updateData.confirmedAt = new Date();
        console.log("PUT - Setting confirmed timestamp");
      } else if (data.status === "cancelled") {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = data.cancellationReason || "Cancelled by system";
        console.log("PUT - Processing cancellation, reason:", updateData.cancellationReason);

        // Restore room availability if booking is cancelled
        await restoreRoomAvailability(booking, "cancelled");
        
      } else if (data.status === "checked-out") {
        updateData.completedAt = new Date();
        console.log("PUT - Processing check-out");

        // Restore room availability if booking is checked out
        await restoreRoomAvailability(booking, "checked-out");
      }
    }

    // Validate payment status if provided
    if (data.paymentStatus) {
      console.log("PUT - Updating payment status to:", data.paymentStatus);
      
      const validPaymentStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partial",
      ];
      
      if (!validPaymentStatuses.includes(data.paymentStatus)) {
        console.log("PUT - Invalid payment status:", data.paymentStatus);
        return new Response(
          JSON.stringify({
            success: false,
            message: `Invalid payment status. Valid statuses are: ${validPaymentStatuses.join(", ")}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      updateData.paymentStatus = data.paymentStatus;

      if (data.paymentStatus === "paid") {
        updateData.paidAt = new Date();
        updateData.paymentMethod = data.paymentMethod || "system";
        updateData.transactionId = data.transactionId;
        console.log("PUT - Setting payment details");
      }
    }

    // Add admin notes if provided
    if (data.adminNotes) {
      updateData.adminNotes = data.adminNotes;
      console.log("PUT - Adding admin notes");
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    console.log("PUT - Update data prepared:", Object.keys(updateData));

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

    if (!updatedBooking) {
      console.log("PUT - Failed to update booking");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to update booking - booking not found after update",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("PUT - Booking updated successfully, new status:", updatedBooking.status);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking updated successfully",
        booking: updatedBooking,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PUT - Error updating booking:", error);
    console.error("PUT - Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to update booking",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Helper function to restore room availability
async function restoreRoomAvailability(booking, reason) {
  console.log(`Restoring room availability for ${reason}`);
  
  if (!booking.rooms || !Array.isArray(booking.rooms) || booking.rooms.length === 0) {
    console.log("No rooms to restore");
    return;
  }

  for (const bookedRoom of booking.rooms) {
    try {
      console.log(`Processing room ${bookedRoom.roomId}, restoring ${bookedRoom.numberOfRooms} rooms`);
      
      const room = await Room.findById(bookedRoom.roomId);
      if (room) {
        const previousCount = room.noOfRoom;
        room.noOfRoom += bookedRoom.numberOfRooms;
        
        if (room.noOfRoom > 0) {
          room.isAvailable = true;
        }
        
        await room.save();
        console.log(`Room ${bookedRoom.roomId} updated: ${previousCount} -> ${room.noOfRoom} rooms`);
      } else {
        console.log(`Room ${bookedRoom.roomId} not found`);
      }
    } catch (roomError) {
      console.error(`Error updating room ${bookedRoom.roomId}:`, roomError);
      // Continue with other rooms even if one fails
    }
  }
}

// DELETE booking (for cancellation)
export async function DELETE(req, { params }) {
  try {
    console.log("DELETE - Starting booking cancellation");
    await connectDB();

    const resolvedParams = await params;
    const BookingId = resolvedParams?.BookingId;
    console.log("DELETE - BookingId received:", BookingId);

    if (!BookingId) {
      console.log("DELETE - No BookingId provided");
      return new Response(
        JSON.stringify({ success: false, message: "Booking ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the booking first to get rooms data
    const booking = await Booking.findById(BookingId);

    if (!booking) {
      console.log("DELETE - Booking not found for ID:", BookingId);
      return new Response(
        JSON.stringify({ success: false, message: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("DELETE - Current booking status:", booking.status);

    // Restore room availability if booking has rooms
    await restoreRoomAvailability(booking, "deletion");

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

    console.log("DELETE - Booking cancelled successfully");

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
    console.error("DELETE - Error cancelling booking:", error);
    console.error("DELETE - Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to cancel booking",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}