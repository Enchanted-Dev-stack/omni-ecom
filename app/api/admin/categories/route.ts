import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Category from '@/models/category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const parentParam = searchParams.get('parent');
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filter: any = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    // Handle parent filter properly
    if (parentParam === 'null') {
      filter.parent = null;
    } else if (parentParam) {
      filter.parent = parentParam;
    }

    if (status && status !== 'All') {
      filter.status = status.toLowerCase();
    }

    const total = await Category.countDocuments(filter);
    const categories = await Category.find(filter)
      .populate('parent', 'name')
      .lean({ virtuals: true });

    // Get children count for each category
    const categoriesWithChildren = await Promise.all(
      categories.map(async (category) => {
        const childrenCount = await Category.countDocuments({ parent: category._id });
        return {
          ...category,
          childrenCount,
        };
      })
    );

    return createResponse({
      categories: categoriesWithChildren,
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
    const formData = await request.formData();
    
    const categoryData: any = {
      name: formData.get('name'),
      description: formData.get('description'),
      status: formData.get('status') || 'active',
      featured: formData.get('featured') === 'true',
    };

    // Handle parent field
    const parentId = formData.get('parent');
    if (!parentId || parentId === 'null' || parentId === '') {
      categoryData.parent = null;
    } else {
      categoryData.parent = parentId;
    }

    // Handle image upload (TODO: implement cloud storage)
    const image = formData.get('image');
    if (image instanceof File) {
      // TODO: Upload to cloud storage
      // categoryData.image = uploadedImageUrl;
    }

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') }
    });

    if (existingCategory) {
      return createResponse({ 
        error: 'A category with this name already exists' 
      }, 400);
    }

    const category = await Category.create(categoryData);
    const populatedCategory = await Category.findById(category._id)
      .populate('parent', 'name')
      .lean({ virtuals: true });

    return createResponse({ category: populatedCategory }, 201);
  } catch (error) {
    return handleError(error);
  }
}
