const CalendarView = () => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Generate calendar dates
  const datesInView = []
  for (let i = 0; i < 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    datesInView.push(date)
  }

  const roomsData = [
    {
      category: "Family Room",
      rooms: [
        {
          id: "Room 1",
          bookings: [
            { guest: "Virat", start: 0, duration: 2, status: "confirmed", channel: "Agoda" },
            { guest: "Rohit", start: 8, duration: 6, status: "confirmed", channel: "Booking.com" },
          ],
        },
        {
          id: "Room 2",
          bookings: [
            { guest: "Gopal", start: 1, duration: 5, status: "confirmed", channel: "MakeMyTrip" },
            { guest: "Ram", start: 9, duration: 5, status: "confirmed", channel: "Expedia" },
          ],
        },
        {
          id: "Room 3",
          bookings: [
            { guest: "Rohit", start: 0, duration: 3, status: "confirmed", channel: "Agoda" },
            { guest: "Rohan", start: 4, duration: 7, status: "confirmed", channel: "Booking.com" },
          ],
        },
        {
          id: "Room 4",
          bookings: [
            { guest: "Mohit", start: 0, duration: 2, status: "checkedin", channel: "Agoda" },
            { guest: "Prince", start: 2, duration: 3, status: "confirmed", channel: "MakeMyTrip" },
            { guest: "Den", start: 5, duration: 9, status: "confirmed", channel: "Booking.com" },
          ],
        },
        {
          id: "Room 5",
          bookings: [{ guest: "Mohit", start: 1, duration: 5, status: "confirmed", channel: "Expedia" }],
        },
        { id: "Room 6", bookings: [] },
        {
          id: "Room 7",
          bookings: [{ guest: "Unallocated", start: 6, duration: 3, status: "unallocated", channel: "Various" }],
        },
        { id: "Room 8", bookings: [] },
      ],
    },
    {
      category: "Queen Room",
      rooms: [
        {
          id: "Room 9",
          bookings: [{ guest: "Jay", start: 2, duration: 4, status: "confirmed", channel: "Agoda" }],
        },
        {
          id: "Room 10",
          bookings: [{ guest: "William", start: 5, duration: 3, status: "incomplete", channel: "MakeMyTrip" }],
        },
      ],
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-orange-400 text-white"
      case "checkedin":
        return "bg-green-500 text-white"
      case "checkedout":
        return "bg-gray-400 text-white"
      case "roomclosure":
        return "bg-red-600 text-white"
      case "unallocated":
        return "bg-blue-300 text-white"
      case "incomplete":
        return "bg-purple-400 text-white"
      default:
        return "bg-gray-300 text-gray-700"
    }
  }

  const formatDate = (date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    return {
      day: days[date.getDay()],
      date: date.getDate().toString().padStart(2, "0"),
      month: months[date.getMonth()],
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Calendar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Room Calendar</h3>
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>14 days</option>
                <option>7 days</option>
                <option>30 days</option>
              </select>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                View today
              </button>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded">‹‹</button>
                <button className="p-2 hover:bg-gray-100 rounded">‹</button>
                <span className="px-4 py-2 bg-gray-100 rounded text-sm font-medium">
                  {formatDate(today).date} {formatDate(today).month} {currentYear}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded">›</button>
                <button className="p-2 hover:bg-gray-100 rounded">››</button>
              </div>
              <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">Room closure</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
                + Reservation
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Date Headers */}
            <div className="flex border-b border-gray-200">
              <div className="w-32 p-3 bg-gray-50 font-medium text-sm text-gray-700 border-r border-gray-200">
                Rooms
              </div>
              {datesInView.map((date, index) => {
                const formatted = formatDate(date)
                const isToday = date.toDateString() === today.toDateString()
                return (
                  <div
                    key={index}
                    className={`min-w-24 p-3 text-center text-xs font-medium border-r border-gray-200 ${
                      isToday ? "bg-orange-100 text-orange-800" : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className={isToday ? "font-bold" : ""}>{formatted.day}</div>
                    <div className={`text-lg ${isToday ? "font-bold" : ""}`}>{formatted.date}</div>
                    <div className={isToday ? "font-bold" : ""}>{formatted.month}</div>
                  </div>
                )
              })}
            </div>

            {/* Room Categories and Bookings */}
            {roomsData.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {/* Category Header */}
                <div className="flex border-b border-gray-200 bg-blue-50">
                  <div className="w-32 p-3 font-medium text-sm text-blue-800 border-r border-gray-200 flex items-center">
                    <span className="mr-2">▼</span>
                    {category.category}
                  </div>
                  <div className="flex-1"></div>
                </div>

                {/* Room Rows */}
                {category.rooms.map((room, roomIndex) => (
                  <div key={roomIndex} className="flex border-b border-gray-100 hover:bg-gray-50">
                    <div className="w-32 p-3 text-sm text-gray-700 border-r border-gray-200 font-medium">{room.id}</div>
                    <div className="flex flex-1 relative">
                      {datesInView.map((date, dateIndex) => (
                        <div key={dateIndex} className="min-w-24 h-12 border-r border-gray-200 relative bg-white">
                          {/* Check if there's a booking for this date */}
                          {room.bookings.map((booking, bookingIndex) => {
                            if (dateIndex >= booking.start && dateIndex < booking.start + booking.duration) {
                              const isFirstDay = dateIndex === booking.start
                              const isLastDay = dateIndex === booking.start + booking.duration - 1
                              return (
                                <div
                                  key={bookingIndex}
                                  className={`absolute inset-1 ${getStatusColor(booking.status)} rounded-sm flex items-center justify-center text-xs font-medium ${
                                    isFirstDay ? "rounded-l-md" : ""
                                  } ${isLastDay ? "rounded-r-md" : ""}`}
                                >
                                  {isFirstDay && (
                                    <span className="truncate px-1 flex items-center">
                                      <span className="w-2 h-2 bg-white bg-opacity-70 rounded-full mr-1"></span>
                                      {booking.guest}
                                    </span>
                                  )}
                                </div>
                              )
                            }
                            return null
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Checked in</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Checked out</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>Room closure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <span>Unallocated</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-400 rounded"></div>
              <span>Incomplete payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
