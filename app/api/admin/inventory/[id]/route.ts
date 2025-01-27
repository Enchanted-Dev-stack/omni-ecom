import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Inventory from '@/models/inventory';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const inventory = await Inventory.findById(params.id)
      .populate('product', 'name price images')
      .lean();

    if (!inventory) {
      return createResponse({ error: 'Inventory item not found' }, 404);
    }

    return createResponse({ inventory });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const inventory = await Inventory.findById(params.id);
    if (!inventory) {
      return createResponse({ error: 'Inventory item not found' }, 404);
    }

    const updates = await request.json();

    // Check for duplicate SKU
    if (updates.sku) {
      const existingInventory = await Inventory.findOne({
        sku: { $regex: new RegExp(`^${updates.sku}$`, 'i') },
        _id: { $ne: params.id }
      });

      if (existingInventory) {
        return createResponse({ 
          error: 'An item with this SKU already exists' 
        }, 400);
      }
    }

    // If quantity is being updated, set lastRestocked
    if (updates.quantity && updates.quantity > inventory.quantity) {
      updates.lastRestocked = new Date();
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('product', 'name price images')
      .lean();

    return createResponse({ inventory: updatedInventory });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const inventory = await Inventory.findById(params.id);
    if (!inventory) {
      return createResponse({ error: 'Inventory item not found' }, 404);
    }

    await Inventory.findByIdAndDelete(params.id);

    return createResponse({ 
      message: 'Inventory item deleted successfully' 
    });
  } catch (error) {
    return handleError(error);
  }
}
