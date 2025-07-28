"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ArrowDown, ArrowUp, BedDouble, Users, Calendar, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const [arrivalData, setArrivalData] = useState({
    pending: 0,
    arrived: 0,
    total: 0,
  })

  const [departureData, setDepartureData] = useState({
    pending: 0,
    checkedOut: 0,
    total: 0,
  })

  const [guestData, setGuestData] = useState({
    adult: 0,
    child: 0,
    total: 0,
  })

  const [roomStatusData, setRoomStatusData] = useState([
    { name: "Vacant", value: 0, color: "#10b981" },
    { name: "Sold", value: 0, color: "#f59e0b" },
  ])

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Function to get today's date range
  const getTodayDateRange = () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    return {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    }
  }

  // Function to fetch rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/room")
      const data = await res.json()
      console.log("rooms", data)
      if (data.success) {
        setRooms(data.data || [])
        return data.data || []
      } else {
        setError(data.error || "Failed to load rooms")
        return []
      }
    } catch (err) {
      setError("Failed to load rooms")
      return []
    }
  }

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      const { startOfDay, endOfDay } = getTodayDateRange()

      // Fetch rooms and bookings concurrently
      const [roomsData, bookingsResponse] = await Promise.all([fetchRooms(), fetch("/api/bookings")])

      const bookingsData = await bookingsResponse.json()
      if (bookingsData.success) {
        const bookings = bookingsData.bookings

        // Calculate today's arrivals (check-in date is today)
        const todayArrivals = bookings.filter((booking) => {
          const checkInDate = new Date(booking.bookingSummary.checkInDate)
          const today = new Date()
          return checkInDate.toDateString() === today.toDateString()
        })

        const arrivedCount = todayArrivals.filter(
          (booking) => booking.status === "checked-in" || booking.status === "confirmed",
        ).length

        const pendingArrivals = todayArrivals.filter((booking) => booking.status === "pending").length

        setArrivalData({
          pending: pendingArrivals,
          arrived: arrivedCount,
          total: todayArrivals.length,
        })

        // Calculate today's departures (check-out date is today)
        const todayDepartures = bookings.filter((booking) => {
          const checkOutDate = new Date(booking.bookingSummary.checkOutDate)
          const today = new Date()
          return checkOutDate.toDateString() === today.toDateString()
        })

        const checkedOutCount = todayDepartures.filter((booking) => booking.status === "checked-out").length

        const pendingDepartures = todayDepartures.filter(
          (booking) => booking.status === "checked-in" || booking.status === "confirmed",
        ).length

        setDepartureData({
          pending: pendingDepartures,
          checkedOut: checkedOutCount,
          total: todayDepartures.length,
        })

        // Calculate current guests in house (from all booked rooms)
        const currentGuests = bookings.filter((booking) => {
          const checkInDate = new Date(booking.bookingSummary.checkInDate)
          const checkOutDate = new Date(booking.bookingSummary.checkOutDate)
          const today = new Date()
          return (
            (booking.status === "checked-in" || booking.status === "confirmed") &&
            checkInDate <= today &&
            checkOutDate > today
          )
        })

        let totalAdults = 0
        let totalChildren = 0

        currentGuests.forEach((booking) => {
          booking.guestInformation.guests.forEach((guest) => {
            if (guest.age >= 18) {
              totalAdults++
            } else {
              totalChildren++
            }
          })
        })

        setGuestData({
          adult: totalAdults,
          child: totalChildren,
          total: totalAdults + totalChildren,
        })

        // Calculate room status using fetched rooms data
        const availableRooms = roomsData.filter((room) => room.isAvailable).length
        const unavailableRooms = roomsData.length - availableRooms

        setRoomStatusData([
          { name: "Vacant", value: availableRooms, color: "#10b981" },
          { name: "Sold", value: unavailableRooms, color: "#f59e0b" },
        ])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData()
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const totalRooms = roomStatusData.reduce((sum, item) => sum + item.value, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <div className="text-slate-600 font-medium">Loading dashboard data...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
              <div className="text-red-600 font-semibold text-center">Error: {error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100/20 sticky top-0 z-10 mt-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-800 mt-1">
                <Calendar className="inline h-4 w-4 mr-2" />
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </div>
            </button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 grid-cols-1 md:grid-cols-6 lg:grid-cols-4">
          {/* Today's Arrival Card */}
          <Card className="group relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      <ArrowDown className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-700">Today's Arrivals</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                  {arrivalData.total}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-600">{arrivalData.arrived} Arrived</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Today's Departure Card */}
          <Card className="group relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <ArrowUp className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-700">Today's Departures</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  {departureData.total}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-600">{departureData.checkedOut} Checked Out</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Guest In House Card */}
          <Card className="group relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-700">Total Guests</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                  {guestData.total}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-600">{guestData.adult} Adults</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-600">{guestData.child} Children</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Room Status Card */}
          <Card className="group relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                      <BedDouble className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-700">Room Status</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-4">
                  {/* Enhanced Pie Chart */}
                  <div className="h-[90px] w-[90px] flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roomStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {roomStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} rooms (${totalRooms > 0 ? ((value / totalRooms) * 100).toFixed(1) : 0}%)`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            backdropFilter: "blur(10px)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-700">{totalRooms}</div>
                        <div className="text-xs text-slate-500">Total</div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Status Labels */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                        <span className="text-xs font-semibold text-emerald-700">Vacant</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-800">{roomStatusData[0].value}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                        <span className="text-xs font-semibold text-amber-700">Occupied</span>
                      </div>
                      <span className="text-sm font-bold text-amber-800">{roomStatusData[1].value}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
