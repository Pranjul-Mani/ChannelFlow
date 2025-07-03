// src/app/api/staff/route.js
import { NextResponse } from "next/server"
import connectDB from "@/lib/utils/database" // Adjust path as needed
import Staff from "@/lib/models/staffModel" // You'll need to create this model

// GET - Fetch all staff
export async function GET() {
  try {
    await connectDB()
    const staff = await Staff.find({}).sort({ createdAt: -1 })
    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff" }, 
      { status: 500 }
    )
  }
}

// POST - Create new staff
export async function POST(request) {
  try {
    await connectDB()
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.email || !data.role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" }, 
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email: data.email })
    if (existingStaff) {
      return NextResponse.json(
        { error: "Staff member with this email already exists" }, 
        { status: 409 }
      )
    }

    const staff = new Staff(data)
    await staff.save()
    
    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error("Error creating staff:", error)
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Staff member with this email already exists" }, 
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create staff member" }, 
      { status: 500 }
    )
  }
}