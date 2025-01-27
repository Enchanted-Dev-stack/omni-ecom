import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Category from '@/models/category';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const category = await Category.findById(params.id)
      .populate('parent', 'name')
      .lean({ virtuals: true });

    if (!category) {
      return createResponse({ error: 'Category not found' }, 404);
    }

    // Get children count
    const childrenCount = await Category.countDocuments({ parent: category._id });
    const categoryWithChildren = {
      ...category,
      childrenCount,
    };

    return createResponse({ category: categoryWithChildren });
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

    const category = await Category.findById(params.id);
    if (!category) {
      return createResponse({ error: 'Category not found' }, 404);
    }

    const formData = await request.formData();
    const updates: any = {
      name: formData.get('name'),
      description: formData.get('description'),
      status: formData.get('status'),
      featured: formData.get('featured') === 'true',
    };

    // Handle parent field
    const parentId = formData.get('parent');
    if (!parentId || parentId === 'null' || parentId === '') {
      updates.parent = null;
    } else {
      // Prevent circular reference
      if (parentId === params.id) {
        return createResponse({ 
          error: 'A category cannot be its own parent' 
        }, 400);
      }

      // Check if the new parent is not a child of this category
      const isChild = await Category.exists({ 
        _id: parentId, 
        parent: params.id 
      });

      if (isChild) {
        return createResponse({ 
          error: 'Cannot set a child category as parent' 
        }, 400);
      }

      updates.parent = parentId;
    }

    // Handle image upload (TODO: implement cloud storage)
    const image = formData.get('image');
    if (image instanceof File) {
      // TODO: Upload to cloud storage
      // updates.image = uploadedImageUrl;
    }

    // Check for duplicate name
    if (updates.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        _id: { $ne: params.id }
      });

      if (existingCategory) {
        return createResponse({ 
          error: 'A category with this name already exists' 
        }, 400);
      }
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('parent', 'name')
      .lean({ virtuals: true });

    // Get children count
    const childrenCount = await Category.countDocuments({ 
      parent: updatedCategory?._id 
    });

    return createResponse({ 
      category: { ...updatedCategory, childrenCount } 
    });
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

    // Find the category
    const category = await Category.findById(params.id);
    if (!category) {
      return createResponse({ error: 'Category not found' }, 404);
    }

    // Check if category has products (you'll need to implement this check)
    // const hasProducts = await Product.exists({ category: params.id });
    // if (hasProducts) {
    //   return createResponse({ 
    //     error: 'Cannot delete category with associated products' 
    //   }, 400);
    // }

    // Delete the category (children will be deleted by the pre middleware)
    await Category.findByIdAndDelete(params.id);

    return createResponse({ 
      message: 'Category and its subcategories deleted successfully' 
    });
  } catch (error) {
    return handleError(error);
  }
}
