import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/database';
import Room from '@/lib/models/room';
import Category from '@/lib/models/Category';

export async function POST(req) {
  await dbConnect();

  try {
    const { rooms } = await req.json();

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json({ error: "No valid rooms provided" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const room of rooms) {
      try {
        const {
          roomId,
          name,
          description,
          category: catName,
          noOfRoom,
          location,
          images,
          amenities,
          price,
          bed,
          isAvailable
        } = room;

        // Validate required fields
        if (!roomId || !name || !catName || !images || (price === undefined) || (bed === undefined)) {
          errors.push(`Room with roomId: ${roomId || 'unknown'} is missing required fields`);
          continue;
        }

        // Check for duplicates
        const existingRoom = await Room.findOne({ roomId });
        if (existingRoom) {
          errors.push(`Room with roomId: ${roomId} already exists`);
          continue;
        }

        // Find or create category
        let category = await Category.findOne({ name: catName });
        if (!category) {
          category = await Category.create({ name: catName });
        }

        // Process images
        let imageArray = [];
        if (typeof images === 'string') {
          imageArray = images.split(',').map(img => img.trim()).filter(Boolean);
        } else if (Array.isArray(images)) {
          imageArray = images.filter(Boolean);
        }
        if (imageArray.length === 0) {
          errors.push(`Room ${roomId} must have at least one image`);
          continue;
        }

        // Process amenities (optional)
        let amenitiesArray = [];
        if (typeof amenities === 'string') {
          amenitiesArray = amenities.split(',').map(a => a.trim()).filter(Boolean);
        } else if (Array.isArray(amenities)) {
          amenitiesArray = amenities.filter(Boolean);
        }

        // Process booleans and numbers
        const roomAvailable = typeof isAvailable === 'string'
          ? isAvailable.toLowerCase() === 'true'
          : !!isAvailable;

        const roomPrice = Number(price);
        const bedCount = Number(bed);
        const roomCount = noOfRoom ? Number(noOfRoom) : 1;

        if (isNaN(roomPrice) || roomPrice <= 0) {
          errors.push(`Room ${roomId} has invalid price`);
          continue;
        }

        if (isNaN(bedCount) || bedCount <= 0 || !Number.isInteger(bedCount)) {
          errors.push(`Room ${roomId} has invalid bed count`);
          continue;
        }

        if (roomCount && (isNaN(roomCount) || roomCount <= 0 || !Number.isInteger(roomCount))) {
          errors.push(`Room ${roomId} has invalid noOfRoom`);
          continue;
        }

        // Final object
        results.push({
          roomId,
          name: name.toLowerCase(),
          description: description || '',
          category: category._id,
          images: imageArray,
          noOfRoom: roomCount,
          location: location || '',
          amenities: amenitiesArray,
          price: roomPrice,
          bed: bedCount,
          isAvailable: roomAvailable,
        });

      } catch (roomError) {
        errors.push(`Error processing roomId ${room.roomId || 'unknown'}: ${roomError.message}`);
      }
    }

    if (results.length === 0) {
      return NextResponse.json({
        error: "No valid entries after processing",
        details: errors
      }, { status: 400 });
    }

    const inserted = await Room.insertMany(results, { ordered: false });

    return NextResponse.json({
      message: `${inserted.length} rooms imported successfully.`,
      imported: inserted.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    return NextResponse.json({
      error: "Import failed",
      details: err.message
    }, { status: 500 });
  }
}
