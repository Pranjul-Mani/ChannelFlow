import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/database';
import Room from '@/lib/models/room';
import Booking from '@/lib/models/Booking';

export async function GET(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    
    if (!categoryId || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }
    
    // Find all rooms in the specified category
    const allRooms = await Room.find({ category: categoryId })
      .populate("category")
      .populate("floor")
      .sort({ roomId: 1 });
    
    // Find all bookings that overlap with the requested dates
    const overlappingBookings = await Booking.find({
      $or: [
        {
          checkInDate: { $lt: new Date(checkOut) },
          checkOutDate: { $gt: new Date(checkIn) }
        }
      ],
      status: { $in: ['confirmed', 'checked-in'] } // Only consider active bookings
    }).populate('rooms.roomId');
    
    // Get list of booked room IDs
    const bookedRoomIds = new Set();
    overlappingBookings.forEach(booking => {
      booking.rooms.forEach(room => {
        bookedRoomIds.add(room.roomId._id.toString());
      });
    });
    
    // Filter out booked rooms
    const availableRooms = allRooms.filter(room => 
      !bookedRoomIds.has(room._id.toString())
    );
    
    return NextResponse.json({
      success: true,
      rooms: availableRooms,
      count: availableRooms.length
    });
    
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch available rooms" },
      { status: 500 }
    );
  }
}