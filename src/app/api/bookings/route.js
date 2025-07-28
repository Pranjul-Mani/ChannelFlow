// app/api/bookings/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/utils/database'
import Booking from '@/lib/models/Booking'
import Room from '@/lib/models/room'
import Category from '@/lib/models/Category'

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    // Validate required fields
    if (
      !data.rooms ||
      !Array.isArray(data.rooms) ||
      data.rooms.length === 0 ||
      !data.checkInDate ||
      !data.checkOutDate ||
      !data.personDetails ||
      !Array.isArray(data.personDetails) ||
      data.personDetails.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rooms array structure (now each room is individual)
    const validRooms = data.rooms.filter(roomData =>
      roomData &&
      typeof roomData === 'object' &&
      roomData.roomId
    );

    if (validRooms.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one valid room with roomId is required"
        },
        { status: 400 }
      );
    }

    // Validate person details structure
    const validPersonDetails = data.personDetails.filter(person =>
      person &&
      typeof person === 'object' &&
      person.name &&
      person.name.trim() &&
      person.age &&
      typeof person.age === 'number' &&
      person.age > 0 &&
      person.age <= 120
    );

    if (validPersonDetails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one valid person detail (name and age) is required"
        },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Check-in date cannot be in the past",
        },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        {
          success: false,
          message: "Check-out date must be after check-in date",
        },
        { status: 400 }
      );
    }

    let totalCalculatedAmount = 0;
    let maxTotalPersons = 0;
    const roomsToBook = [];

    // Validate each room and calculate totals
    for (const roomData of validRooms) {
      const room = await Room.findById(roomData.roomId);
      if (!room) {
        return NextResponse.json(
          { success: false, message: `Room with ID ${roomData.roomId} not found` },
          { status: 404 }
        );
      }

      if (!room.isAvailable) {
        return NextResponse.json(
          { success: false, message: `Room ${room.name} is not available` },
          { status: 400 }
        );
      }

      // Check for overlapping bookings
      const overlappingBookings = await Booking.find({
        "rooms.roomId": room._id,
        status: { $in: ["confirmed", "pending", "checked-in"] },
        $or: [
          {
            checkInDate: { $lt: checkOut },
            checkOutDate: { $gt: checkIn },
          },
        ],
      });

      if (overlappingBookings.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Room ${room.name} (${room.roomId}) is already booked for the selected dates`,
          },
          { status: 400 }
        );
      }

      // Calculate amount for this room - FIX: Use customPrice if available
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      // ✅ THIS IS THE FIX: Use customPrice if provided, otherwise use room.price
      const roomPrice = roomData.customPrice !== null && roomData.customPrice !== undefined 
        ? roomData.customPrice 
        : room.price;
      
      const roomTotal = roomPrice * days;
      totalCalculatedAmount += roomTotal;

      // Calculate person capacity
      const maxPersonsPerRoom = room.bed * 2;
      maxTotalPersons += maxPersonsPerRoom;

      roomsToBook.push({
        roomId: room._id,
        numberOfRooms: 1,
        roomDetails: room,
        finalPrice: roomPrice // Store the final price used
      });
    }

    // Validate person capacity against total rooms
    if (validPersonDetails.length > maxTotalPersons) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${maxTotalPersons} persons allowed for ${validRooms.length} room(s)`,
        },
        { status: 400 }
      );
    }

    // Verify the total amount matches (if provided)
    if (data.totalAmount && Math.abs(data.totalAmount - totalCalculatedAmount) > 0.01) {
      return NextResponse.json(
        {
          success: false,
          message: "Total amount calculation mismatch",
          calculatedTotal: totalCalculatedAmount,
          providedTotal: data.totalAmount,
        },
        { status: 400 }
      );
    }

    // Generate booking reference
    const bookingReference = `BK${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    // Create new booking
    const booking = new Booking({
      // With this (fully detailed room info):
      rooms: data.rooms.map(room => ({
        roomId: room.roomId,
        rateType: room.rateType,
        adults: room.adults,
        children: room.children,
        customPrice: room.customPrice || null
      })),
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      personDetails: validPersonDetails.map(person => ({
        name: person.name.trim(),
        age: person.age,
        phone: person.phone || '',
        email: person.email || ''
      })),
      totalAmount: data.totalAmount || totalCalculatedAmount,
      source: data.source || "booking engine",
      status: "pending",
    });

    // Save the booking
    await booking.save();

    // Mark rooms as unavailable
    for (const room of roomsToBook) {
      await Room.findByIdAndUpdate(room.roomId, { isAvailable: false });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        booking: {
          _id: booking._id,
          bookingReference: bookingReference,
          status: booking.status,
          totalAmount: booking.totalAmount,
          calculatedAmount: totalCalculatedAmount,
          // With this (fully detailed room info):
          rooms: data.rooms.map(room => ({
            roomId: room.roomId,
            rateType: room.rateType,
            adults: room.adults,
            children: room.children,
            customPrice: room.customPrice || null
          })),
          createdAt: booking.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET handler to retrieve all bookings
export async function GET(req) {
  try {
    await dbConnect();

    // Get filter parameters from URL
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const source = url.searchParams.get("source");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status && status !== "all") query.status = status;
    if (source && source !== "all") query.source = source;

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);

    // Fetch bookings with detailed population
    const bookings = await Booking.find(query)
      .populate({
        path: "rooms.roomId",
        select: "name roomId location price images amenities bed description category floor",
        populate: {
          path: "category",
          select: "name"
        }
      })
      .populate({
        path: "user",
        select: "name email phone createdAt",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform bookings to provide more detailed structure
    const detailedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();

      // Extract guest information from personDetails
      const guestInformation = {
        totalGuests: bookingObj.personDetails?.length || 0,
        guests: bookingObj.personDetails?.map((person, index) => ({
          guestNumber: index + 1,
          name: person.name || 'Unknown',
          age: person.age || 'N/A',
          phone: person.phone || '',
          email: person.email || ''
        })) || [],
        primaryGuest: bookingObj.personDetails?.[0] || null
      };

      // Extract room details with better error handling
      const roomDetails = bookingObj.rooms?.map(roomBooking => {
        const roomInfo = roomBooking.roomId;
        return {
          roomInfo: {
            roomId: roomInfo?._id?.toString() || '',
            roomNumber: roomInfo?.roomId || 'N/A',
            name: roomInfo?.name || 'Unknown Room',
            location: roomInfo?.location || 'N/A',
            category: roomInfo?.category?.name || 'N/A',
            pricePerNight: roomInfo?.price || 0,
            beds: roomInfo?.bed || 'N/A',
            description: roomInfo?.description || '',
            amenities: roomInfo?.amenities || [],
            images: roomInfo?.images || [],
            floor: roomInfo?.floor || 'N/A'
          },
          bookingInfo: {
            numberOfRooms: roomBooking.numberOfRooms || 1
          }
        };
      }) || [];

      // Calculate booking summary with proper date handling
      const checkInDate = bookingObj.checkInDate ? new Date(bookingObj.checkInDate) : null;
      const checkOutDate = bookingObj.checkOutDate ? new Date(bookingObj.checkOutDate) : null;

      // Validate dates more thoroughly
      const isValidCheckIn = checkInDate && checkInDate instanceof Date && !isNaN(checkInDate.getTime());
      const isValidCheckOut = checkOutDate && checkOutDate instanceof Date && !isNaN(checkOutDate.getTime());

      let numberOfNights = 0;
      if (isValidCheckIn && isValidCheckOut && checkOutDate > checkInDate) {
        numberOfNights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
      }

      return {
        _id: bookingObj._id,
        bookingId: bookingObj._id.toString().slice(-8).toUpperCase(),
        status: bookingObj.status || 'pending',
        source: bookingObj.source || 'booking engine',
        totalAmount: bookingObj.totalAmount || 0,

        // User information from populated user
        userInformation: {
          name: bookingObj.user?.name || 'Unknown User',
          email: bookingObj.user?.email || 'No email provided',
          phone: bookingObj.user?.phone || 'No phone provided',
        },

        guestInformation,
        roomDetails,

        bookingSummary: {
          totalRooms: roomDetails.reduce((sum, room) => sum + room.bookingInfo.numberOfRooms, 0),
          numberOfNights,
          checkInDate: isValidCheckIn ? checkInDate.toISOString() : null,
          checkOutDate: isValidCheckOut ? checkOutDate.toISOString() : null,
          checkInDateRaw: bookingObj.checkInDate,
          checkOutDateRaw: bookingObj.checkOutDate,
          duration: numberOfNights > 0 ? (numberOfNights === 1 ? "1 night" : `${numberOfNights} nights`) : "Invalid dates",
          isValidDates: isValidCheckIn && isValidCheckOut && checkOutDate > checkInDate
        },

        createdAt: bookingObj.createdAt,
        updatedAt: bookingObj.updatedAt
      };
    });

    // Get breakdown data
    const statusBreakdown = await getStatusBreakdown();
    const sourceBreakdown = await getSourceBreakdown();

    return NextResponse.json(
      {
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
          statusBreakdown,
          sourceBreakdown,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
        error: error.message,
      },
      { status: 500 }
    );
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
      breakdown[item._id || 'undefined'] = item.count;
    });

    return breakdown;
  } catch (error) {
    console.error("Error getting status breakdown:", error);
    return {};
  }
}

// Helper function to get source breakdown
async function getSourceBreakdown() {
  try {
    const sourceCounts = await Booking.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
        }
      }
    ]);

    const breakdown = {};
    sourceCounts.forEach(item => {
      breakdown[item._id || 'booking engine'] = item.count;
    });

    return breakdown;
  } catch (error) {
    console.error("Error getting source breakdown:", error);
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