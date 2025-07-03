// app/api/calendar/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/database';
import Booking from '@/lib/models/Booking';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Fetch all bookings and populate roomType to get room details
    const bookings = await Booking.find()
      .select('personDetails checkInDate checkOutDate source roomType status numberOfGuests')
      .populate('roomType', 'name type') // Populate roomType with name and type fields
      .sort({ checkInDate: 1 })
      .lean();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: YYYY-MM
    const roomType = searchParams.get('roomType');

    let filteredBookings = bookings;

    // Filter by month
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
      endDate.setHours(23, 59, 59, 999);

      filteredBookings = bookings.filter(booking => {
        const arrival = new Date(booking.checkInDate);
        const departure = new Date(booking.checkOutDate);
        return (
          (arrival >= startDate && arrival <= endDate) ||
          (departure >= startDate && departure <= endDate) ||
          (arrival < startDate && departure > endDate)
        );
      });
    }

    // Filter by room type
    if (roomType && roomType !== 'all') {
      filteredBookings = filteredBookings.filter(booking => {
        // Compare ObjectId string with the roomType parameter
        return booking.roomType?._id?.toString() === roomType;
      });
    }

    const formattedBookings = filteredBookings.map(booking => ({
      id: booking._id.toString(),
      customerName: booking.personDetails?.[0]?.name || 'N/A',
      checkInDate: new Date(booking.checkInDate).toISOString().split('T')[0],
      checkOutDate: new Date(booking.checkOutDate).toISOString().split('T')[0],
      source: booking.source,
      roomType: {
        id: booking.roomType?._id?.toString() || '',
        name: booking.roomType?.name || 'N/A',
        type: booking.roomType?.type || 'N/A'
      },
      status: booking.status,
      numberOfGuests: booking.numberOfGuests
    }));

    const bookingsByDate = {};

    formattedBookings.forEach(booking => {
      const start = new Date(booking.checkInDate);
      const end = new Date(booking.checkOutDate);
      const currentDate = new Date(start);

      while (currentDate < end) {
        const dateKey = currentDate.toISOString().split('T')[0];
        if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
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
      { success: false, error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}