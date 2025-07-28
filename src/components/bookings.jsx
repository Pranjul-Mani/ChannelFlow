"use client"
import { useEffect, useState } from "react"
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
  Users,
  Bed,
  Eye,
  Info,
  Phone,
  Mail,
  Home,
  Printer,
  Send,
  X,
} from "lucide-react"

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)
  const [updatingBookingId, setUpdatingBookingId] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null) // Changed from expandedBookings to selectedBooking
  const [statusFilter, setStatusFilter] = useState("all")
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    // Initial fetch
    fetchBookings()
    const interval = setInterval(() => {
      if (document.hasFocus()) {
        fetchBookings()
      }
    }, 10000) // 10 seconds for bookings
    return () => clearInterval(interval)
  }, [statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      let url = "/api/bookings"
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setBookings(data.bookings)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError("Failed to fetch bookings")
      setTimeout(() => setError(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, newStatus, additionalData = {}) => {
    setUpdatingBookingId(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to update booking status")
      }
      setSuccess(`Booking status updated to ${newStatus}`)
      fetchBookings()
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error updating booking status:", error)
      setError(error.message || "Error updating booking status")
      setTimeout(() => setError(""), 3000)
    } finally {
      setUpdatingBookingId(null)
    }
  }

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking)
  }

  const closeBookingDetails = () => {
    setSelectedBooking(null)
  }

  const getFilteredBookings = () => {
    let filtered = bookings
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }
    return filtered
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
        }
      case "confirmed":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
        }
      case "checked-in":
        return {
          bg: "bg-sky-100", // Changed from indigo
          text: "text-sky-800", // Changed from indigo
          border: "border-sky-200", // Changed from indigo
        }
      case "checked-out":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          border: "border-purple-200",
        }
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
        }
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
        }
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        }
    }
  }

  const getAvailableStatusUpdates = (currentStatus) => {
    const updates = []
    switch (currentStatus) {
      case "pending":
        updates.push({
          value: "confirmed",
          label: "Confirm",
          color: "bg-blue-600 hover:bg-blue-700",
        })
        updates.push({
          value: "cancelled",
          label: "Cancel",
          color: "bg-red-600 hover:bg-red-700",
        })
        break
      case "confirmed":
        updates.push({
          value: "checked-in",
          label: "Check In",
          color: "bg-sky-600 hover:bg-sky-700", // Changed from indigo
        })
        updates.push({
          value: "cancelled",
          label: "Cancel",
          color: "bg-red-600 hover:bg-red-700",
        })
        break
      case "checked-in":
        updates.push({
          value: "checked-out",
          label: "Check Out",
          color: "bg-purple-600 hover:bg-purple-700",
        })
        updates.push({
          value: "cancelled",
          label: "Cancel",
          color: "bg-red-600 hover:bg-red-700",
        })
        break
      case "checked-out":
        updates.push({
          value: "completed",
          label: "Complete",
          color: "bg-green-600 hover:bg-green-700",
        })
        break
      case "completed":
      case "cancelled":
      default:
        break
    }
    return updates
  }

  const formatDateTime = (dateString) => {
    if (!dateString) {
      return { date: "N/A", time: "N/A" }
    }
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return { date: "Invalid Date", time: "Invalid Time" }
      }
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    } catch (error) {
      console.error("Error formatting date:", error)
      return { date: "Error", time: "Error" }
    }
  }

  const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return null
    try {
      const checkIn = new Date(checkInDate)
      const checkOut = new Date(checkOutDate)
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return null
      }
      const diffTime = checkOut - checkIn
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return nights > 0 ? nights : null
    } catch (error) {
      console.error("Error calculating nights:", error)
      return null
    }
  }

  const formatDuration = (nights) => {
    if (!nights || nights === 0) return "N/A"
    const days = nights + 1
    return `${days}D/${nights}N`
  }

  const getBookingDates = (booking) => {
    const checkInDate = booking.bookingSummary?.checkInDate || booking.checkInDate
    const checkOutDate = booking.bookingSummary?.checkOutDate || booking.checkOutDate
    // Calculate nights from dates
    const nights = calculateNights(checkInDate, checkOutDate)
    return {
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      formattedCheckIn: formatDateTime(checkInDate),
      formattedCheckOut: formatDateTime(checkOutDate),
      nights: nights,
      formattedDuration: formatDuration(nights),
    }
  }

  const getPrimaryGuestName = (booking) => {
    if (booking.guestInformation?.guests && booking.guestInformation.guests.length > 0) {
      return booking.guestInformation.guests[0].name || "Guest"
    }
    return booking.userInformation?.name || "Unknown Guest"
  }

  // Print function
  const handlePrint = (booking) => {
    const printContent = generatePrintContent(booking)
    const printWindow = window.open("", "_blank")
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Email function
  const handleSendEmail = async (booking) => {
    setEmailSending(true)
    try {
      const response = await fetch("/api/bookings/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking._id,
          guestEmail: booking.guestInformation?.guests[0]?.email,
          bookingDetails: booking,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setEmailSent(true)
        setSuccess("Booking confirmation email sent successfully!")
        setTimeout(() => {
          setEmailSent(false)
          setSuccess("")
        }, 3000)
      } else {
        throw new Error(data.message || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      setError("Failed to send booking confirmation email")
      setTimeout(() => setError(""), 3000)
    } finally {
      setEmailSending(false)
    }
  }

  // Generate print content matching your voucher format
  const generatePrintContent = (booking) => {
    const dates = getBookingDates(booking)
    const primaryGuestName = getPrimaryGuestName(booking)
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Booking Confirmation - ${booking.bookingId || "N/A"}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; color-adjust: exact; font-size: 12px; }
          .no-print { display: none !important; }
          @page { margin: 0.5in; }
        }
        body { font-size: 12px; line-height: 1.3; }
        .voucher-header { border: 3px solid black; padding: 15px; margin-bottom: 20px; }
        .policy-content ol { margin-left: 1rem; margin-bottom: 0.25rem; }
        .policy-content li { margin-bottom: 0.25rem; font-size: 11px; }
        .policy-content p { margin-bottom: 0.25rem; font-size: 11px; }
      </style>
    </head>
    <body class="font-sans text-gray-800 bg-white p-4">
      <!-- Voucher Header - Exact Format -->
      <div class="voucher-header">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h1 class="text-2xl font-bold mb-2">CONFIRM BOOKING</h1>
            <h2 class="text-lg font-semibold mb-2">BOOKING REFERENCE NO :</h2>
            <h2 class="text-xl font-bold">${booking.bookingId || "{request_number}"}</h2>
            <div class="mt-4 text-sm">
              <p>Kindly print this confirmation and have it</p>
              <p>ready upon check-in at the Hotel</p>
            </div>
          </div>
          <div class="text-right">
            <h1 class="text-2xl font-bold mb-2">Hotel Moksha</h1>
            <div class="text-xs leading-tight">
              <p>Near Geeta Ashram Taxi Stand, Swargashram, Rishikesh,</p>
              <p>Dehradun, Uttarakhand, 249304,</p>
              <p>Rishikesh - 249304,Uttarakhand,India</p>
              <p class="mt-2">bookings@hotelmoksha.in</p>
              <p>Phone : +91 135 244 0040</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <p class="text-sm">Dear ${primaryGuestName},</p>
        <br>
        <p class="text-sm">Thank you for choosing Hotel Moksha for your stay. We are pleased to inform you that your reservation request is CONFIRMED and your reservation details are as follows.</p>
      </div>
      <!-- Booking Details -->
      <div class="mb-4">
        <h3 class="text-lg font-bold mb-3">Booking Details</h3>
        <div class="grid grid-cols-2 gap-6 text-sm">
          <div>
            <div class="mb-2"><span class="font-medium">Booking Date:</span> ${new Date().toLocaleDateString()}</div>
            <div class="mb-2"><span class="font-medium">Check In Date:</span> ${dates.formattedCheckIn.date}</div>
            <div class="mb-2"><span class="font-medium">Check Out Date:</span> ${dates.formattedCheckOut.date}</div>
            <div class="mb-2"><span class="font-medium">Nights:</span> ${booking.bookingSummary?.duration || "N/A"}</div>
            <div class="mb-2"><span class="font-medium">Arrival Time:</span> 1:00 PM</div>
          </div>
          <div>
            <div class="mb-2"><span class="font-medium">Total Guests:</span> ${booking.guestInformation?.totalGuests || 0}</div>
            <div class="mb-2"><span class="font-medium">Total Rooms:</span> ${booking.bookingSummary?.totalRooms || 0}</div>
            <div class="mb-2"><span class="font-medium">Booking Status:</span> ${(booking.status || "CONFIRMED").toUpperCase()}</div>
          </div>
        </div>
      </div>
      <!-- Guest Information -->
      <div class="mb-4">
        <h3 class="text-lg font-bold mb-3">Guest Information</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          ${
            booking.guestInformation?.guests
              ?.map(
                (guest, index) => `
            <div class="border border-gray-300 p-2">
              <div class="font-medium">Guest ${index + 1}: ${guest.name || "N/A"}</div>
              <div class="text-xs">Age: ${guest.age || "N/A"}</div>
              ${guest.email ? `<div class="text-xs">Email: ${guest.email}</div>` : ""}
              ${guest.phone ? `<div class="text-xs">Phone: ${guest.phone}</div>` : ""}
            </div>
          `,
              )
              .join("") || "<p>No guest information available</p>"
          }
        </div>
      </div>
      <!-- Room Details -->
      <div class="mb-4">
        <h3 class="text-lg font-bold mb-3">Room Details</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          ${
            booking.roomDetails
              ?.map(
                (room, index) => `
            <div class="border border-gray-300 p-2">
              <div class="font-medium">${room.roomInfo?.name || "Room"} (#${room.roomInfo?.roomNumber || "N/A"})</div>
              <div class="text-xs">${room.roomInfo?.category || "Standard"}</div>
              <div class="text-xs">₹${(room.roomInfo?.pricePerNight || 0).toLocaleString()} per night</div>
              <div class="text-xs">Rooms: ${room.bookingInfo?.numberOfRooms || 1}</div>
            </div>
          `,
              )
              .join("") || "<p>No room details available</p>"
          }
        </div>
      </div>
      <!-- Total Amount -->
      <div class="text-center bg-blue-50 border-2 border-blue-500 p-3 mb-4">
        <div class="text-xl font-bold text-blue-600">TOTAL AMOUNT: ₹${(booking.totalAmount || 0).toLocaleString()}</div>
      </div>
      <!-- Conditions & Policies -->
      <div class="border-2 border-gray-800 p-3">
        <div class="text-center font-bold text-lg mb-3 underline">Conditions & Policies</div>
                <div class="mb-3">
          <div class="font-bold text-sm mb-1">Cancellation Policy</div>
          <div class="text-xs">Cancellation is allowed up to Three days prior to the check-in date.</div>
        </div>
        <div class="mb-3">
          <div class="font-bold text-sm mb-1">Hotel Policy</div>
          <div class="policy-content text-xs">
            <p><strong>Late Check-Out Policy</strong></p>
            <p>At Hotel Moksha, We strive to accommodate our guests needs and ensure a comfortable stay. Our standard check-out time is 11:00 am, and check-in time is 1:00 pm.</p>
                        <p class="font-medium mt-2 mb-1">Late Check-Out Guidelines:</p>
            <ol class="list-decimal pl-4">
              <li><strong>Complimentary Late Check-Out (Up to 1 Hour):</strong> Guests may request a late check-out of up to 1 hour beyond the standard check-out time. This is subject to prior intimation and confirmation from the hotel and will only be granted if the room has not been pre-booked for an incoming guest.</li>
              <li><strong>Extended Late Check-Out Charges:</strong>
                <br>More than 1 hour and up to 2 hours : ₹500
                <br>More than 2 hours and up to 3 hours : ₹1000
                <br>More than 3 hours: Charged as half day's tariff
              </li>
            </ol>
                        <p class="mt-2"><strong>Important Notes:</strong> Late check-out requests are subject to availability and must be confirmed by the front desk in advance. Charges will be applied automatically if the room is occupied beyond the permitted time without prior confirmation. We recommend informing the front desk as early as possible to facilitate your request. For any assistance or inquiries regarding late check-out, please contact our reception desk.</p>
            <p class="mt-1">Thank you for choosing Hotel Moksha. We hope you enjoy your stay!</p>
          </div>
        </div>
        <div class="bg-blue-50 p-2 mb-3 text-xs text-center">
          <p><strong>Hotel Check in Time : 11:00 AM</strong></p>
          <p><strong>Hotel Check out Time : 11:00 AM</strong></p>
        </div>
        <div class="text-center text-xs">
          <p class="mb-1">This email has been sent from an automated system - please do not reply to it.</p>
          <p class="font-bold mb-1">**** FOR ANY FURTHER QUERY ****</p>
          <p><strong>Contact us by Email Id:</strong> bookings@hotelmoksha.in</p>
          <p><strong>Phone NO:</strong> +91 135 244 0040</p>
          <p class="mt-1">Address: Near Geeta Ashram Taxi Stand, Swargashram, Rishikesh, Dehradun, Uttarakhand, 249304, Rishikesh-249304, Uttarakhand, India</p>
        </div>
      </div>
    </body>
    </html>
    `
  }

  return (
    <div className="text-black p-6 min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bookings Dashboard</h1>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors disabled:bg-blue-300"
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
            {["all", "pending", "confirmed", "checked-in", "checked-out", "completed", "cancelled"].map((status) => {
              const isActive = statusFilter === status
              const count =
                status === "all" ? bookings.length : bookings.filter((booking) => booking.status === status).length
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm cursor-pointer font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? `text-white ${
                          status === "pending"
                            ? "bg-yellow-500"
                            : status === "confirmed"
                              ? "bg-blue-500"
                              : status === "checked-in"
                                ? "bg-sky-500" // Changed from indigo
                                : status === "checked-out"
                                  ? "bg-purple-500"
                                  : status === "completed"
                                    ? "bg-green-500"
                                    : status === "cancelled"
                                      ? "bg-red-500"
                                      : "bg-gray-800"
                        }`
                      : `hover:bg-opacity-90 ${
                          status === "pending"
                            ? "bg-yellow-50 text-yellow-700"
                            : status === "confirmed"
                              ? "bg-blue-50 text-blue-700"
                              : status === "checked-in"
                                ? "bg-sky-50 text-sky-700" // Changed from indigo
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
                  {status === "checked-in"
                    ? "Checked In"
                    : status === "checked-out"
                      ? "Checked Out"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isActive ? "bg-white bg-opacity-30 text-gray-800" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        {getFilteredBookings().length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 mb-4 text-gray-400 mx-auto">
              <Calendar size={64} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === "all"
                ? "No bookings are currently available"
                : `No bookings match the selected status filter`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredBookings().map((booking) => {
              const statusColors = getStatusColor(booking.status)
              const availableUpdates = getAvailableStatusUpdates(booking.status)
              const dates = getBookingDates(booking)
              const primaryGuestName = getPrimaryGuestName(booking)
              return (
                <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{primaryGuestName}</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{(booking.totalAmount || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{dates.formattedDuration || "N/A"}</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}
                      >
                        {booking.status === "checked-in"
                          ? "Checked In"
                          : booking.status === "checked-out"
                            ? "Checked Out"
                            : (booking.status || "unknown").charAt(0).toUpperCase() +
                              (booking.status || "unknown").slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {dates.formattedCheckIn.date} - {dates.formattedCheckOut.date}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {booking.bookingSummary?.totalRooms || 0} room
                          {(booking.bookingSummary?.totalRooms || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {booking.guestInformation?.totalGuests || 0} guest
                          {(booking.guestInformation?.totalGuests || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          {availableUpdates.map((statusUpdate) => (
                            <button
                              key={statusUpdate.value}
                              onClick={() =>
                                updateBookingStatus(booking._id, statusUpdate.value, statusUpdate.additionalData || {})
                              }
                              disabled={updatingBookingId === booking._id}
                              className={`cursor-pointer px-3 py-1 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusUpdate.color}`}
                            >
                              {updatingBookingId === booking._id ? (
                                <div className="flex items-center justify-center gap-1">
                                  <RefreshCw size={12} className="animate-spin" />
                                  Loading...
                                </div>
                              ) : (
                                statusUpdate.label
                              )}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => openBookingDetails(booking)}
                          className="cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {/* Modal for Booking Details */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{getPrimaryGuestName(selectedBooking)}</h2>
                  <p className="text-sm text-gray-500">Booking ID: #{selectedBooking.bookingId || "N/A"}</p>
                </div>
                <button onClick={closeBookingDetails} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Booking Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-700" /> {/* Changed from indigo */}
                      Booking Summary
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Check-in</span>
                          <p className="text-sm text-gray-900">
                            {getBookingDates(selectedBooking).formattedCheckIn.date}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Check-out</span>
                          <p className="text-sm text-gray-900">
                            {getBookingDates(selectedBooking).formattedCheckOut.date}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Duration</span>
                          <p className="text-sm text-gray-900">{selectedBooking.bookingSummary?.duration || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Rooms</span>
                          <p className="text-sm text-gray-900">{selectedBooking.bookingSummary?.totalRooms || 0}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Guests</span>
                          <p className="text-sm text-gray-900">{selectedBooking.guestInformation?.totalGuests || 0}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 mr-3">Status</span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedBooking.status).bg} ${getStatusColor(selectedBooking.status).text}`}
                          >
                            {selectedBooking.status === "checked-in"
                              ? "Checked In"
                              : selectedBooking.status === "checked-out"
                                ? "Checked Out"
                                : (selectedBooking.status || "unknown").charAt(0).toUpperCase() +
                                  (selectedBooking.status || "unknown").slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Total Amount</span>
                        <p className="text-2xl font-bold text-blue-700">
                          {" "}
                          {/* Changed from indigo */}₹{(selectedBooking.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      {/* Additional Details in Booking Summary */}
                      {(selectedBooking.source || selectedBooking.notes || selectedBooking.specialRequests) && (
                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          {selectedBooking.source && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Source:</span>
                              <p className="text-sm text-gray-600">{selectedBooking.source}</p>
                            </div>
                          )}
                          {selectedBooking.notes && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Notes:</span>
                              <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                            </div>
                          )}
                          {selectedBooking.specialRequests && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Special Requests:</span>
                              <p className="text-sm text-gray-600">{selectedBooking.specialRequests}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Timestamps */}
                      <div className="pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                        {selectedBooking.createdAt && (
                          <div>
                            <span className="font-medium">Created:</span>
                            <p>
                              {formatDateTime(selectedBooking.createdAt).date} at{" "}
                              {formatDateTime(selectedBooking.createdAt).time}
                            </p>
                          </div>
                        )}
                        {selectedBooking.updatedAt && (
                          <div>
                            <span className="font-medium">Updated:</span>
                            <p>
                              {formatDateTime(selectedBooking.updatedAt).date} at{" "}
                              {formatDateTime(selectedBooking.updatedAt).time}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Guest Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-700" /> {/* Changed from indigo */}
                      Guests ({selectedBooking.guestInformation?.totalGuests || 0})
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedBooking.guestInformation?.guests &&
                        selectedBooking.guestInformation.guests.length > 0 ? (
                          selectedBooking.guestInformation.guests.map((guest, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  Guest {guest.guestNumber || index + 1}
                                </span>
                                <span className="text-xs text-gray-500">Age: {guest.age || "N/A"}</span>
                              </div>
                              <p className="font-medium text-sm mb-1">{guest.name || "N/A"}</p>
                              {guest.email && (
                                <p className="text-xs text-gray-600 flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {guest.email}
                                </p>
                              )}
                              {guest.phone && (
                                <p className="text-xs text-gray-600 flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {guest.phone}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No guest information available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Room Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bed className="w-5 h-5 mr-2 text-blue-700" /> {/* Changed from indigo */}
                    Room Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBooking.roomDetails && selectedBooking.roomDetails.length > 0 ? (
                      selectedBooking.roomDetails.map((room, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold text-gray-900 capitalize">
                                {room.roomInfo?.name || "Unknown Room"}
                              </h5>
                              <p className="text-sm text-gray-600">Room No - {room.roomInfo?.roomNumber || "N/A"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {room.bookingInfo?.numberOfRooms || 1} room
                                {(room.bookingInfo?.numberOfRooms || 1) !== 1 ? "s" : ""}
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{(room.roomInfo?.pricePerNight || 0).toLocaleString()}/night
                              </p>
                            </div>
                          </div>
                          {room.roomInfo?.amenities && room.roomInfo.amenities.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
                              <div className="flex flex-wrap gap-1">
                                {room.roomInfo.amenities.slice(0, 4).map((amenity, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {amenity}
                                  </span>
                                ))}
                                {room.roomInfo.amenities.length > 4 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{room.roomInfo.amenities.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-sm text-gray-500">No room details available</div>
                    )}
                  </div>
                </div>
              </div>
              {/* Modal Footer with Print and Email buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handlePrint(selectedBooking)}
                    className="cursor-pointer px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center gap-2"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                  <button
                    onClick={() => handleSendEmail(selectedBooking)}
                    disabled={emailSending || !selectedBooking.guestInformation?.guests[0]?.email}
                    className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center gap-2"
                  >
                    {emailSending ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        {emailSent ? "Email Sent!" : "Send Email"}
                      </>
                    )}
                  </button>
                </div>
                {!selectedBooking.guestInformation?.guests[0]?.email && (
                  <p className="text-sm text-red-600 mt-2 text-right">No email address available for this guest</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
