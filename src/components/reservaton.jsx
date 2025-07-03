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
import { CalendarIcon, Users, Plus, Minus } from "lucide-react"
import { format } from "date-fns"



export default function Component() {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [checkIn, setCheckIn] = useState()
    const [checkOut, setCheckOut] = useState()
    const [selectedRoomType, setSelectedRoomType] = useState("")
    const [guests, setGuests] = useState("1")
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(false);


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
    const totalPrice = selectedRoomData && nights > 0 ? selectedRoomData.price * nights : 0


    const handleGuestIncrement = () => {
        setGuests(Number(guests) + 1)

    }

    const handleGuestDecrement = () => {
        if (Number(guests) > 1) {
            setGuests(Number(guests) - 1)
        }
    }

    const handleSubmit = async () => {
        if (!name || !phone || !checkIn || !checkOut || !selectedRoomType) {
            return alert("Please fill all fields")
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
            source: "walk-in",
            roomType: selectedRoomType,
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
                                                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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
                                                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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
                                                className="w-8 h-8 p-0"
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
                                                // disabled={guests >= 6}
                                                className="w-8 h-8 p-0"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="roomType">Room Type</Label>
                                        <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select room type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roomTypes.map((room) => (
                                                    <SelectItem key={room._id} value={room._id}>
                                                        {room.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                {selectedRoomData && (
                                    <>
                                        <h4 className="font-semibold">{selectedRoomData.name}</h4>
                                        <Separator />
                                    </>
                                )}
                                {checkIn && checkOut && (
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
                                    </div>
                                )}
                                {selectedRoomData && nights > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>
                                                    ₹{selectedRoomData.price} × {nights} nights
                                                </span>
                                                <span>₹{selectedRoomData.price * nights}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Taxes & fees</span>
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
                            <Button className="w-full cursor-pointer" size="lg" onClick={handleSubmit}>
                                Confirm Reservation
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
