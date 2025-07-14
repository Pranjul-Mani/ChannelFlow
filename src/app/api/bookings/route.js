// app/api/bookings/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/utils/database'
import Booking from '@/lib/models/Booking'
import Room from '@/lib/models/room'

export async function POST(req) {
    try {
        await dbConnect()
        const data = await req.json()

        const newBooking = await Booking.create(data)

        return NextResponse.json({ message: 'Booking created successfully', booking: newBooking }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
    }
}




// GET handler to retrieve all bookings with comprehensive filtering and detailed information
export async function GET(req) {
  try {
    await dbConnect();

    // Get filter parameters from URL
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const paymentStatus = url.searchParams.get("paymentStatus");
    const roomId = url.searchParams.get("roomId");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query (removed roomId filter until we know the correct field name)
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    // if (roomId) query.room = roomId; // Commented out until we know the correct field

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);

    // Fetch bookings without population first to avoid schema errors
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform bookings to provide more detailed structure
    const detailedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Extract guest information from available fields
      const guestInformation = {
        totalGuests: bookingObj.personDetails?.length || (bookingObj.personName ? (Array.isArray(bookingObj.personName) ? bookingObj.personName.length : 1) : 0),
        guests: bookingObj.personDetails?.map((person, index) => ({
          guestNumber: index + 1,
          name: person.name || person,
          age: person.age || null
        })) || (bookingObj.personName ? 
          (Array.isArray(bookingObj.personName) ? 
            bookingObj.personName.map((name, index) => ({
              guestNumber: index + 1,
              name: name,
              age: null
            })) : 
            [{ guestNumber: 1, name: bookingObj.personName, age: null }]
          ) : []),
        primaryGuest: bookingObj.personDetails?.[0] || (bookingObj.personName ? 
          { name: Array.isArray(bookingObj.personName) ? bookingObj.personName[0] : bookingObj.personName } : null)
      };

      // Extract user information (without population)
      const userInformation = {
        userId: bookingObj.user || null,
        name: bookingObj.userName || null,
        email: bookingObj.userEmail || null,
        phone: bookingObj.userPhone || null,
        address: bookingObj.userAddress || null,
        accountCreated: null
      };

      // Extract room details (without population - using available room data)
      const roomDetails = [{
        roomInfo: {
          roomId: bookingObj.roomId || bookingObj.room || null,
          roomNumber: bookingObj.roomNumber || null,
          name: bookingObj.roomName || "Room",
          location: bookingObj.roomLocation || null,
          pricePerRoom: bookingObj.roomPrice || 0,
          capacity: bookingObj.roomCapacity || null,
          description: bookingObj.roomDescription || null,
          amenities: bookingObj.roomAmenities || [],
          images: bookingObj.roomImages || []
        },
        bookingInfo: {
          numberOfRooms: bookingObj.numberOfRooms || 1,
          totalRoomCost: bookingObj.totalAmount || 0
        }
      }];

      // Calculate booking summary
      const totalRooms = bookingObj.numberOfRooms || 1;
      const checkInDate = new Date(bookingObj.checkInDate);
      const checkOutDate = new Date(bookingObj.checkOutDate);
      const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

      // Booking timeline
      const bookingTimeline = {
        created: bookingObj.createdAt,
        lastUpdated: bookingObj.updatedAt,
        checkIn: bookingObj.checkInDate,
        checkOut: bookingObj.checkOutDate,
        status: bookingObj.status
      };

      return {
        // Basic booking info
        _id: bookingObj._id,
        bookingId: bookingObj._id.toString().slice(-8).toUpperCase(),
        status: bookingObj.status,
        totalAmount: bookingObj.totalAmount,
        
        // Detailed information
        userInformation,
        guestInformation,
        roomDetails,
        
        // Booking summary
        bookingSummary: {
          totalRooms,
          numberOfNights,
          checkInDate: bookingObj.checkInDate,
          checkOutDate: bookingObj.checkOutDate,
          duration: numberOfNights === 1 ? "1 night" : `${numberOfNights} nights`
        },
        
        // Timeline
        bookingTimeline,
        
        // Legacy fields for backward compatibility
        user: userInformation,
        room: roomDetails[0]?.roomInfo || null,
        personName: guestInformation.guests.map(guest => guest.name),
        checkInDate: bookingObj.checkInDate,
        checkOutDate: bookingObj.checkOutDate,
        createdAt: bookingObj.createdAt,
        updatedAt: bookingObj.updatedAt,
        
        // Include all original fields for debugging
        originalData: bookingObj
      };
    });

    return NextResponse.json({
      success: true,
      bookings: detailedBookings,
      pagination: {
        total: totalBookings,
        pages: Math.ceil(totalBookings / limit),
        page,
        limit,
      },
      summary: {
        totalBookings,
        statusBreakdown: await getStatusBreakdown(),
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    }, { status: 500 });
  }
}

