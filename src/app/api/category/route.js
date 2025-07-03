import { NextResponse } from 'next/server';
import Category from '@/lib/models/Category';
import dbConnect from '@/lib/utils/database';
import Room from '@/lib/models/room';
export async function GET() {
  await dbConnect();
  try {
    const categories = await Category.find({});
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
 
  await dbConnect();
  try {
    const { name, description, } = await req.json();
    const category = await Category.create({ name, description });
    return NextResponse.json(category, { status: 201 });
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
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Category name already exists" },
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
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    await Room.deleteMany({category:id});

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
   console.log(error);
   
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}