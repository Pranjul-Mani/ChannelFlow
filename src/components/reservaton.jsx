"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, User, DollarSign, Clock, Users, Edit } from "lucide-react"

const WalkInReservation = ({ isActiveTab = true }) => {
  const [categories, setCategories] = useState([])
  const [availableRooms, setAvailableRooms] = useState({})
  const [allRooms, setAllRooms] = useState([]) // Add this to store all rooms
  const [loading, setLoading] = useState(false)
  const [selectedRooms, setSelectedRooms] = useState([
    {
      id: Date.now(),
      categoryId: "",
      rateType: "", // Added rateType
      roomId: "",
      adults: 2,
      children: 1,
      customPrice: null,
    },
  ])
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [guests, setGuests] = useState([{ name: "", age: "", phone: "", email: "", assignedRoom: "" }])
  const [totalAmount, setTotalAmount] = useState(0)
  const [editingPrice, setEditingPrice] = useState(null)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Mock rate types for demonstration
  const rateTypes = [
    { value: "standard", label: "Standard Rate" },
    { value: "flexible", label: "Flexible Rate" },
    { value: "non-refundable", label: "Non-Refundable" },
  ]

  // Load categories and rooms on component mount
  useEffect(() => {
    if (isActiveTab) {
      fetchCategories()
      fetchAllRooms() // Fetch all rooms as fallback
    }
  }, [isActiveTab])

  // Load available rooms when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && categories.length > 0) {
      fetchAllAvailableRooms()
    }
  }, [checkInDate, checkOutDate, categories])

  // Calculate total amount when rooms change
  useEffect(() => {
    calculateTotal()
  }, [selectedRooms, checkInDate, checkOutDate])

  const fetchCategories = async () => {
    try {
      // For demo purposes, let's simulate both API call and fallback
      try {
        const response = await fetch("/api/category")
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        console.log("Fetched categories from API:", data)
        setCategories(data)
      } catch (apiError) {
        console.warn("API call failed, using mock data:", apiError)
        // Mock categories data as fallback
        const mockCategories = [
          { _id: "1", name: "deluxe (ac)" },
          { _id: "2", name: "executive suite with balcony" },
          { _id: "3", name: "bunk room / dormitory" },
          { _id: "4", name: "standard" },
          { _id: "5", name: "deluxe (non-ac)" },
          { _id: "6", name: "family suite" },
        ]
        setCategories(mockCategories)
      }
    } catch (error) {
      console.error("Error in fetchCategories:", error)
    }
  }

  const fetchAllRooms = async () => {
    try {
      const response = await fetch("/api/room")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      const roomsArray = data.data || data || []
      setAllRooms(Array.isArray(roomsArray) ? roomsArray : [])
    } catch (error) {
      console.warn("Failed to fetch all rooms, using mock data:", error)
      // Mock rooms data as fallback
      const mockRooms = [
        {
          _id: "room1",
          roomId: "101",
          category: { _id: "1", name: "deluxe (ac)" },
          price: 2500,
          bed: 2,
          isAvailable: true,
        },
        {
          _id: "room2",
          roomId: "102",
          category: { _id: "1", name: "deluxe (ac)" },
          price: 2500,
          bed: 2,
          isAvailable: true,
        },
        {
          _id: "room3",
          roomId: "201",
          category: { _id: "2", name: "executive suite with balcony" },
          price: 4000,
          bed: 3,
          isAvailable: true,
        },
        {
          _id: "room4",
          roomId: "202",
          category: { _id: "2", name: "executive suite with balcony" },
          price: 4000,
          bed: 3,
          isAvailable: true,
        },
        {
          _id: "room5",
          roomId: "301",
          category: { _id: "3", name: "bunk room / dormitory" },
          price: 800,
          bed: 4,
          isAvailable: true,
        },
        {
          _id: "room6",
          roomId: "302",
          category: { _id: "3", name: "bunk room / dormitory" },
          price: 800,
          bed: 4,
          isAvailable: true,
        },
        {
          _id: "room7",
          roomId: "401",
          category: { _id: "4", name: "standard" },
          price: 1500,
          bed: 2,
          isAvailable: true,
        },
        {
          _id: "room8",
          roomId: "402",
          category: { _id: "4", name: "standard" },
          price: 1500,
          bed: 2,
          isAvailable: true,
        },
        {
          _id: "room9",
          roomId: "501",
          category: { _id: "5", name: "deluxe (non-ac)" },
          price: 2000,
          bed: 2,
          isAvailable: true,
        },
        {
          _id: "room10",
          roomId: "502",
          category: { _id: "5", name: "deluxe (non-ac)" },
          price: 2000,
          bed: 2,
          isAvailable: true,
        },
        {
          _id: "room11",
          roomId: "601",
          category: { _id: "6", name: "family suite" },
          price: 5000,
          bed: 4,
          isAvailable: true,
        },
        {
          _id: "room12",
          roomId: "602",
          category: { _id: "6", name: "family suite" },
          price: 5000,
          bed: 4,
          isAvailable: true,
        },
      ]
      setAllRooms(mockRooms)
    }
  }

  const fetchAllAvailableRooms = async () => {
    try {
      setLoading(true)
      const roomsData = {}
      for (const category of categories) {
        try {
          const response = await fetch(
            `/api/room/available?category=${category._id}&checkIn=${checkInDate}&checkOut=${checkOutDate}`,
          )
          if (response.ok) {
            const data = await response.json()
            roomsData[category._id] = data.rooms || []
          } else {
            throw new Error(`API failed for category ${category._id}`)
          }
        } catch (error) {
          console.warn(`Failed to fetch rooms for category ${category._id}:`, error)
          // Fallback: filter all rooms by category and availability
          const categoryRooms = allRooms.filter((room) => {
            const roomCategoryId = room.category?._id || room.category
            return roomCategoryId === category._id && room.isAvailable
          })
          roomsData[category._id] = categoryRooms
        }
      }
      setAvailableRooms(roomsData)
    } catch (error) {
      console.error("Error fetching available rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || selectedRooms.length === 0) {
      setTotalAmount(0)
      return
    }
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24),
    )
    const total = selectedRooms.reduce((sum, roomSelection) => {
      const room = getRoomById(roomSelection.roomId)
      if (!room) return sum
      let finalPrice
      if (roomSelection.customPrice !== null && roomSelection.customPrice !== undefined) {
        finalPrice = Number.parseFloat(roomSelection.customPrice)
      } else {
        finalPrice = Number.parseFloat(room.price)
      }
      if (isNaN(finalPrice)) {
        finalPrice = Number.parseFloat(room.price) || 0
      }
      return sum + finalPrice * nights
    }, 0)
    setTotalAmount(total)
  }

  const getRoomById = (roomId) => {
    for (const categoryRooms of Object.values(availableRooms)) {
      const room = categoryRooms.find((r) => r._id === roomId)
      if (room) return room
    }
    return null
  }

  const getCategoryById = (categoryId) => {
    return categories.find((c) => c._id === categoryId)
  }

  const getAvailableRoomsForCategory = (categoryId, currentRoomId = null) => {
    if (!availableRooms[categoryId]) return []
    const selectedRoomIds = selectedRooms.map((r) => r.roomId).filter((roomId) => roomId !== currentRoomId)
    return availableRooms[categoryId].filter((room) => !selectedRoomIds.includes(room._id))
  }

  const getAvailableRoomCount = (categoryId) => {
    if (!availableRooms[categoryId]) return 0
    const selectedRoomIds = selectedRooms.map((r) => r.roomId)
    return availableRooms[categoryId].filter((room) => !selectedRoomIds.includes(room._id)).length
  }

  const addRoom = () => {
    setSelectedRooms([
      ...selectedRooms,
      {
        id: Date.now(),
        categoryId: "",
        rateType: "",
        roomId: "",
        adults: 2,
        children: 1,
        customPrice: null,
      },
    ])
  }

  const removeRoom = (roomIndex) => {
    setSelectedRooms(selectedRooms.filter((_, index) => index !== roomIndex))
  }

  const updateRoom = (roomIndex, field, value) => {
    const updatedRooms = [...selectedRooms]
    updatedRooms[roomIndex][field] = value
    if (field === "categoryId") {
      updatedRooms[roomIndex].rateType = ""
      updatedRooms[roomIndex].roomId = ""
      updatedRooms[roomIndex].adults = 2
      updatedRooms[roomIndex].children = 1
      updatedRooms[roomIndex].customPrice = null
    }
    if (field === "rateType") {
      updatedRooms[roomIndex].roomId = ""
      updatedRooms[roomIndex].adults = 2
      updatedRooms[roomIndex].children = 1
      updatedRooms[roomIndex].customPrice = null
    }
    if (field === "roomId") {
      const room = getRoomById(value)
      if (room) {
        const maxBeds = Number.parseInt(room.bed) || 1
        updatedRooms[roomIndex].adults = Math.min(updatedRooms[roomIndex].adults, maxBeds)
        updatedRooms[roomIndex].children = Math.max(0, Math.min(updatedRooms[roomIndex].children, maxBeds - 1))
      }
    }
    setSelectedRooms(updatedRooms)
  }

  const handlePriceEdit = (roomIndex) => setEditingPrice(roomIndex)

  const handlePriceChange = (roomIndex, newValue) => {
    setSelectedRooms((prev) => {
      const updated = [...prev]
      let customPrice = null
      if (newValue !== "" && newValue !== null && newValue !== undefined) {
        const parsedValue = Number.parseFloat(newValue)
        if (!isNaN(parsedValue) && parsedValue >= 0) {
          customPrice = parsedValue
        }
      }
      updated[roomIndex] = {
        ...updated[roomIndex],
        customPrice: customPrice,
      }
      return updated
    })
  }

  const handlePriceSave = () => setEditingPrice(null)

  const getMaxAdults = (roomId) => {
    const room = getRoomById(roomId)
    return Number.parseInt(room?.bed) || 2
  }

  const getMaxChildren = (roomId) => {
    const maxAdults = getMaxAdults(roomId)
    return Math.max(0, maxAdults - 1)
  }

  const addGuest = () => {
    setGuests([...guests, { name: "", age: "", phone: "", email: "", assignedRoom: "" }])
  }

  const removeGuest = (guestIndex) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, index) => index !== guestIndex))
    }
  }

  const updateGuest = (guestIndex, field, value) => {
    const updatedGuests = [...guests]
    updatedGuests[guestIndex][field] = value
    setGuests(updatedGuests)
  }

  const handleSubmit = async () => {
    if (selectedRooms.length === 0) {
      alert("Please select at least one room")
      return
    }
    const incompleteRooms = selectedRooms.filter((room) => !room.categoryId || !room.rateType || !room.roomId)
    if (incompleteRooms.length > 0) {
      alert("Please complete all room selections")
      return
    }
    const validGuests = guests.filter((guest) => guest.name.trim() && guest.age)
    if (validGuests.length === 0) {
      alert("Please add at least one guest with name and age")
      return
    }

    setLoading(true)
    try {
      const bookingData = {
        rooms: selectedRooms.map((room) => ({
          roomId: room.roomId,
          rateType: room.rateType,
          adults: room.adults,
          children: room.children,
          customPrice:
            room.customPrice !== null && room.customPrice !== undefined ? Number.parseFloat(room.customPrice) : null,
        })),
        checkInDate,
        checkOutDate,
        personDetails: validGuests.map((guest) => ({
          name: guest.name,
          age: Number.parseInt(guest.age),
          phone: guest.phone,
          email: guest.email,
          assignedRoom: guest.assignedRoom,
        })),
        totalAmount, // This should match backend calculation now
        source: "walk-in",
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()
      if (data.success) {
        alert(`Booking created successfully! ref: ${data.bookingId}`)
        // Reset form
        setSelectedRooms([
          {
            id: Date.now(),
            categoryId: "",
            rateType: "",
            roomId: "",
            adults: 2,
            children: 1,
            customPrice: null,
          },
        ])
        setGuests([{ name: "", age: "", phone: "", email: "", assignedRoom: "" }])
        setCheckInDate("")
        setCheckOutDate("")
        setTotalAmount(0)
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  const nights =
    checkInDate && checkOutDate
      ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0

  const completeSelectedRooms = selectedRooms.filter((room) => room.categoryId && room.rateType && room.roomId)

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-200">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Walk-in Reservation</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="space-y-2">
              {/* Booking Information */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={today}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || today}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">Room Selection</h2>
                </div>
                <div className="space-y-1">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 pb-3 border-b border-gray-300">
                    <div className="col-span-3">Room Type</div>
                    <div className="col-span-2">Rate Type</div> {/* Added Rate Type header */}
                    <div className="col-span-2">Room</div>
                    <div className="col-span-1 text-center">Adult</div>
                    <div className="col-span-1 text-center">Child</div>
                    <div className="col-span-2 text-right">Price/Night</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>
                  {selectedRooms.map((room, index) => {
                    const availableRoomsForCategory = getAvailableRoomsForCategory(room.categoryId)
                    const selectedRoom = getRoomById(room.roomId)
                    const maxAdults = getMaxAdults(room.roomId)
                    const maxChildren = getMaxChildren(room.roomId)
                    const category = getCategoryById(room.categoryId)
                    const basePrice = selectedRoom?.price || 0
                    const finalPrice = room.customPrice !== null ? room.customPrice : basePrice

                    return (
                      <div key={room.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-200">
                        {/* Room Type */}
                        <div className="col-span-3">
                          <select
                            value={room.categoryId}
                            onChange={(e) => updateRoom(index, "categoryId", e.target.value)}
                            className="w-full capitalize px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">-Select-</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id} className="capitalize">
                                {category.name} ({getAvailableRoomCount(category._id)})
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Rate Type */}
                        <div className="col-span-2">
                          <select
                            value={room.rateType}
                            onChange={(e) => updateRoom(index, "rateType", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={!room.categoryId}
                          >
                            <option value="">-Select-</option>
                            {rateTypes.map((rate) => (
                              <option key={rate.value} value={rate.value}>
                                {rate.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Room */}
                        <div className="col-span-2">
                          <select
                            value={room.roomId || ""}
                            onChange={(e) => updateRoom(index, "roomId", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={!room.categoryId || !room.rateType}
                          >
                            <option value="">-Select-</option>
                            {getAvailableRoomsForCategory(room.categoryId, room.roomId).map((availableRoom) => (
                              <option key={availableRoom._id} value={availableRoom._id}>
                                {availableRoom.roomId}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Adult */}
                        <div className="col-span-1">
                          <select
                            value={room.adults}
                            onChange={(e) => updateRoom(index, "adults", Number.parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={!room.roomId}
                          >
                            {Array.from({ length: maxAdults }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Child */}
                        <div className="col-span-1">
                          <select
                            value={room.children}
                            onChange={(e) => updateRoom(index, "children", Number.parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={!room.roomId}
                          >
                            {Array.from({ length: maxChildren + 1 }, (_, i) => i).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Price per Night */}
                        <div className="col-span-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingPrice === index ? (
                              <input
                                type="number"
                                value={room.customPrice !== null ? room.customPrice : basePrice}
                                onChange={(e) => handlePriceChange(index, e.target.value)}
                                onBlur={handlePriceSave}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handlePriceSave()
                                }}
                                className="w-20 px-2 py-1 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-medium">₹{finalPrice.toFixed(0)}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePriceEdit(index)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              disabled={!room.roomId}
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {/* Action */}
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeRoom(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                            disabled={selectedRooms.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={addRoom}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Room
                  </button>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Guest Information</h2>
                  <button
                    type="button"
                    onClick={addGuest}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Guest
                  </button>
                </div>
                <div className="space-y-4">
                  {guests.map((guest, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Guest Name {index === 0 ? "*" : ""}
                            </label>
                            <div className="flex gap-2">
                              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Mr.</option>
                                <option>Mrs.</option>
                                <option>Ms.</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Full Name"
                                value={guest.name}
                                onChange={(e) => updateGuest(index, "name", e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required={index === 0}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                              type="number"
                              placeholder="Age"
                              value={guest.age}
                              onChange={(e) => updateGuest(index, "age", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                            <input
                              type="tel"
                              placeholder="Mobile"
                              value={guest.phone}
                              onChange={(e) => updateGuest(index, "phone", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              placeholder="Email"
                              value={guest.email}
                              onChange={(e) => updateGuest(index, "email", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      {index > 0 && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeGuest(index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || selectedRooms.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {loading ? "Creating Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Summary</h2>
              {checkInDate && checkOutDate && (
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{new Date(checkInDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{new Date(checkOutDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">Selected Rooms</h3>
                {completeSelectedRooms.length === 0 ? (
                  <p className="text-gray-500 text-sm">No rooms selected</p>
                ) : (
                  <div className="space-y-3">
                    {completeSelectedRooms.map((room, index) => {
                      const selectedRoom = getRoomById(room.roomId)
                      const category = getCategoryById(room.categoryId)
                      const basePrice = selectedRoom?.price || 0
                      const finalPrice = room.customPrice !== null ? room.customPrice : basePrice
                      const roomTotal = finalPrice * nights
                      return (
                        <div key={room.id} className="flex justify-between items-start text-sm border-b pb-2">
                          <div className="flex-1">
                            <p className="font-medium capitalize">{category?.name}</p>
                            <p className="text-gray-600">Room: {selectedRoom?.roomId}</p>
                            <p className="text-gray-600 capitalize">Rate: {room.rateType}</p>
                            <p className="text-gray-600">
                              <Users className="w-3 h-3 inline mr-1" />
                              {room.adults} Adults, {room.children} Children
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-medium">₹{roomTotal.toFixed(0)}</p>
                            <p className="text-gray-600">₹{finalPrice.toFixed(0)}/night</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {completeSelectedRooms.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-700">₹{totalAmount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                    <span>Total Rooms:</span>
                    <span>{completeSelectedRooms.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Total Guests:</span>
                    <span>{completeSelectedRooms.reduce((sum, room) => sum + room.adults + room.children, 0)}</span>
                  </div>
                </div>
              )}
              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Source: Walk-in</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Payment: Pay at hotel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalkInReservation
