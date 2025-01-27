import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import { createResponse, handleError } from '@/lib/api-utils';
import { userSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return createResponse({ error: 'Validation error', details: validation.error.errors }, 400);
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return createResponse({ error: 'User with this email already exists' }, 400);
    }

    // Create new user
    const user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password, // Password will be hashed by the model's pre-save hook
    });

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    return createResponse({ user: userResponse }, 201);
  } catch (error) {
    return handleError(error);
  }
}
