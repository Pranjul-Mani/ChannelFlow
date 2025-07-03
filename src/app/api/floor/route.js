import { NextResponse } from 'next/server';
import Floor from '@//lib/models/floor';
import dbConnect from '@/lib/utils/database';
import Room from '@/lib/models/room';
export async function GET() {
  await dbConnect();
  try {
    const floor = await Floor.find({});
    return NextResponse.json(floor);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
 
  await dbConnect();
  try {
    const { name, description, } = await req.json();
    const floor = await Floor.create({ name, description });
    return NextResponse.json(floor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
 
  try {
    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;

      
    if (!id) {
      return NextResponse.json(
        { error: "Floor ID is required" },
        { status: 400 }
      );
    }

    const floor = await Floor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!floor) {
      return NextResponse.json(
        { error: "Floor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(floor);
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Floor name already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request) {
  
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Floor ID is required" },
        { status: 400 }
      );
    }

    const floor = await Floor.findByIdAndDelete(id);

    if (!floor) {
      return NextResponse.json(
        { error: "Floor not found" },
        { status: 404 }
      );
    }

    await Room.deleteMany({floor:id});

    return NextResponse.json({ message: "floor deleted successfully" });
  } catch (error) {
   console.log(error);
   
    return NextResponse.json(
      { error: "Failed to delete floor" },
      { status: 500 }
    );
  }
}