"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, Plus, Minus, User, Calendar, MapPin, Home, Users, Percent } from "lucide-react"

// Throttle utility function
const throttle = (func, delay) => {
  let timeoutId
  let lastExecTime = 0
  return function (...args) {
    const currentTime = Date.now()
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(
        () => {
          func.apply(this, args)
          lastExecTime = Date.now()
        },
        delay - (currentTime - lastExecTime),
      )
    }
  }
}

export default function CalendarPage() {
  const [categories, setCategories] = useState([])
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [collapsedCategories, setCollapsedCategories] = useState({})
  const [hoveredBooking, setHoveredBooking] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [refreshing, setRefreshing] = useState(false)

  // Date range selection states
  const [selectedRange, setSelectedRange] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showReservationModal, setShowReservationModal] = useState(false)

  // Generate 14 days from current date
  const generateDates = (startDate) => {
    const dates = []
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const [dates, setDates] = useState(generateDates(currentDate))

  // Fetch categories, rooms, and bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setRefreshing(true)

        // Fetch categories
        const categoriesResponse = await fetch("/api/category")
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)

        // Fetch rooms
        const roomsResponse = await fetch("/api/room")
        const roomsData = await roomsResponse.json()
        const roomsArray = roomsData.data || roomsData || []
        setRooms(Array.isArray(roomsArray) ? roomsArray : [])

        // Fetch bookings
        const bookingsResponse = await fetch("/api/bookings")
        const bookingsData = await bookingsResponse.json()
        if (bookingsData.success) {
          setBookings(bookingsData.bookings || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setCategories([])
        setRooms([])
        setBookings([])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchData()
  }, [])

  // Update dates when current date changes
  useEffect(() => {
    const newDates = generateDates(currentDate)
    setDates(newDates)
  }, [currentDate])

  // Global mouse event listeners for selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleDateSelectionEnd()
      }
    }

    const handleGlobalMouseMove = (e) => {
      handleMouseMove(e)
    }

    document.addEventListener("mouseup", handleGlobalMouseUp)
    document.addEventListener("mousemove", handleGlobalMouseMove)

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [isSelecting])

  // Memoized grouped rooms
  const memoizedGroupedRooms = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        rooms: rooms.filter((room) => {
          const roomCategory = room.category?._id || room.category
          return roomCategory === category._id
        }),
      }))
      .filter((category) => category.rooms.length > 0)
  }, [categories, rooms])

  // Memoized booking calculations for performance
  const memoizedBookingLookup = useMemo(() => {
    const lookup = {}
    const firstVisibleDateStr = dates[0]?.toISOString().split("T")[0]

    dates.forEach((date, dateIndex) => {
      const dateStr = date.toISOString().split("T")[0]
      rooms.forEach((room) => {
        const key = `${room._id}-${dateIndex}`

        // Find display booking
        const displayBooking = bookings.find((booking) => {
          if (booking.status === "cancelled") return false
          const checkInStr = booking.bookingSummary.checkInDate.split("T")[0]
          const checkOutStr = booking.bookingSummary.checkOutDate.split("T")[0]
          const isRoomBooked = booking.roomDetails.some((r) => r.roomInfo.roomId === room._id)

          if (!isRoomBooked) return false

          // Booking starts exactly on this date
          if (checkInStr === dateStr) return true

          // Ongoing booking - starts before calendar window but is still active
          if (checkInStr < firstVisibleDateStr && dateIndex === 0 && dateStr <= checkOutStr) {
            return true
          }

          return false
        })

        // Check if date is covered by any booking
        const coveredByBooking = bookings.find((booking) => {
          if (booking.status === "cancelled") return false
          const checkInStr = booking.bookingSummary.checkInDate.split("T")[0]
          const checkOutStr = booking.bookingSummary.checkOutDate.split("T")[0]
          const isWithinRange = dateStr >= checkInStr && dateStr <= checkOutStr
          const isRoomBooked = booking.roomDetails.some((r) => r.roomInfo.roomId === room._id)

          return isWithinRange && isRoomBooked
        })

        lookup[key] = { displayBooking, coveredByBooking }
      })
    })

    return lookup
  }, [bookings, dates, rooms])

  // Memoized overall statistics (not date-specific)
  const memoizedOverallStatistics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]

    // Calculate total available rooms (only isAvailable = true)
    const totalAvailableRooms = rooms.filter((room) => room.isAvailable).length

    // Calculate currently booked rooms (active bookings for today)
    const bookedRoomsToday = rooms.filter((room) => {
      return bookings.some((booking) => {
        if (booking.status === "cancelled") return false
        const checkInStr = booking.bookingSummary.checkInDate.split("T")[0]
        const checkOutStr = booking.bookingSummary.checkOutDate.split("T")[0]
        const isWithinRange = today >= checkInStr && today <= checkOutStr
        const isRoomBooked = booking.roomDetails.some((roomDetail) => roomDetail.roomInfo.roomId === room._id)

        return isWithinRange && isRoomBooked
      })
    }).length

    // Calculate remaining available rooms
    const remainingAvailable = Math.max(0, totalAvailableRooms - bookedRoomsToday)

    // Calculate occupancy percentage
    const occupancyPercentage = totalAvailableRooms > 0 ? Math.round((bookedRoomsToday / totalAvailableRooms) * 100) : 0

    return {
      totalAvailable: totalAvailableRooms,
      booked: bookedRoomsToday,
      remainingAvailable,
      occupancyPercentage,
    }
  }, [rooms, bookings])

  // Date range selection handlers
  const handleDateSelectionStart = (roomId, dateIndex, e) => {
    e.preventDefault()
    const lookupKey = `${roomId}-${dateIndex}`
    const { coveredByBooking } = memoizedBookingLookup[lookupKey] || {}

    // Don't allow selection on booked dates
    if (coveredByBooking) return

    setIsSelecting(true)
    setSelectionStart({ roomId, dateIndex })
    setSelectedRoom(roomId)
    setSelectedRange({
      roomId,
      startDate: dateIndex,
      endDate: dateIndex,
    })
  }

  const handleDateSelectionMove = (roomId, dateIndex) => {
    if (!isSelecting || !selectionStart || roomId !== selectedRoom) return

    const lookupKey = `${roomId}-${dateIndex}`
    const { coveredByBooking } = memoizedBookingLookup[lookupKey] || {}

    // Don't extend selection over booked dates
    if (coveredByBooking) return

    const startIndex = Math.min(selectionStart.dateIndex, dateIndex)
    const endIndex = Math.max(selectionStart.dateIndex, dateIndex)

    // Check if any dates in the range are booked
    let hasBookedDates = false
    for (let i = startIndex; i <= endIndex; i++) {
      const checkKey = `${roomId}-${i}`
      const { coveredByBooking: isBooked } = memoizedBookingLookup[checkKey] || {}
      if (isBooked) {
        hasBookedDates = true
        break
      }
    }

    if (!hasBookedDates) {
      setSelectedRange({
        roomId,
        startDate: startIndex,
        endDate: endIndex,
      })
    }
  }

  const handleDateSelectionEnd = () => {
    setIsSelecting(false)
    setSelectionStart(null)
  }

  const clearSelection = () => {
    setSelectedRange(null)
    setSelectedRoom(null)
  }

  // Navigation handler for reservation tab
  const navigateToReservation = () => {
    if (!selectedRange) return

    const startDate = dates[selectedRange.startDate]
    const endDate = new Date(dates[selectedRange.endDate])
    endDate.setDate(endDate.getDate() + 1) // Add one day for checkout

    const room = rooms.find((r) => r._id === selectedRange.roomId)

    // Create reservation data
    const reservationData = {
      roomId: selectedRange.roomId,
      roomName: room?.roomId || "",
      categoryName: room?.category?.name || "",
      checkInDate: startDate.toISOString().split("T")[0],
      checkOutDate: endDate.toISOString().split("T")[0],
      nights: selectedRange.endDate - selectedRange.startDate + 1,
    }

    // Store in sessionStorage for the reservation component
    sessionStorage.setItem("newReservation", JSON.stringify(reservationData))

    // Show confirmation modal
    setShowReservationModal(true)
  }

  // Handle reservation redirect
  const handleReservationRedirect = () => {
    // Navigate to reservation tab (adjust path as needed)
    window.location.href = "/reservation"
    setShowReservationModal(false)
    clearSelection()
  }

  // Navigate calendar
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 14 : -14))

    // Don't go before today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (newDate < today && direction === "prev") {
      return
    }

    setCurrentDate(newDate)
    clearSelection() // Clear selection when navigating
  }

  // Format date for display
  const formatDate = (date) => {
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }).toUpperCase(),
      weekday: date.toLocaleString("default", { weekday: "short" }).toUpperCase(),
    }
  }

  // Get booking span for a room starting from a specific date
  const getRoomBookingSpan = useCallback(
    (roomId, startDateIndex, booking) => {
      const checkInStr = booking.bookingSummary.checkInDate.split("T")[0]
      const checkOutStr = booking.bookingSummary.checkOutDate.split("T")[0]
      const firstVisibleDateStr = dates[0].toISOString().split("T")[0]

      let span = 0
      for (let i = startDateIndex; i < dates.length; i++) {
        const currentDateStr = dates[i].toISOString().split("T")[0]
        const effectiveStartDate = checkInStr < firstVisibleDateStr ? firstVisibleDateStr : checkInStr

        if (currentDateStr >= effectiveStartDate && currentDateStr <= checkOutStr) {
          span++
        } else if (currentDateStr > checkOutStr) {
          break
        }
      }

      return span
    },
    [dates],
  )

  // Get booking status color with gradients
  const getBookingStatusColor = (status) => {
    const colors = {
      pending: "bg-gradient-to-r from-amber-400 to-yellow-500",
      confirmed: "bg-gradient-to-r from-emerald-400 to-green-500",
      "checked-in": "bg-gradient-to-r from-blue-400 to-cyan-500",
      "checked-out": "bg-gradient-to-r from-slate-400 to-gray-500",
      cancelled: "bg-gradient-to-r from-red-400 to-rose-500",
      completed: "bg-gradient-to-r from-purple-400 to-violet-500",
    }
    return colors[status] || "bg-gradient-to-r from-gray-300 to-slate-400"
  }

  // Toggle category collapse
  const toggleCategoryCollapse = (categoryId) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Throttled mouse move handler for better performance
  const handleMouseMove = useCallback(
    throttle((e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }, 16), // ~60fps
    [],
  )

  // Format date for display in tooltip
  const formatDateForTooltip = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get display label for booking
  const getBookingDisplayLabel = (booking) => {
    return booking.guestInformation.primaryGuest?.name || "Guest"
  }

  // Get booking duration
  const getBookingDuration = (booking) => {
    const checkInDate = new Date(booking.bookingSummary.checkInDate)
    const checkOutDate = new Date(booking.bookingSummary.checkOutDate)
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime()
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24))
    return daysDifference
  }

  // Render booking tooltip
  const renderTooltip = () => {
    if (!hoveredBooking) return null

    const bookingDays = getBookingDuration(hoveredBooking)

    return (
      <div
        className="fixed z-50 bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-4 max-w-xs"
        style={{
          left: mousePosition.x + 10,
          top: mousePosition.y - 10,
          transform: "translateY(-100%)",
        }}
      >
        <div className="text-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <User size={14} className="text-indigo-500" />
            <span className="font-semibold">{hoveredBooking.guestInformation.primaryGuest?.name || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={14} className="text-blue-500" />
            <span className="text-xs">
              {formatDateForTooltip(hoveredBooking.bookingSummary.checkInDate)} -{" "}
              {formatDateForTooltip(hoveredBooking.bookingSummary.checkOutDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin size={14} className="text-emerald-500" />
            <span className="text-xs">{hoveredBooking.source}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={14} className="text-purple-500" />
            <span className="text-xs font-medium">
              {bookingDays} {bookingDays === 1 ? "Day" : "Days"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getBookingStatusColor(hoveredBooking.status).replace("bg-gradient-to-r", "bg-gradient-to-br")}`}
            ></div>
            <span className="capitalize text-xs font-medium text-slate-700">{hoveredBooking.status}</span>
          </div>
        </div>
      </div>
    )
  }

  // Render selection toolbar
  const renderSelectionToolbar = () => {
    if (!selectedRange) return null

    const room = rooms.find((r) => r._id === selectedRange.roomId)
    const startDate = dates[selectedRange.startDate]
    const endDate = dates[selectedRange.endDate]
    const nights = selectedRange.endDate - selectedRange.startDate + 1

    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6 z-50 min-w-[500px]">
        <div className="flex items-center gap-6">
          <div className="text-sm flex-1">
            <div className="font-bold text-slate-800 mb-2 text-lg">Selected Dates</div>
            <div className="text-slate-600 space-y-1">
              <div>
                <strong className="text-slate-700">Room:</strong> {room?.roomId}
              </div>
              <div>
                <strong className="text-slate-700">Dates:</strong> {startDate.toLocaleDateString()} -{" "}
                {endDate.toLocaleDateString()}
              </div>
              <div>
                <strong className="text-slate-700">Duration:</strong> {nights} {nights === 1 ? "night" : "nights"}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={navigateToReservation}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Create Reservation
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-3 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-xl hover:from-slate-600 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render reservation confirmation modal
  const renderReservationModal = () => {
    if (!showReservationModal || !selectedRange) return null

    const room = rooms.find((r) => r._id === selectedRange.roomId)
    const startDate = dates[selectedRange.startDate]
    const endDate = new Date(dates[selectedRange.endDate])
    endDate.setDate(endDate.getDate() + 1)
    const nights = selectedRange.endDate - selectedRange.startDate + 1

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/20">
          <h3 className="text-2xl font-bold  mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create New Reservation
          </h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Room:</span>
              <span className="font-bold text-slate-800">{room?.roomId}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Category:</span>
              <span className="font-bold text-slate-800">{room?.category?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Check-in:</span>
              <span className="font-bold text-slate-800">{startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Check-out:</span>
              <span className="font-bold text-slate-800">{endDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <span className="text-slate-600 font-medium">Duration:</span>
              <span className="font-bold text-indigo-700">
                {nights} {nights === 1 ? "night" : "nights"}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleReservationRedirect}
              className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Proceed to Reservation
            </button>
            <button
              onClick={() => {
                setShowReservationModal(false)
                clearSelection()
              }}
              className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-xl hover:from-slate-600 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced statistics cards with horizontal layout
  const renderStatisticsCards = () => {
    const stats = memoizedOverallStatistics

    return (
      <div className="mb-2">
        <div className="flex gap-4">
          {/* Available Rooms Card */}
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl p-3 flex items-center gap-2 min-w-[160px]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-3 w-full">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Home size={18} className="text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Available:</span>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {stats.remainingAvailable}
                </span>
              </div>
            </div>
          </div>
          
          {/* Booked Rooms Card */}
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl p-3 flex items-center gap-2 min-w-[140px]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-3 w-full">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <Users size={18} className="text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Booked:</span>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.booked}
                </span>
              </div>
            </div>
          </div>
          
          {/* Occupancy Card */}
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl p-3 flex items-center gap-2 min-w-[160px]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-3 w-full">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                <Percent size={18} className="text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Occupancy:</span>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.occupancyPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl animate-pulse flex items-center justify-center">
              <Calendar size={40} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
            <div
              className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="absolute top-1 -left-4 w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
              Loading Calendar
            </h3>
            <p className="text-slate-600 text-lg">Fetching room availability and bookings...</p>
          </div>
          <div className="flex space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-200"
      onMouseMove={handleMouseMove}
    >
      <div className="w-full max-w-none mx-auto p-2">
        {/* Enhanced Statistics Cards */}
        {renderStatisticsCards()}

        {/* Main Calendar Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Enhanced Header with reduced padding */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
            <button
              onClick={() => navigateCalendar("prev")}
              className="cursor-pointer group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              disabled={currentDate <= new Date()}
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
              Previous 14 Days
            </button>

            <div className="text-center">
              <div className="text-sm text-blue-100 mt-1">
                {formatDate(dates[0]).month} {dates[0].getFullYear()} - {formatDate(dates[13]).month}{" "}
                {dates[13].getFullYear()}
              </div>
            </div>

            <button
              onClick={() => navigateCalendar("next")}
              className="cursor-pointer group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-xl transition-all duration-300 font-medium hover:scale-105"
            >
              Next 14 Days
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Enhanced Calendar Grid */}
          <div className="border-t border-white/20 overflow-y-auto max-h-[75vh]">
            <div className="min-w-fit relative">
              {/* Enhanced Total Available Inventory Row with reduced padding and width */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-800 text-white border-b border-slate-600 z-30">
                <div className="grid grid-cols-[220px_repeat(14,minmax(90px,1fr))]">
                  <div className="font-bold p-2 border-r border-slate-600 text-sm bg-gradient-to-r from-slate-800 to-slate-700">
                    <div className="flex items-center gap-2">
                      <Home size={14} />
                      <span className="text-xs">Total Available</span>
                    </div>
                  </div>
                  {dates.map((date, index) => {
                    const dateStr = date.toISOString().split("T")[0]
                    const bookedRooms = rooms.filter((room) => {
                      return bookings.some((booking) => {
                        if (booking.status === "cancelled") return false
                        const checkInStr = booking.bookingSummary.checkInDate.split("T")[0]
                        const checkOutStr = booking.bookingSummary.checkOutDate.split("T")[0]
                        const isWithinRange = dateStr >= checkInStr && dateStr <= checkOutStr
                        const isRoomBooked = booking.roomDetails.some(
                          (roomDetail) => roomDetail.roomInfo.roomId === room._id,
                        )
                        return isWithinRange && isRoomBooked
                      })
                    }).length

                    const availableRooms = rooms.filter((room) => room.isAvailable).length - bookedRooms

                    return (
                      <div
                        key={index}
                        className={`text-center p-2 font-bold border-r border-slate-600 text-sm ${index === 13 ? "border-r-0" : ""} bg-gradient-to-b from-emerald-500 to-emerald-600 text-white`}
                      >
                        {Math.max(0, availableRooms)}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Enhanced Date Headers with updated sticky position and reduced padding */}
              <div className=" top-[20px] z-20 grid grid-cols-[220px_repeat(14,minmax(90px,1fr))] bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
                <div className="font-bold text-slate-800 p-2 border-r border-slate-300 text-xs bg-gradient-to-r from-slate-200 to-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    Room Details
                  </div>
                </div>
                {dates.map((date, index) => {
                  const dateInfo = formatDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={index}
                      className={`text-center p-2 text-slate-800 border-r border-slate-300 ${index === 13 ? "border-r-0" : ""} ${isToday
                        ? "bg-gradient-to-b from-indigo-100 to-indigo-200 border-indigo-300"
                        : "bg-gradient-to-b from-slate-100 to-slate-200"
                        }`}
                    >
                      <div className={`text-xs font-semibold ${isToday ? "text-indigo-700" : "text-slate-600"}`}>
                        {dateInfo.weekday}
                      </div>
                      <div className={`text-sm font-bold ${isToday ? "text-indigo-800" : "text-slate-800"}`}>
                        {dateInfo.day}
                      </div>
                      <div className={`text-xs ${isToday ? "text-indigo-600" : "text-slate-500"}`}>
                        {dateInfo.month}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Enhanced Scrollable Rooms Grid */}
              <div>
                {memoizedGroupedRooms.map((category, categoryIndex) => (
                  <div key={category._id}>
                    {/* Enhanced Category Header with reduced padding */}
                    <div
                      className={`bg-gradient-to-r from-slate-200 to-slate-300 grid grid-cols-[220px_repeat(14,minmax(90px,1fr))] border-t border-slate-300 ${categoryIndex === 0 ? "border-t-0" : ""}`}
                    >
                      <div className="px-3 py-2 font-bold text-slate-800 border-r border-slate-300 text-xs flex items-center gap-2 capitalize">
                        <button
                          onClick={() => toggleCategoryCollapse(category._id)}
                          className="p-1 hover:bg-slate-300 rounded-lg transition-all duration-300 hover:scale-110"
                        >
                          {collapsedCategories[category._id] ? <Plus size={14} /> : <Minus size={14} />}
                        </button>
                        <div className="flex items-center gap-2">
                          {category.name}
                          <span className="text-xs bg-slate-400 text-white px-2 py-1 rounded-full">
                            {category.rooms.length}
                          </span>
                        </div>
                      </div>
                      {dates.map((date, index) => (
                        <div
                          key={index}
                          className={`border-r border-slate-300 ${index === 13 ? "border-r-0" : ""}`}
                        ></div>
                      ))}
                    </div>

                    {/* Enhanced Rooms in Category with reduced padding */}
                    {!collapsedCategories[category._id] &&
                      category.rooms.map((room, roomIndex) => (
                        <div
                          key={room._id}
                          className={`grid grid-cols-[220px_repeat(14,minmax(90px,1fr))] hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-t border-slate-200 relative transition-all duration-300 ${roomIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                            }`}
                        >
                          {/* Enhanced Room Info with reduced padding */}
                          <div className="flex items-center p-2 border-r border-slate-200">
                            <div className="flex items-center gap-2 w-full ml-6">
                              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
                              <div className="flex-1">
                                <div className="font-semibold text-slate-800 text-xs">{room.roomId}</div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Booking status for each date */}
                          {dates.map((date, dateIndex) => {
                            const lookupKey = `${room._id}-${dateIndex}`
                            const { displayBooking, coveredByBooking } = memoizedBookingLookup[lookupKey] || {}

                            return (
                              <div
                                key={dateIndex}
                                className={`text-center p-2 border-r border-slate-200 relative cursor-pointer select-none transition-all duration-300 ${dateIndex === 13 ? "border-r-0" : ""
                                  } ${selectedRange &&
                                    selectedRange.roomId === room._id &&
                                    dateIndex >= selectedRange.startDate &&
                                    dateIndex <= selectedRange.endDate
                                    ? "bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300"
                                    : "hover:bg-slate-100"
                                  }`}
                                onMouseDown={(e) => handleDateSelectionStart(room._id, dateIndex, e)}
                                onMouseEnter={() => handleDateSelectionMove(room._id, dateIndex)}
                              >
                                {displayBooking ? (
                                  <div
                                    className={`absolute top-3 left-3 h-6 ${getBookingStatusColor(displayBooking.status)} rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300 flex items-center justify-center z-10 shadow-lg hover:shadow-xl hover:scale-105`}
                                    style={{
                                      width: `calc(${getRoomBookingSpan(room._id, dateIndex, displayBooking) * 100}% - ${getRoomBookingSpan(room._id, dateIndex, displayBooking) * 0.5 + 1.5}rem)`,
                                      minWidth: "60px",
                                    }}
                                    onMouseEnter={() => setHoveredBooking(displayBooking)}
                                    onMouseLeave={() => setHoveredBooking(null)}
                                  >
                                    <div className="text-xs font-semibold text-white truncate px-2 whitespace-nowrap">
                                      {getBookingDisplayLabel(displayBooking)}
                                    </div>
                                  </div>
                                ) : !coveredByBooking ? (
                                  <>
                                    {/* Enhanced Selection overlay */}
                                    {selectedRange &&
                                      selectedRange.roomId === room._id &&
                                      dateIndex >= selectedRange.startDate &&
                                      dateIndex <= selectedRange.endDate && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-purple-200 opacity-60 rounded-lg"></div>
                                      )}
                                    <div className="w-full h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors duration-300">
                                      <div className="text-xs font-medium">Available</div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-8"></div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Booking Tooltip */}
      {renderTooltip()}

      {/* Enhanced Selection Toolbar */}
      {renderSelectionToolbar()}

      {/* Enhanced Reservation Confirmation Modal */}
      {renderReservationModal()}
    </div>
  )
}
