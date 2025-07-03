// api/product/[productId]/reviews/route.js
import { NextResponse } from "next/server";
import Room from "@/models/Room";
import Review from "@/models/Review";
import  connectDB  from "@/lib/connectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // adjust path as needed

// GET: Fetch reviews for a product
export async function GET(req, { params }) {
  await connectDB();
  const { roomId } = await params;

  try {
    // Find the product and populate the reviews
    const room = await Room.findById(roomId)
      .populate({
        path: 'reviews',
        populate: {
          path: 'author',
          select: 'name email image _id'
        }
      });

    if (!room) {
      return NextResponse.json({ error: "room not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      reviews: room.reviews || [] 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch reviews" 
    }, { status: 500 });
  }
}

// POST: Create a new review for a product
export async function POST(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { roomId } = params;
  const body = await req.json();
  
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    // // Check if user already submitted a review for this room
    // const existingReview = await Review.findOne({
    //   author: user.id,
    //   product: productId
    // });
    
    // if (existingReview) {
    //   return NextResponse.json({ 
    //     error: "You have already reviewed this product" 
    //   }, { status: 400 });
    // }
    
    // Create new review
    const newReview = new Review({
      ...body.review,
      author: user.id,
      room: roomId
    });
    
    // Save the review
    await newReview.save();
    
    // Add review to room's reviews array
    room.reviews.push(newReview._id);
    await room.save();
    
    // Return the new review
    return NextResponse.json({ 
      success: true,
      message: "Review added successfully", 
      review: newReview 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to create review" 
    }, { status: 500 });
  }
}

// DELETE: Delete a review
export async function DELETE(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { roomId } = params;
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get("reviewId");
  
  if (!reviewId) {
    return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
  }
  
  try {
    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    
    // Check if the user is the author of the review
    if (review.author.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden - You can only delete your own reviews" }, { status: 403 });
    }
    
    // Remove the review from the product's reviews array
    await Room.findByIdAndUpdate(roomId, { 
      $pull: { reviews: reviewId } 
    });
    
    // Deleyte the review
    await Review.findByIdAndDelete(reviewId);
    
    return NextResponse.json({ 
      success: true,
      message: "Review deleted successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to delete review" 
    }, { status: 500 });
  }
}
