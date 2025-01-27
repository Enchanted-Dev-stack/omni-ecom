import { NextResponse } from 'next/server';
import { z } from 'zod';

export const createResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, { status });
};

export const handleError = (error: any) => {
  console.error('API Error:', error);
  if (error instanceof z.ZodError) {
    return createResponse({ error: 'Validation error', details: error.errors }, 400);
  }
  return createResponse({ error: 'Internal server error' }, 500);
};

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
});

export const idSchema = z.object({
  id: z.string().min(1),
});
