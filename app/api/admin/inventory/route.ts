import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Inventory from '@/models/inventory';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const filter: any = {};
    
    if (query) {
      filter.$or = [
        { sku: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const total = await Inventory.countDocuments(filter);
    const inventory = await Inventory.find(filter)
      .populate('product', 'name price images')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return createResponse({
      inventory,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Check if SKU already exists
    const existingInventory = await Inventory.findOne({ 
      sku: { $regex: new RegExp(`^${body.sku}$`, 'i') }
    });

    if (existingInventory) {
      return createResponse({ 
        error: 'An item with this SKU already exists' 
      }, 400);
    }

    const inventory = await Inventory.create(body);
    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('product', 'name price images')
      .lean();

    return createResponse({ inventory: populatedInventory }, 201);
  } catch (error) {
    return handleError(error);
  }
}
