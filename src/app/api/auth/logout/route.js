// 7. LOGOUT API ROUTE
// File: src/app/api/auth/logout/route.js
// ===========================================

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Since we're using JWT tokens stored on the client side,
    // logout is primarily handled on the frontend by removing the token
    // This endpoint can be used for any server-side cleanup if needed
    
    return NextResponse.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}