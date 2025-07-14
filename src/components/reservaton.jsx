"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarIcon, Users, Plus, Minus } from "lucide-react"
import { format } from "date-fns"

export default function Component() {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [checkIn, setCheckIn] = useState()
    const [checkOut, setCheckOut] = useState()
    const [selectedRoomType, setSelectedRoomType] = useState("")
    const [guests, setGuests] = useState("1")
    const [numberOfRooms, setNumberOfRooms] = useState("1")
    const [selectedRooms, setSelectedRooms] = useState([]) // Array to store multiple room selections
    const [roomTypes, setRoomTypes] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/room");
                if (res.ok) {
                    const data = await res.json();
                    console.log("Fetched Rooms:", data.data);
                    if (data.success) {
                        // Filter rooms that are available
                        const availableRooms = data.data.filter((room) => room.isAvailable === true);
                        setRoomTypes(availableRooms);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch rooms:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const selectedRoomData = roomTypes.find((room) => room._id === selectedRoomType);

    const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0

    // Calculate total price for all selected rooms
    const totalPrice = selectedRooms.reduce((total, room) => {
        return total + (room.pricePerRoom * room.numberOfRooms * nights)
    }, 0)

    const handleGuestIncrement = () => {
        setGuests(Number(guests) + 1)
    }

    const handleGuestDecrement = () => {
        if (Number(guests) > 1) {
            setGuests(Number(guests) - 1)
        }
    }

    const handleRoomIncrement = () => {
        if (selectedRoomData && Number(numberOfRooms) < selectedRoomData.noOfRoom) {
            setNumberOfRooms(Number(numberOfRooms) + 1)
        }
    }

    const handleRoomDecrement = () => {
        if (Number(numberOfRooms) > 1) {
            setNumberOfRooms(Number(numberOfRooms) - 1)
        }
    }

    const handleRoomTypeChange = (value) => {
        setSelectedRoomType(value)
        setNumberOfRooms("1") // Reset room count when changing room type
    }

    const addRoomToSelection = () => {
        if (!selectedRoomType || !numberOfRooms) return

        const roomData = roomTypes.find(room => room._id === selectedRoomType)
        if (!roomData) return

        // Check if room type already exists in selection
        const existingRoomIndex = selectedRooms.findIndex(room => room.roomType._id === selectedRoomType)

        if (existingRoomIndex >= 0) {
            // Update existing room selection
            const updatedRooms = [...selectedRooms]
            updatedRooms[existingRoomIndex] = {
                ...updatedRooms[existingRoomIndex],
                numberOfRooms: parseInt(numberOfRooms),
                pricePerRoom: roomData.price
            }
            setSelectedRooms(updatedRooms)
        } else {
            // Add new room selection
            const newRoomSelection = {
                roomType: roomData,
                numberOfRooms: parseInt(numberOfRooms),
                pricePerRoom: roomData.price
            }
            setSelectedRooms([...selectedRooms, newRoomSelection])
        }

        // Reset selection
        setSelectedRoomType("")
        setNumberOfRooms("1")
    }

    const removeRoomFromSelection = (roomTypeId) => {
        setSelectedRooms(selectedRooms.filter(room => room.roomType._id !== roomTypeId))
    }

    const updateRoomQuantity = (roomTypeId, newQuantity) => {
        if (newQuantity < 1) return

        const roomData = roomTypes.find(room => room._id === roomTypeId)
        if (!roomData || newQuantity > roomData.noOfRoom) return

        const updatedRooms = selectedRooms.map(room =>
            room.roomType._id === roomTypeId
                ? { ...room, numberOfRooms: newQuantity }
                : room
        )
        setSelectedRooms(updatedRooms)
    }

    const handleSubmit = async () => {
        if (!name || !phone || !checkIn || !checkOut || selectedRooms.length === 0) {
            return alert("Please fill all fields and select at least one room")
        }

        const payload = {
            personDetails: [
                {
                    name: name,
                    contactNumber: phone,
                }
            ],
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: parseInt(guests),
            numberOfRooms: selectedRooms.reduce((total, room) => total + room.numberOfRooms, 0),
            source: "walk-in",
            roomType: selectedRooms[0].roomType._id, // Primary room type for compatibility
            roomSelections: selectedRooms.map(room => ({
                roomType: room.roomType._id,
                numberOfRooms: room.numberOfRooms,
                pricePerRoom: room.pricePerRoom
            })),
            status: "confirmed",
            totalAmount: totalPrice + Math.round(totalPrice * 0.12),
        };

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (res.ok) {
                alert("Booking Confirmed!")
                setName("")
                setPhone("")
                setCheckIn(null)
                setCheckOut(null)
                setGuests("1")
                setSelectedRoomType("")
                setNumberOfRooms("1")
                setSelectedRooms([])
            } else {
                alert("Error: " + data.message)
            }
        } catch (err) {
            console.error(err)
            alert("Something went wrong.")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Room Reservation</h1>
                    <p className="text-gray-600 mt-2">Book a room for your guest</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Guest Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Enter Name</Label>
                                        <Input id="firstName" placeholder="John" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" placeholder="+91 79896XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5" />
                                    Reservation Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Check-in Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="cursor-pointer w-full justify-start text-left font-normal bg-transparent">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {checkIn ? format(checkIn, "PPP") : "Select date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Check-out Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="cursor-pointer w-full justify-start text-left font-normal bg-transparent">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {checkOut ? format(checkOut, "PPP") : "Select date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="guests">Number of Guests</Label>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleGuestDecrement}
                                                disabled={guests <= 1}
                                                className="cursor-pointer w-8 h-8 p-0"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <div className="w-16 text-center py-1 px-1 border rounded-md bg-gray-50 text-sm">
                                                {guests}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleGuestIncrement}
                                                className="cursor-pointer w-8 h-8 p-0"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="roomType">Room Type</Label>
                                        <Select value={selectedRoomType} onValueChange={handleRoomTypeChange}>
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Select room type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roomTypes.map((room) => (
                                                    <SelectItem key={room._id} value={room._id}>
                                                        {room.name} ({room.bed} bed{room.bed > 1 ? 's' : ''})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {/* Add Room Button */}
                                        {/* <div className="flex justify-center pt-2"> */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addRoomToSelection}
                                            disabled={!selectedRoomType}
                                            className="cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Room
                                        </Button>
                                        {/* </div> */}
                                    </div>
                                </div>


                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Summary */}
                    <div className="space-y-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {/* Selected Rooms List */}
                                {selectedRooms.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm">Selected Rooms:</h4>
                                        {selectedRooms.map((room, index) => (
                                            <div key={room.roomType._id} className="border rounded-lg p-3 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-medium text-sm">
                                                            {room.roomType.name} ({room.roomType.bed} bed{room.roomType.bed > 1 ? 's' : ''})
                                                        </h5>
                                                        <p className="text-xs text-gray-600">
                                                            Available: {room.roomType.noOfRoom}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRoomFromSelection(room.roomType._id)}
                                                        className="text-red-500 hover:text-red-700 cursor-pointer h-6 w-6 p-0"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Rooms:</span>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => updateRoomQuantity(room.roomType._id, room.numberOfRooms - 1)}
                                                            disabled={room.numberOfRooms <= 1}
                                                            className="cursor-pointer w-6 h-6 p-0"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center text-sm">{room.numberOfRooms}</span>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => updateRoomQuantity(room.roomType._id, room.numberOfRooms + 1)}
                                                            disabled={room.numberOfRooms >= room.roomType.noOfRoom}
                                                            className="cursor-pointer w-6 h-6 p-0"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between text-sm">
                                                    <span>₹{room.pricePerRoom} × {room.numberOfRooms} × {nights} nights</span>
                                                    <span>₹{room.pricePerRoom * room.numberOfRooms * nights}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <Separator />
                                    </div>
                                )}

                                {/* {selectedRooms.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        <p className="text-sm">No rooms selected yet</p>
                                        <p className="text-xs">Choose room type and click "Add Room"</p>
                                    </div>
                                )} */}

                                {selectedRooms.length > 0 && checkIn && checkOut && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Check-in:</span>
                                            <span>{format(checkIn, "MMM dd, yyyy")}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Check-out:</span>
                                            <span>{format(checkOut, "MMM dd, yyyy")}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Nights:</span>
                                            <span>{nights}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Total Rooms:</span>
                                            <span>{selectedRooms.reduce((total, room) => total + room.numberOfRooms, 0)}</span>
                                        </div>
                                    </div>
                                )}

                                {selectedRooms.length > 0 && nights > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>₹{totalPrice}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Taxes & fees (12%)</span>
                                                <span>₹{Math.round(totalPrice * 0.12)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-semibold">
                                                <span>Total</span>
                                                <span>₹{totalPrice + Math.round(totalPrice * 0.12)}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <div className="space-y-3">
                            <Button
                                className="w-full cursor-pointer"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={selectedRooms.length === 0 || !checkIn || !checkOut || !name || !phone}
                            >
                                Confirm Reservation
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}