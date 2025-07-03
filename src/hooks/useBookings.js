import { useState, useEffect, useCallback } from 'react';

export const useBookings = (initialFilters = {}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 50
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    source: 'all',
    roomType: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    ...initialFilters
  });

  // Fetch bookings data
  const fetchBookings = useCallback(async (customFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = { ...filters, ...customFilters };
      const params = new URLSearchParams();

      // Add all filters to params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/bookings?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings || []);
        setPagination(data.pagination || pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError(err.message);
      console.error('Bookings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to first page when filters change
    }));
  }, []);

  // Change page
  const changePage = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      changePage(pagination.currentPage + 1);
    }
  }, [pagination.hasNextPage, pagination.currentPage, changePage]);

  // Go to previous page
  const previousPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      changePage(pagination.currentPage - 1);
    }
  }, [pagination.hasPrevPage, pagination.currentPage, changePage]);

  // Filter by source
  const filterBySource = useCallback((source) => {
    updateFilters({ source, page: 1 });
  }, [updateFilters]);

  // Filter by room type
  const filterByRoomType = useCallback((roomType) => {
    updateFilters({ roomType, page: 1 });
  }, [updateFilters]);

  // Filter by status
  const filterByStatus = useCallback((status) => {
    updateFilters({ status, page: 1 });
  }, [updateFilters]);

  // Filter by date range
  const filterByDateRange = useCallback((startDate, endDate) => {
    updateFilters({ startDate, endDate, page: 1 });
  }, [updateFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 50,
      source: 'all',
      roomType: 'all',
      status: 'all',
      startDate: '',
      endDate: ''
    });
  }, []);

  // Get booking statistics
  const getBookingStats = useCallback(() => {
    const stats = {
      total: bookings.length,
      bySource: {},
      byRoomType: {},
      byStatus: {},
      totalRevenue: 0
    };

    bookings.forEach(booking => {
      // Count by source
      stats.bySource[booking.source] = (stats.bySource[booking.source] || 0) + 1;
      
      // Count by room type
      stats.byRoomType[booking.roomType] = (stats.byRoomType[booking.roomType] || 0) + 1;
      
      // Count by status
      stats.byStatus[booking.status] = (stats.byStatus[booking.status] || 0) + 1;
      
      // Calculate total revenue
      stats.totalRevenue += booking.totalAmount || 0;
    });

    return stats;
  }, [bookings]);

  // Find booking by ID
  const findBookingById = useCallback((id) => {
    return bookings.find(booking => booking.id === id || booking.bookingId === id);
  }, [bookings]);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Refetch when filters change
  useEffect(() => {
    fetchBookings(filters);
  }, [filters]);

  return {
    bookings,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    nextPage,
    previousPage,
    filterBySource,
    filterByRoomType,
    filterByStatus,
    filterByDateRange,
    clearFilters,
    getBookingStats,
    findBookingById,
    refetch: fetchBookings
  };
};