// Helper function to get status breakdown
async function getStatusBreakdown() {
  try {
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const breakdown = {};
    statusCounts.forEach(item => {
      breakdown[item._id] = item.count;
    });
    
    return breakdown;
  } catch (error) {
    console.error("Error getting status breakdown:", error);
    return {};
  }
}

// Additional utility functions for booking management

// Function to check room availability for given dates
export async function checkRoomAvailability(roomId, checkInDate, checkOutDate, numberOfRooms) {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return { available: false, message: "Room not found" };
    }

    if (!room.isAvailable) {
      return { available: false, message: "Room is not available" };
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.aggregate([
      {
        $match: {
          "rooms.roomId": room._id,
          status: { $in: ["confirmed", "pending"] },
          $or: [
            {
              checkInDate: { $lt: new Date(checkOutDate) },
              checkOutDate: { $gt: new Date(checkInDate) },
            },
          ],
        },
      },
      {
        $unwind: "$rooms"
      },
      {
        $match: {
          "rooms.roomId": room._id
        }
      },
      {
        $group: {
          _id: null,
          totalBookedRooms: { $sum: "$rooms.numberOfRooms" },
        },
      },
    ]);

    const currentlyBookedRooms = overlappingBookings.length > 0 ? overlappingBookings[0].totalBookedRooms : 0;
    const availableRooms = room.noOfRoom - currentlyBookedRooms;

    return {
      available: numberOfRooms <= availableRooms,
      availableRooms,
      totalRooms: room.noOfRoom,
      bookedRooms: currentlyBookedRooms,
      message: numberOfRooms <= availableRooms ? 
        `${availableRooms} rooms available` : 
        `Only ${availableRooms} rooms available, ${numberOfRooms} requested`
    };
  } catch (error) {
    console.error("Error checking room availability:", error);
    return { available: false, message: "Error checking availability" };
  }
}

// Function to calculate booking total
export async function calculateBookingTotal(rooms, checkInDate, checkOutDate) {
  try {
    let totalAmount = 0;
    const days = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    
    for (const roomData of rooms) {
      const room = await Room.findById(roomData.roomId);
      if (room) {
        const roomTotal = room.price * days * roomData.numberOfRooms;
        totalAmount += roomTotal;
      }
    }
    
    return {
      totalAmount,
      numberOfDays: days,
      breakdown: await Promise.all(rooms.map(async (roomData) => {
        const room = await Room.findById(roomData.roomId);
        return {
          roomId: roomData.roomId,
          roomName: room?.name || "Unknown Room",
          pricePerNight: room?.price || 0,
          numberOfRooms: roomData.numberOfRooms,
          numberOfDays: days,
          subtotal: (room?.price || 0) * days * roomData.numberOfRooms
        };
      }))
    };
  } catch (error) {
    console.error("Error calculating booking total:", error);
    return { totalAmount: 0, numberOfDays: 0, breakdown: [] };
  }
}

// Function to validate booking data
export function validateBookingData(data) {
  const errors = [];

  // Validate required fields
  if (!data.rooms || !Array.isArray(data.rooms) || data.rooms.length === 0) {
    errors.push("Rooms array is required and must not be empty");
  }

  if (!data.checkInDate || !data.checkOutDate) {
    errors.push("Check-in and check-out dates are required");
  }

  if (!data.personDetails || !Array.isArray(data.personDetails) || data.personDetails.length === 0) {
    errors.push("Person details array is required and must not be empty");
  }

  // Validate dates
  if (data.checkInDate && data.checkOutDate) {
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      errors.push("Check-in date cannot be in the past");
    }

    if (checkOut <= checkIn) {
      errors.push("Check-out date must be after check-in date");
    }
  }

  // Validate rooms structure
  if (data.rooms && Array.isArray(data.rooms)) {
    data.rooms.forEach((room, index) => {
      if (!room.roomId) {
        errors.push(`Room ${index + 1}: roomId is required`);
      }
      if (!room.numberOfRooms || typeof room.numberOfRooms !== 'number' || room.numberOfRooms <= 0) {
        errors.push(`Room ${index + 1}: numberOfRooms must be a positive number`);
      }
    });
  }

  // Validate person details structure
  if (data.personDetails && Array.isArray(data.personDetails)) {
    data.personDetails.forEach((person, index) => {
      if (!person.name || !person.name.trim()) {
        errors.push(`Person ${index + 1}: name is required`);
      }
      if (!person.age || typeof person.age !== 'number' || person.age <= 0 || person.age > 120) {
        errors.push(`Person ${index + 1}: age must be a valid number between 1 and 120`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to generate booking reference
export function generateBookingReference() {
  return `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}