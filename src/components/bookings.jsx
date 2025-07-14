"use client";
import { useEffect, useState } from "react";
import {
  ChevronUp, ChevronDown, RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit3,
  Calendar,
  User,
  MapPin,
  Users,
  Bed,
  Eye,
  EyeOff,
  Info,
  CreditCard,
  Phone,
  Mail,
  Home,
  Star
} from "lucide-react";

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [expandedBookings, setExpandedBookings] = useState({});

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Initial fetch
    fetchBookings();

    const interval = setInterval(() => {
      if (document.hasFocus()) {
        fetchBookings();
      }
    }, 10000); // 10 seconds for bookings
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Updated API endpoint - remove /user from path for admin bookings
      let url = "/api/bookings";
      const params = new URLSearchParams();

      if (statusFilter !== "all") params.append("status", statusFilter);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched data:", data);

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        throw new Error(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(`Failed to fetch bookings: ${error.message}`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus, additionalData = {}) => {
    setUpdatingBookingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData
        }),
      });

      // Parse the response data first
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a fallback error message
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response is ok after parsing - FIXED LINE
      if (!response.ok) {
        throw new Error((data && data.message) || `Failed to update booking status: ${response.status} ${response.statusText}`);
      }

      setSuccess(`Booking status updated to ${newStatus}`);
      fetchBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating booking status:", error);

      // Provide more specific error messages
      let errorMessage = "Error updating booking status";

      if (error.message.includes("fetch")) {
        errorMessage = "Network error: Unable to connect to server";
      } else if (error.message.includes("JSON")) {
        errorMessage = "Server response error: Invalid data format";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const toggleBookingExpansion = (bookingId) => {
    setExpandedBookings(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
        };
      case "confirmed":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
        };
      case "checked-in":
        return {
          bg: "bg-indigo-100",
          text: "text-indigo-800",
          border: "border-indigo-200",
        };
      case "checked-out":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          border: "border-purple-200",
        };
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };
    }
  };

  // One-way status progression: pending -> confirmed -> checked-in -> checked-out -> completed
  // Can cancel from any status except completed
  const getAvailableStatusUpdates = (currentStatus) => {
    const updates = [];

    switch (currentStatus) {
      case "pending":
        updates.push({
          value: "confirmed",
          label: "Confirm",
          color: "bg-blue-600 hover:bg-blue-700",
        });
        updates.push({
          value: "cancelled",
          label: "Cancel",
          color: "bg-red-600 hover:bg-red-700",
        });
        break;

      case "confirmed":
        updates.push({
          value: "checked-in",
          label: "Check In",
          color: "bg-indigo-600 hover:bg-indigo-700",
        });
        updates.push({
          value: "cancelled",
          label: "Cancel",
          color: "bg-red-600 hover:bg-red-700",
        });
        break;

      case "checked-in":
        updates.push({
          value: "checked-out",
          label: "Check Out",
          color: "bg-purple-600 hover:bg-purple-700",
        });
        updates.push({
          value: "cancelled",
          label: "Cancel",
          color: "bg-red-600 hover:bg-red-700",
        });
        break;

      case "checked-out":
        updates.push({
          value: "completed",
          label: "Complete",
          color: "bg-green-600 hover:bg-green-700",
        });
        break;

      // No actions available for completed or cancelled bookings
      case "completed":
      case "cancelled":
      default:
        break;
    }

    return updates;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatDuration = (nights) => {
    return nights === 1 ? "1 night" : `${nights} nights`;
  };

  return (
    <div className="text-black p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bookings Dashboard</h1>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-4 mb-6 rounded-lg">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Booking Status Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Status</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "all",
              "pending",
              "confirmed",
              "checked-in",
              "checked-out",
              "completed",
              "cancelled",
            ].map((status) => {
              const isActive = statusFilter === status;
              const count =
                status === "all"
                  ? bookings.length
                  : bookings.filter((booking) => booking.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm cursor-pointer font-medium flex items-center gap-2 transition-all ${isActive
                    ? `text-white ${status === "pending"
                      ? "bg-yellow-500"
                      : status === "confirmed"
                        ? "bg-blue-500"
                        : status === "checked-in"
                          ? "bg-indigo-500"
                          : status === "checked-out"
                            ? "bg-purple-500"
                            : status === "completed"
                              ? "bg-green-500"
                              : status === "cancelled"
                                ? "bg-red-500"
                                : "bg-gray-800"
                    }`
                    : `hover:bg-opacity-90 ${status === "pending"
                      ? "bg-yellow-50 text-yellow-700"
                      : status === "confirmed"
                        ? "bg-blue-50 text-blue-700"
                        : status === "checked-in"
                          ? "bg-indigo-50 text-indigo-700"
                          : status === "checked-out"
                            ? "bg-purple-50 text-purple-700"
                            : status === "completed"
                              ? "bg-green-50 text-green-700"
                              : status === "cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-100 text-gray-700"
                    }`
                    }`}
                >
                  {status === "checked-in" ? "Checked In" :
                    status === "checked-out" ? "Checked Out" :
                      status.charAt(0).toUpperCase() + status.slice(1)}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${isActive
                      ? "bg-white bg-opacity-30 text-gray-800"
                      : "bg-gray-200 text-gray-800"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <RefreshCw className="w-16 h-16 mb-4 text-gray-400 mx-auto animate-spin" />
              <h3 className="text-lg font-medium text-gray-900">Loading bookings...</h3>
            </div>
          ) : getFilteredBookings().length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 mb-4 text-gray-400 mx-auto">
                <Calendar size={64} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No bookings found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === "all"
                  ? "No bookings are currently available"
                  : `No bookings match the selected status filter`}
              </p>
            </div>
          ) : (
            getFilteredBookings().map((booking) => {
              const statusColors = getStatusColor(booking.status);
              const availableUpdates = getAvailableStatusUpdates(booking.status);
              const isExpanded = expandedBookings[booking._id];

              return (
                <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Compact View Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-indigo-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{booking.bookingId || (booking._id && booking._id.slice(-6))}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {(booking.userInformation && booking.userInformation.name) || 'N/A'} • {(booking.guestInformation && booking.guestInformation.totalGuests) || 0} guest{(booking.guestInformation && booking.guestInformation.totalGuests !== 1) ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{(booking.totalAmount && booking.totalAmount.toLocaleString()) || '0'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(booking.bookingSummary && booking.bookingSummary.duration) || 'N/A'}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                        >
                          {booking.status === "checked-in" ? "Checked In" :
                            booking.status === "checked-out" ? "Checked Out" :
                              booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>

                        <button
                          onClick={() => toggleBookingExpansion(booking._id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Info Row */}
                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {booking.checkInDate ? formatDateTime(booking.checkInDate).date : 'N/A'} - {booking.checkOutDate ? formatDateTime(booking.checkOutDate).date : 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {(booking.bookingSummary && booking.bookingSummary.totalRooms) || 0} room{(booking.bookingSummary && booking.bookingSummary.totalRooms !== 1) ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {(booking.roomDetails && booking.roomDetails[0] && booking.roomDetails[0].roomInfo && booking.roomDetails[0].roomInfo.location) || 'N/A'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {availableUpdates.length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {availableUpdates.map((statusUpdate) => (
                          <button
                            key={statusUpdate.value}
                            onClick={() =>
                              updateBookingStatus(
                                booking._id,
                                statusUpdate.value,
                                statusUpdate.additionalData || {}
                              )
                            }
                            disabled={updatingBookingId === booking._id}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusUpdate.color}`}
                          >
                            {updatingBookingId === booking._id ? (
                              <div className="flex items-center gap-2">
                                <RefreshCw size={14} className="animate-spin" />
                                Updating...
                              </div>
                            ) : (
                              statusUpdate.label
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Information */}
                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <User className="w-5 h-5 mr-2 text-indigo-600" />
                            User Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-600">Name:</span>
                              <span className="ml-2 text-sm font-medium">{(booking.userInformation && booking.userInformation.name) || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-600">Email:</span>
                              <span className="ml-2 text-sm">{(booking.userInformation && booking.userInformation.email) || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-600">Phone:</span>
                              <span className="ml-2 text-sm">{(booking.userInformation && booking.userInformation.phone) || 'N/A'}</span>
                            </div>
                            {booking.userInformation && booking.userInformation.address && (
                              <div className="flex items-start">
                                <Home className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                                <span className="text-sm text-gray-600">Address:</span>
                                <span className="ml-2 text-sm">{booking.userInformation.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Guest Information */}
                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-indigo-600" />
                            Guest Information ({(booking.guestInformation && booking.guestInformation.totalGuests) || 0} guests)
                          </h4>
                          <div className="space-y-2">
                            {booking.guestInformation && booking.guestInformation.guests && booking.guestInformation.guests.map((guest, index) => (
                              <div key={index} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium">Guest {guest.guestNumber}</span>
                                <div className="text-sm text-gray-600">
                                  {guest.name} ({guest.age} years)
                                </div>
                              </div>
                            )) || <p className="text-sm text-gray-500">No guest information available</p>}
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="bg-white p-4 rounded-lg lg:col-span-2">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <Bed className="w-5 h-5 mr-2 text-indigo-600" />
                            Room Details
                          </h4>
                          <div className="space-y-4">
                            {booking.roomDetails && booking.roomDetails.map((room, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-semibold text-gray-900">{(room.roomInfo && room.roomInfo.name) || 'N/A'}</h5>
                                    <p className="text-sm text-gray-600">Room #{(room.roomInfo && room.roomInfo.roomNumber) || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">{(room.roomInfo && room.roomInfo.location) || 'N/A'}</p>
                                    {room.roomInfo && room.roomInfo.description && (
                                      <p className="text-sm text-gray-500 mt-2">{room.roomInfo.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                      {(room.bookingInfo && room.bookingInfo.numberOfRooms) || 0} room{(room.bookingInfo && room.bookingInfo.numberOfRooms !== 1) ? 's' : ''}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      ₹{(room.roomInfo && room.roomInfo.pricePerRoom && room.roomInfo.pricePerRoom.toLocaleString()) || '0'} per room
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                      ₹{(room.bookingInfo && room.bookingInfo.totalRoomCost && room.bookingInfo.totalRoomCost.toLocaleString()) || '0'}
                                    </p>
                                    {room.roomInfo && room.roomInfo.capacity && (
                                      <p className="text-xs text-gray-500">
                                        Capacity: {room.roomInfo.capacity} guests
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {room.roomInfo && room.roomInfo.amenities && room.roomInfo.amenities.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {room.roomInfo.amenities.map((amenity, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )) || <p className="text-sm text-gray-500">No room details available</p>}
                          </div>
                        </div>

                        {/* Booking Summary */}
                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-indigo-600" />
                            Booking Summary
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Check-in:</span>
                              <div className="text-right">
                                <div className="text-sm font-medium">{booking.checkInDate ? formatDateTime(booking.checkInDate).date : 'N/A'}</div>
                                <div className="text-xs text-gray-500">{booking.checkInDate ? formatDateTime(booking.checkInDate).time : 'N/A'}</div>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Check-out:</span>
                              <div className="text-right">
                                <div className="text-sm font-medium">{booking.checkOutDate ? formatDateTime(booking.checkOutDate).date : 'N/A'}</div>
                                <div className="text-xs text-gray-500">{booking.checkOutDate ? formatDateTime(booking.checkOutDate).time : 'N/A'}</div>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Duration:</span>
                              <span className="text-sm font-medium">{(booking.bookingSummary && booking.bookingSummary.duration) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Rooms:</span>
                              <span className="text-sm font-medium">{(booking.bookingSummary && booking.bookingSummary.totalRooms) || 0}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex justify-between">
                                <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                                <span className="text-base font-bold text-indigo-600">
                                  ₹{(booking.totalAmount && booking.totalAmount.toLocaleString()) || '0'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Booking Timeline */}
                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                            Booking Timeline
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Created:</span>
                              <div className="text-right">
                                <div className="text-sm font-medium">{booking.createdAt ? formatDateTime(booking.createdAt).date : 'N/A'}</div>
                                <div className="text-xs text-gray-500">{booking.createdAt ? formatDateTime(booking.createdAt).time : 'N/A'}</div>
                              </div>
                            </div>
                            {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Last Updated:</span>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{formatDateTime(booking.updatedAt).date}</div>
                                  <div className="text-xs text-gray-500">{formatDateTime(booking.updatedAt).time}</div>
                                </div>
                              </div>
                            )}

                            {/* Status Progress Indicator */}
                            <div className="pt-3 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">Status Progress:</p>
                              <div className="flex items-center space-x-2">
                                {['pending', 'confirmed', 'checked-in', 'checked-out', 'completed'].map((status, index) => {
                                  const currentStatusIndex = ['pending', 'confirmed', 'checked-in', 'checked-out', 'completed'].indexOf(booking.status);
                                  const isActive = index <= currentStatusIndex;
                                  const isCurrent = status === booking.status;
                                  const isCancelled = booking.status === 'cancelled';

                                  return (
                                    <div key={status} className="flex items-center">
                                      <div
                                        className={`w-3 h-3 rounded-full flex items-center justify-center ${isCancelled
                                          ? 'bg-red-200'
                                          : isCurrent
                                            ? 'bg-indigo-600'
                                            : isActive
                                              ? 'bg-green-500'
                                              : 'bg-gray-300'
                                          }`}
                                      >
                                        {isCurrent && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        {isActive && !isCurrent && <CheckCircle size={8} className="text-white" />}
                                      </div>
                                      {index < 4 && (
                                        <div
                                          className={`w-8 h-0.5 ${isCancelled
                                            ? 'bg-red-200'
                                            : isActive && index < currentStatusIndex
                                              ? 'bg-green-500'
                                              : 'bg-gray-300'
                                            }`}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span>Pending</span>
                                <span>Confirmed</span>
                                <span>Checked In</span>
                                <span>Checked Out</span>
                                <span>Completed</span>
                              </div>
                              {booking.status === 'cancelled' && (
                                <div className="mt-2 px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full inline-block">
                                  Booking Cancelled
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}