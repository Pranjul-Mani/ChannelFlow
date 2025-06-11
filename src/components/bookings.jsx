const Bookings = () => {
  const bookingsData = [
    {
      id: "AGD001",
      guest: "John Smith",
      channel: "Agoda",
      room: "Deluxe Room",
      checkin: "2024-12-15",
      checkout: "2024-12-17",
      amount: 240,
      status: "Confirmed",
    },
    {
      id: "MMT002",
      guest: "Priya Sharma",
      channel: "MakeMyTrip",
      room: "Suite",
      checkin: "2024-12-16",
      checkout: "2024-12-18",
      amount: 400,
      status: "Confirmed",
    },
    {
      id: "BDC003",
      guest: "Michael Johnson",
      channel: "Booking.com",
      room: "Standard Room",
      checkin: "2024-12-14",
      checkout: "2024-12-16",
      amount: 160,
      status: "Checked-in",
    },
    {
      id: "EXP004",
      guest: "Sarah Wilson",
      channel: "Expedia",
      room: "Deluxe Room",
      checkin: "2024-12-17",
      checkout: "2024-12-19",
      amount: 250,
      status: "Pending",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>All Channels</option>
              <option>Agoda</option>
              <option>MakeMyTrip</option>
              <option>Booking.com</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Booking ID</th>
                <th className="text-left py-3 px-4">Guest Name</th>
                <th className="text-left py-3 px-4">Channel</th>
                <th className="text-left py-3 px-4">Room Type</th>
                <th className="text-left py-3 px-4">Check-in</th>
                <th className="text-left py-3 px-4">Check-out</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.map((booking, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-blue-600">{booking.id}</td>
                  <td className="py-4 px-4">{booking.guest}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.channel === "Agoda"
                          ? "bg-blue-100 text-blue-800"
                          : booking.channel === "MakeMyTrip"
                            ? "bg-red-100 text-red-800"
                            : booking.channel === "Booking.com"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.channel}
                    </span>
                  </td>
                  <td className="py-4 px-4">{booking.room}</td>
                  <td className="py-4 px-4">{booking.checkin}</td>
                  <td className="py-4 px-4">{booking.checkout}</td>
                  <td className="py-4 px-4 font-medium">${booking.amount}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "Checked-in"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Bookings
