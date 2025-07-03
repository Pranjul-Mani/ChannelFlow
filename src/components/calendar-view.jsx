import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';

const CalendarView = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [roomType, setRoomType] = useState('all');

  const [roomTypes, setRoomTypes] = useState([
    { value: 'all', label: 'All Rooms' }
  ]);

  useEffect(() => {
    fetchBookings();
  }, [currentDate, roomType]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const allBookingsParams = new URLSearchParams({ month });
      const allBookingsResponse = await fetch(`/api/calendar?${allBookingsParams}`);
      const allBookingsData = await allBookingsResponse.json();

      if (allBookingsData.success) {
        // Extract unique room types using the room name
        const uniqueRoomTypes = [...new Set(allBookingsData.bookings.map(b => b.roomType?.name || 'Unknown'))];
        setRoomTypes([
          { value: 'all', label: 'All Rooms' },
          ...uniqueRoomTypes.map((typeName, index) => ({ value: typeName, label: typeName }))
        ]);

        // Filter bookings by room type name
        const filteredBookings = roomType === 'all'
          ? allBookingsData.bookings
          : allBookingsData.bookings.filter(booking => booking.roomType?.name === roomType);

        setBookings(filteredBookings);
      } else {
        setError(allBookingsData.error);
      }
    } catch (err) {
      setError('Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    return Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1));
  };

  const getRooms = () => {
    // Get unique room names and sort them
    const rooms = [...new Set(bookings.map(booking => booking.roomType?.name || 'Unknown'))].sort();
    return roomType === 'all' ? rooms : rooms.filter(room => room === roomType);
  };

  const sourceColors = {
    'MMT': 'bg-red-500',
    'booking engine': 'bg-yellow-500',
    'Agoda': 'bg-green-500',
    'walk-in': 'bg-pink-500',
  };

  const statusColors = {
    'confirmed': 'bg-green-400',
    'checked-in': 'bg-blue-400',
    'checked-out': 'bg-gray-400',
    'cancelled': 'bg-red-400',
    'pending': 'bg-yellow-400'
  };

  const getBookingStyle = (booking, days) => {
    const startDate = new Date(booking.checkInDate);
    const endDate = new Date(booking.checkOutDate);
    const monthStart = days[0];
    const monthEnd = days[days.length - 1];

    let startDay = 1;
    if (startDate >= monthStart) startDay = startDate.getDate();
    let endDay = days.length;
    if (endDate <= monthEnd) endDay = endDate.getDate();

    const width = endDay - startDay + 1;
    const left = ((startDay - 1) / days.length) * 100;
    const widthPercent = (width / days.length) * 100;

    return {
      left: `${left}%`,
      width: `${widthPercent}%`,
      minWidth: '120px'
    };
  };

  const getBookingsForRoom = (room) => {
    return bookings.filter(booking => booking.roomType?.name === room);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const calendarDays = getCalendarDays();
  const rooms = getRooms();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-600 text-sm">Error loading calendar: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 ">
      <div className="p-2 border-b border-gray-300">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">{getMonthName()}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="text-sm px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {roomTypes.map((type, index) => (
                <option key={`${type.value}-${index}`} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">Total bookings this month: {bookings.length}</div>
      </div>

      <div className="flex border-b border-gray-500">
        <div className="w-32 p-2 bg-gray-100 border-r border-gray-500 font-semibold text-sm text-gray-800">
          Room Type
        </div>
        <div className="flex-1 flex">
          {calendarDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={day.getDate()}
                className={`flex-1 p-2 text-center text-xs border-r border-gray-500 ${isToday ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}`}
              >
                <div>{day.getDate()}</div>
                <div className="text-xs opacity-75">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-gray-300">
        {rooms.map((room, index) => {
          const roomBookings = getBookingsForRoom(room);
          return (
            <div key={`${room}-${index}`} className="flex min-h-16">
              <div className="w-32 p-3 bg-gray-50 border-r border-gray-500 flex">
                <div className="text-sm font-medium text-gray-800 break-words leading-tight" title={room}>{room}</div>
              </div>

              <div className="flex-1 relative">
                <div className="absolute inset-0 flex">
                  {calendarDays.map((_, index) => (
                    <div key={index} className="flex-1 border-r border-gray-400 last:border-r-0" />
                  ))}
                </div>

                <div className="relative p-1 min-h-16">
                  {roomBookings.map((booking, index) => {
                    const style = getBookingStyle(booking, calendarDays);
                    const sourceColor = sourceColors[booking.source] || 'bg-gray-400';
                    const statusColor = statusColors[booking.status] || statusColors.confirmed;

                    return (
                      <div
                        key={`${booking.id}-${index}`}
                        className={`absolute top-1 h-10 ${statusColor} text-white text-xs rounded px-2 py-1 cursor-pointer hover:shadow-lg transition-all duration-200 z-10 flex items-center justify-between group`}
                        style={style}
                      >
                        <div className="font-medium truncate pr-2">{booking.customerName}</div>
                        <div className={`w-3 h-3 ${sourceColor} rounded-full flex-shrink-0 border border-black`}></div>

                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-black bg-opacity-90 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl">
                          <div className="space-y-1">
                            <div className="font-semibold">{booking.customerName}</div>
                            <div className="flex justify-between"><span className="text-gray-300">Source:</span><span>{booking.source}</span></div>
                            <div className="flex justify-between"><span className="text-gray-300">Status:</span><span className="capitalize">{booking.status}</span></div>
                            <div className="flex justify-between"><span className="text-gray-300">Check-in:</span><span>{formatDate(booking.checkInDate)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-300">Check-out:</span><span>{formatDate(booking.checkOutDate)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-300">Room:</span><span>{booking.roomType?.name || 'N/A'}</span></div>
                          </div>
                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black opacity-90"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-300 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="text-sm font-medium text-gray-800 mb-2">Booking Sources:</div>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {Object.entries(sourceColors).map(([source, color]) => (
                <div key={source} className="flex items-center gap-1">
                  <div className={`w-3 h-3 ${color} rounded`}></div>
                  <span>{source}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm font-medium text-gray-800 mb-2">Booking Status:</div>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1">
                  <div className={`w-3 h-3 ${color} rounded-full border border-black`}></div>
                  <span className="capitalize">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;