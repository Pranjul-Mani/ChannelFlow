// api/room/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/utils/database"; // Adjust path as needed
import Room from "@/lib/models/room"; // Your room model
import Category from "@/lib/models/Category"; // Your category model
// import reviews from "@/models/Review";
import Review from "@/lib/models/review";

export async function GET(request) {
   try {
    await connectDB();
    
    // Get all query parameters for filtering
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const categoryId = searchParams.get("category");
    const query = {};
    
    // Build query object based on provided parameters
    if (id) {
      // If ID is provided, fetch a single product
      return await getSingleRoom(id);
    }
    
    // Add filters
    if (categoryId) query.Category = categoryId;

    
    // Fetch products with applied filters
    const rooms = await Room.find(query)
      .populate("category")
      .populate("reviews")
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ 
      success: true, 
      data: rooms,
      count: rooms.length
    });
    
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// Helper function to get a single product by ID
async function getSingleRoom(id) {
  try {
    const product = await Room.findById(id)
      .populate("category")
      .populate("reviews");
      
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid room ID" },
      { status: 400 }
    );
  }
}

// Helper function to process amenities from comma-separated string
function processAmenities(amenitiesInput) {
  if (!amenitiesInput) return [];
  
  if (typeof amenitiesInput === 'string') {
    return amenitiesInput
      .split(',')
      .map(amenity => amenity.trim())
      .filter(amenity => amenity.length > 0);
  }
  
  if (Array.isArray(amenitiesInput)) {
    return amenitiesInput
      .map(amenity => typeof amenity === 'string' ? amenity.trim() : amenity)
      .filter(amenity => amenity && amenity.length > 0);
  }
  
  return [];
}

// POST - Create new room
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      roomId,
      name,
      description,
      noOfRoom,
      location,
      category,
      images,
      price,
      bed,
      isAvailable,
      amenities,
      floor // ✅ Added floor
    } = body;

    // Validation
    if (
      !roomId ||
      !name ||
      !category ||
      !images ||
      !price ||
      !bed ||
      floor === undefined // ✅ Validate floor
    ) {
      return NextResponse.json(
        { success: false, error: "Please fill all required fields" },
        { status: 400 }
      );
    }

    // Check if room name already exists
    // const existingRoom = await Room.findOne({ name: name.toLowerCase() });
    // if (existingRoom) {
    //   return NextResponse.json(
    //     { success: false, error: "Room with this name already exists" },
    //     { status: 400 }
    //   );
    // }

    // Process amenities
    const processedAmenities = processAmenities(amenities);

    // Create new room
    const newRoom = new Room({
      roomId,
      name: name.toLowerCase(),
      description,
      category,
      noOfRoom,
      location,
      floor, // ✅ Include floor
      images,
      amenities: processedAmenities,
      price: parseFloat(price),
      bed: parseInt(bed),
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    await newRoom.save();
    
    // Populate the room data before returning
    await newRoom.populate('category', 'name');
    
    return NextResponse.json({ 
      success: true, 
      data: newRoom,
      message: "Room created successfully" 
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 }
    );
  }
}


// PUT - Update room
export async function PUT(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Room ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { roomId, name, description, noOfRoom, location, category, images, price, bed, isAvailable, amenities } = body;

    // Validation
    if (!roomId || !name || !category || !images || !price || !bed) {
      return NextResponse.json(
        { success: false, error: "Please fill all required fields" },
        { status: 400 }
      );
    }

    // Check if another room with the same name exists (excluding current room)
    const existingRoom = await Room.findOne({ 
      name: name.toLowerCase(),
      _id: { $ne: id }
    });
    
    // if (existingRoom) {
    //   return NextResponse.json(
    //     { success: false, error: "Room with this name already exists" },
    //     { status: 400 }
    //   );
    // }

    // Process amenities
    const processedAmenities = processAmenities(amenities);

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        roomId,
        name: name.toLowerCase(),
        description,
        noOfRoom,
        location,
        category,
        images,
        amenities: processedAmenities,
        price: parseFloat(price),
        bed: parseInt(bed),
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!updatedRoom) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedRoom,
      message: "Room updated successfully" 
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE - Delete room
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Room ID is required" },
        { status: 400 }
      );
    }

    const deletedRoom = await Room.findByIdAndDelete(id);

    if (!deletedRoom) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    // Delete associated reviews
    await Review.deleteMany({ room: id }); 

    return NextResponse.json({ 
      success: true, 
      message: "Room deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete room" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle room availability
export async function PATCH(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Room ID is required" },
        { status: 400 }
      );
    }

    const room = await Room.findById(id);
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    // Toggle availability
    room.isAvailable = !room.isAvailable;
    await room.save();
    
    await room.populate('category', 'name');

    return NextResponse.json({ 
      success: true, 
      data: room,
      message: `Room ${room.isAvailable ? 'marked as available' : 'marked as unavailable'}` 
    });
  } catch (error) {
    console.error("Error toggling room availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle room availability" },
      { status: 500 }
    );
  }
}