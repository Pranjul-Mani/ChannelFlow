import { DollarSign, Users, TrendingUp, Wifi, CheckCircle, AlertCircle } from "lucide-react"

const Dashboard = ({ channels }) => {
  const totalBookings = channels.reduce((sum, channel) => sum + channel.bookings, 0)
  const totalRevenue = channels.reduce((sum, channel) => sum + channel.revenue, 0)
  const avgOccupancy = Math.round(
    channels.filter((c) => c.status === "connected").reduce((sum, channel) => sum + channel.occupancy, 0) /
      channels.filter((c) => c.status === "connected").length,
  )

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">+12% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">+8% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Occupancy</p>
              <p className="text-3xl font-bold text-gray-900">{avgOccupancy}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-sm text-red-600 mt-2">-2% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Channels</p>
              <p className="text-3xl font-bold text-gray-900">
                {channels.filter((c) => c.status === "connected").length}
              </p>
            </div>
            <Wifi className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-sm text-gray-600 mt-2">of {channels.length} total</p>
        </div>
      </div>

      {/* Channel Status Cards */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="border rounded-lg p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${channel.color}`}></div>
                  <h4 className="font-medium text-gray-900">{channel.name}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  {channel.status === "connected" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      channel.status === "connected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {channel.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bookings:</span>
                  <span className="font-medium">{channel.bookings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">${channel.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupancy:</span>
                  <span className="font-medium">{channel.occupancy}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last sync:</span>
                  <span>{channel.lastSync}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
