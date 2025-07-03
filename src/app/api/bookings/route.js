// app/api/bookings/route.ts
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/utils/database'
import Booking from '@/lib/models/Booking'

export async function POST(req) {
    try {
        await dbConnect()
        const data = await req.json()

        const newBooking = await Booking.create(data)


        return NextResponse.json({ message: 'Booking created successfully', booking: newBooking }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
