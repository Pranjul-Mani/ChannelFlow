"use client"

import React, { useState, useEffect } from "react"
import { Eye, Edit } from "lucide-react"

const Inventory = ({ roomTypes, selectedDate, setSelectedDate }) => {
  // State to manage room data with editable prices
  const [rooms, setRooms] = useState([])

  // Initialize rooms data when roomTypes prop changes
  useEffect(() => {
    const initialRooms = roomTypes.map(room => ({
      ...room,
      basePrice: room.price,
      agodaPrice: room.price + 10,
      makeMyTripPrice: room.price + 5,
      bookingPrice: room.price + 8,
      expediaPrice: room.price + 12
    }))
    setRooms(initialRooms)
  }, [roomTypes])

  // Handler to update room data
  const updateRoom = (roomId, field, value) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? { ...room, [field]: parseFloat(value) || 0 }
          : room
      )
    )
  }

  // Handler to save changes
  const handleSaveChanges = () => {
    console.log('Saving changes:', rooms)
    // Here you would typically send the data to your backend
    alert('Changes saved successfully!')
  }

  // Handler for bulk update
  const handleBulkUpdate = () => {
    // You can implement bulk update logic here
    console.log('Bulk update triggered for date:', selectedDate)
    alert('Bulk update feature - implementation needed')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Room Inventory Management</h3>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button 
              onClick={handleBulkUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
            >
              Bulk Update
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Room Type</th>
                <th className="text-left py-3 px-4">Available</th>
                <th className="text-left py-3 px-4">Base Price</th>
                <th className="text-left py-3 px-4">Agoda</th>
                <th className="text-left py-3 px-4">MakeMyTrip</th>
                <th className="text-left py-3 px-4">Booking.com</th>
                <th className="text-left py-3 px-4">Expedia</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium">{room.name}</td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={room.inventory}
                      onChange={(e) => updateRoom(room.id, 'inventory', e.target.value)}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={room.basePrice}
                      onChange={(e) => updateRoom(room.id, 'basePrice', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={room.agodaPrice}
                      onChange={(e) => updateRoom(room.id, 'agodaPrice', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={room.makeMyTripPrice}
                      onChange={(e) => updateRoom(room.id, 'makeMyTripPrice', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={room.bookingPrice}
                      onChange={(e) => updateRoom(room.id, 'bookingPrice', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={room.expediaPrice}
                      onChange={(e) => updateRoom(room.id, 'expediaPrice', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                        title="Edit room details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                        title="View room details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSaveChanges}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default Inventory;