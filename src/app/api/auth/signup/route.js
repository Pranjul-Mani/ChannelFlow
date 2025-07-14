// 5. SIGNUP API ROUTE
// File: src/app/api/auth/signup/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/database';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const userData = await request.json();
    const { name, email, phone, password, role } = userData;

    // Validate required fields
    if (!name || !email || !phone || !password ) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password,
      // role: role || 'staff',
  
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      // role: user.role
    });

    // Return success response
    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        // role: user.role,
       
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
