import mongoose, { Schema, model, models } from 'mongoose';

export interface IProduct {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  stock: number;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true, default: 0 },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });

const Product = models.Product || model<IProduct>('Product', productSchema);

export default Product;
