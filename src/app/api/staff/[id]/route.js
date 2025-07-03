// src/app/api/staff/[id]/route.js
import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import connectDB from "@/lib/utils/database"
import Staff from "@/lib/models/staffModel"

// GET - Get staff member by ID
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    // Await params before accessing properties
    const { id } = await params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid staff ID" },
        { status: 400 }
      )
    }

    const staff = await Staff.findById(id)
    
    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update staff member
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    // Await params before accessing properties
    const { id } = await params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid staff ID" },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.email || !data.role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      )
    }

    // Check if email is already taken by another staff member
    const existingStaff = await Staff.findOne({
      email: data.email,
      _id: { $ne: id }
    })

    if (existingStaff) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    const staff = await Staff.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error updating staff:", error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete staff member
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    
    // Await params before accessing properties
    const { id } = await params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid staff ID" },
        { status: 400 }
      )
    }

    const staff = await Staff.findByIdAndDelete(id)
    
    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Staff member deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting staff:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}