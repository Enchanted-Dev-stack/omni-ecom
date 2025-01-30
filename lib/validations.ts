import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  zipCode: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  addresses: z.array(addressSchema).optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be greater than 0').or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  images: z.array(z.string()).default([]),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative').or(z.string().regex(/^\d+$/).transform(Number)),
  slug: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  featured: z.boolean().default(false),
  variants: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
  })).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const shippingDetailsSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

export const cartItemOrderSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.number().min(0),
  image: z.string(),
  slug: z.string(),
  quantity: z.number().int().positive(),
});

export const orderSchema = z.object({
  items: z.array(cartItemOrderSchema),
  shippingDetails: shippingDetailsSchema,
  totalAmount: z.number().min(0),
  shippingCost: z.number().min(0),
  paymentDetails: z.object({
    razorpay_payment_id: z.string(),
    razorpay_order_id: z.string(),
    razorpay_signature: z.string(),
  }),
});
