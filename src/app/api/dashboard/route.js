// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/database';
import Booking from '@/lib/models/Booking';

export async function GET() {
  try {
    await dbConnect();

    // Get current date for comparison
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Fetch all bookings
    const allBookings = await Booking.find().lean();
    // console.log(allBookings);
    

    // Get today's bookings
    const todayBookings = await Booking.find({
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    }).lean();

    // Get yesterday's bookings
    const yesterdayBookings = await Booking.find({
      createdAt: {
        $gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        $lt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)
      }
    }).lean();

    // Calculate current occupancy (bookings that are checked-in or confirmed and currently active)
    const currentDate = new Date();
    const activeBookings = allBookings.filter(booking => {
      const arrival = new Date(booking.arrivalDate);
      const departure = new Date(booking.departureDate);
      return arrival <= currentDate && departure > currentDate &&
        (booking.status === 'confirmed' || booking.status === 'checked-in');
    });

    // Channel mapping - Updated to match your actual data format
    const channelMapping = {
      'MMT': { name: 'MakeMyTrip', color: 'bg-red-500', icon: '🔴' },
      'agoda': { name: 'Agoda', color: 'bg-blue-500', icon: '🔵' },
      'booking.com': { name: 'Booking.com', color: 'bg-blue-600', icon: '🔵' },
      'expedia': { name: 'Expedia', color: 'bg-yellow-500', icon: '🟡' },
      'hotels.com': { name: 'Hotels.com', color: 'bg-purple-500', icon: '🟣' },
      'direct': { name: 'Direct Booking', color: 'bg-green-500', icon: '🟢' },
      'cleartrip': { name: 'Cleartrip', color: 'bg-indigo-500', icon: '🟣' },
      'walk-in': { name: 'Walk-In', color: 'bg-gray-600', icon: '🚶' }
    };

    // Group bookings by source
    const bookingsBySource = allBookings.reduce((acc, booking) => {
      const source = booking.source?.toLowerCase() || 'unknown'; // Normalize to lowercase
      if (!acc[source]) {
        acc[source] = {
          bookings: 0,
          revenue: 0,
          activeBookings: 0
        };
      }
      acc[source].bookings += 1;

      // Try multiple revenue field names - adjust based on your schema
      const revenue = booking.totalAmount || booking.amount || booking.price || booking.cost || 0;
      acc[source].revenue += revenue;

      // Check if this booking is currently active
      const arrival = new Date(booking.arrivalDate);
      const departure = new Date(booking.departureDate);
      if (arrival <= currentDate && departure > currentDate &&
        (booking.status === 'confirmed' || booking.status === 'checked-in')) {
        acc[source].activeBookings += 1;
      }

      return acc;
    }, {});


    // Create channel data - ONLY use sources that actually have bookings
    const actualSources = Object.keys(bookingsBySource);
    const totalRoomCapacity = 50; // Adjust this to your hotel's capacity

    const channels = actualSources.map(sourceKey => {
      const sourceData = bookingsBySource[sourceKey];

      // Try to find matching channel info (case-insensitive)
      const channelInfo = channelMapping[sourceKey] ||
        channelMapping[sourceKey.toLowerCase()] ||
        Object.entries(channelMapping).find(([key, value]) =>
          key.toLowerCase() === sourceKey.toLowerCase() ||
          value.name.toLowerCase() === sourceKey.toLowerCase()
        )?.[1] ||
      {
        name: sourceKey.charAt(0).toUpperCase() + sourceKey.slice(1),
        color: 'bg-gray-500',
        icon: '⚪'
      };

      // Calculate occupancy rate
      const occupancy = Math.round((sourceData.activeBookings / totalRoomCapacity) * 100);

      // Determine status based on recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return booking.source?.toLowerCase() === sourceKey && bookingDate >= sevenDaysAgo;
      });

      // More lenient status logic - if there are any bookings, consider it connected
      const status = sourceData.bookings > 0 ? 'connected' : 'disconnected';

      return {
        id: sourceKey,
        name: channelInfo.name,
        color: channelInfo.color,
        status,
        bookings: sourceData.bookings,
        revenue: sourceData.revenue,
        occupancy: Math.min(occupancy, 100) // Cap at 100%
      };
    }).sort((a, b) => {
      // Sort by bookings count (descending) and then by name
      if (b.bookings !== a.bookings) {
        return b.bookings - a.bookings;
      }
      return a.name.localeCompare(b.name);
    });

    // Calculate metrics
    const totalBookings = allBookings.length;
    const totalRevenue = allBookings.reduce((sum, booking) => {
      const revenue = booking.totalAmount || booking.amount || booking.price || booking.cost || 0;
      return sum + revenue;
    }, 0);


    // Calculate average occupancy for connected channels
    const connectedChannels = channels.filter(channel => channel.status === 'connected');
    const avgOccupancy = connectedChannels.length > 0
      ? Math.round(connectedChannels.reduce((sum, channel) => sum + channel.occupancy, 0) / connectedChannels.length)
      : 0;

    // Calculate percentage changes (comparing today vs yesterday)
    const todayBookingsCount = todayBookings.length;
    const yesterdayBookingsCount = yesterdayBookings.length;
    const bookingsChange = yesterdayBookingsCount > 0
      ? Math.round(((todayBookingsCount - yesterdayBookingsCount) / yesterdayBookingsCount) * 100)
      : 0;

    const todayRevenue = todayBookings.reduce((sum, booking) => {
      const revenue = booking.totalAmount || booking.amount || booking.price || booking.cost || 0;
      return sum + revenue;
    }, 0);
    const yesterdayRevenue = yesterdayBookings.reduce((sum, booking) => {
      const revenue = booking.totalAmount || booking.amount || booking.price || booking.cost || 0;
      return sum + revenue;
    }, 0);
    const revenueChange = yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        avgOccupancy,
        activeChannels: connectedChannels.length,
        totalChannels: channels.length,
        channels,
        changes: {
          bookings: bookingsChange,
          revenue: revenueChange,
          occupancy: -2 // You can calculate this based on historical data
        }
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data'
      },
      { status: 500 }
    );
  }
}