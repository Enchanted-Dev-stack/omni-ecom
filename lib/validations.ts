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
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  images: z.array(z.string().url()),
  category: z.string().min(1),
  stock: z.number().int().min(0),
  slug: z.string().min(1),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const orderSchema = z.object({
  items: z.array(cartItemSchema),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['stripe', 'cod']),
});
