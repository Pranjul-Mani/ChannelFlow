// API route for user-specific bookings
import connectDB from '@/lib/utils/database';
import Booking from '@/lib/models/Booking';
import Room from '@/lib/models/room';

// GET all bookings (with optional user filtering)
export async function GET(req) {
  try {
    await connectDB();
    
    // Get filter parameters from URL
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const paymentStatus = url.searchParams.get('paymentStatus');
    const userId = url.searchParams.get('userId'); // Optional user filtering
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Add user filter if provided
    if (userId) {
      query.user = userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Fetch bookings with population
    const bookings = await Booking.find(query)
      .populate({
        path: 'rooms.roomId',
        select: 'name roomId location price images description bed noOfRoom',
      })
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
    
    // Calculate booking statistics
    const statsQuery = userId ? { user: userId } : {};
    const stats = await Booking.aggregate([
      { $match: statsQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const bookingStats = stats.length > 0 ? stats[0] : {
      totalBookings: 0,
      totalSpent: 0,
      completedBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0
    };

    // Get upcoming bookings (check-in date is in the future)
    const upcomingQuery = {
      status: { $in: ['confirmed', 'pending'] },
      checkInDate: { $gte: new Date() }
    };
    if (userId) {
      upcomingQuery.user = userId;
    }

    const upcomingBookings = await Booking.find(upcomingQuery)
      .populate({
        path: 'rooms.roomId',
        select: 'name roomId location images',
      })
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .sort({ checkInDate: 1 })
      .limit(3);

    // Get recent bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentQuery = {
      createdAt: { $gte: thirtyDaysAgo }
    };
    if (userId) {
      recentQuery.user = userId;
    }

    const recentBookings = await Booking.find(recentQuery)
      .populate({
        path: 'rooms.roomId',
        select: 'name roomId location images',
      })
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .sort({ createdAt: -1 })
      .limit(5);
    
    return new Response(
      JSON.stringify({
        success: true,
        bookings,
        stats: bookingStats,
        upcomingBookings,
        recentBookings,
        pagination: {
          total: totalBookings,
          pages: Math.ceil(totalBookings / limit),
          page,
          limit
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to fetch bookings', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST to cancel a booking
export async function POST(req) {
  try {
    await connectDB();
    
    const data = await req.json();
    const { bookingId, cancellationReason, userId } = data;
    
    if (!bookingId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Booking ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build query to find booking
    const query = { _id: bookingId };
    if (userId) {
      query.user = userId;
    }

    // Find the booking
    const booking = await Booking.findOne(query);
    
    if (!booking) {
      return new Response(
        JSON.stringify({ success: false, message: 'Booking not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return new Response(
        JSON.stringify({ success: false, message: 'Booking is already cancelled' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (booking.status === 'completed') {
      return new Response(
        JSON.stringify({ success: false, message: 'Cannot cancel completed booking' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Restore room availability when booking is cancelled
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

    // Update booking to cancelled status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: cancellationReason || 'Cancelled by system',
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate({
      path: 'rooms.roomId',
      select: 'name roomId location',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking cancelled successfully',
        booking: {
          _id: updatedBooking._id,
          status: updatedBooking.status,
          bookingReference: updatedBooking.bookingReference,
          cancelledAt: updatedBooking.cancelledAt,
          rooms: updatedBooking.rooms
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to cancel booking', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}