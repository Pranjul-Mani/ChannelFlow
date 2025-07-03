// hooks/useCalendar.js
import { useState, useEffect, useCallback } from 'react';

export const useCalendar = (initialMonth = null, initialRoomType = 'all') => {
  const [calendarData, setCalendarData] = useState({
    bookings: [],
    bookingsByDate: {},
    totalBookings: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(
    initialMonth || new Date().toISOString().slice(0, 7)
  );
  const [roomType, setRoomType] = useState(initialRoomType);

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ month: currentMonth });
      
      if (roomType && roomType !== 'all') {
        params.append('roomType', roomType);
      }

      const response = await fetch(`/api/calendar?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCalendarData({
          bookings: data.bookings || [],
          bookingsByDate: data.bookingsByDate || {},
          totalBookings: data.totalBookings || 0
        });
      } else {
        throw new Error(data.error || 'Failed to fetch calendar data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, roomType]);

  // Change month
  const changeMonth = useCallback((newMonth) => {
    setCurrentMonth(newMonth);
  }, []);

  // Change room type filter
  const changeRoomType = useCallback((newRoomType) => {
    setRoomType(newRoomType);
  }, []);

  // Navigate to previous month
  const previousMonth = useCallback(() => {
    const [year, month] = currentMonth.split('-');
    const prevMonth = new Date(parseInt(year), parseInt(month) - 2, 1);
    const newMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  // Navigate to next month
  const nextMonth = useCallback(() => {
    const [year, month] = currentMonth.split('-');
    const nextMonthDate = new Date(parseInt(year), parseInt(month), 1);
    const newMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  // Get bookings for a specific date
  const getBookingsForDate = useCallback((date) => {
    const dateKey = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return calendarData.bookingsByDate[dateKey] || [];
  }, [calendarData.bookingsByDate]);

  // Get month name
  const getMonthName = useCallback(() => {
    const [year, monthNum] = currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  // Get calendar grid
  const getCalendarGrid = useCallback(() => {
    const [year, month] = currentMonth.split('-');
    const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const dates = [];
    
    // Add empty cells for days before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      dates.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(parseInt(year), parseInt(month) - 1, day));
    }
    
    return dates;
  }, [currentMonth]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  return {
    calendarData,
    loading,
    error,
    currentMonth,
    roomType,
    changeMonth,
    changeRoomType,
    previousMonth,
    nextMonth,
    getBookingsForDate,
    getMonthName,
    getCalendarGrid,
    refetch: fetchCalendarData
  };
};