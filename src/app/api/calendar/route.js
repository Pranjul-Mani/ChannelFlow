// app/api/calendar/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/database';
import Booking from '@/lib/models/Booking';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Fetch all bookings from database
    const bookings = await Booking.find()
      .select('customerName arrivalDate departureDate source roomType bookingId status numberOfGuests')
      .sort({ arrivalDate: 1 })
      .lean();
      // console.log(bookings);

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: 2025-06
    const roomType = searchParams.get('roomType');

    let filteredBookings = bookings;

    // Filter by month if provided
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
      endDate.setHours(23, 59, 59, 999);

      filteredBookings = bookings.filter(booking => {
        const arrival = new Date(booking.arrivalDate);
        const departure = new Date(booking.departureDate);
        
        // Check if booking overlaps with the month
        return (
          (arrival >= startDate && arrival <= endDate) ||
          (departure >= startDate && departure <= endDate) ||
          (arrival < startDate && departure > endDate)
        );
      });
    }

    // Filter by room type if provided
    if (roomType && roomType !== 'all') {
      filteredBookings = filteredBookings.filter(booking => 
        booking.roomType === roomType
      );
    }

    // Format bookings for frontend
    const formattedBookings = filteredBookings.map(booking => ({
      id: booking._id.toString(),
      customerName: booking.customerName,
      arrivalDate: new Date(booking.arrivalDate).toISOString().split('T')[0],
      departureDate: new Date(booking.departureDate).toISOString().split('T')[0],
      source: booking.source,
      roomType: booking.roomType,
      bookingId: booking.bookingId,
      status: booking.status,
      numberOfGuests: booking.numberOfGuests
    }));

    // Group bookings by date for calendar display
    const bookingsByDate = {};
    
    formattedBookings.forEach(booking => {
      const startBooking = new Date(booking.arrivalDate);
      const endBooking = new Date(booking.departureDate);
      
      const currentDate = new Date(startBooking);
      while (currentDate < endBooking) {
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (!bookingsByDate[dateKey]) {
          bookingsByDate[dateKey] = [];
        }
        
        bookingsByDate[dateKey].push(booking);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return NextResponse.json({
      success: true,
      month: month || 'all',
      totalBookings: formattedBookings.length,
      bookings: formattedBookings,
      bookingsByDate
    });

  } catch (error) {
    console.error('Calendar API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch calendar data'
      },
      { status: 500 }
    );
  }
}