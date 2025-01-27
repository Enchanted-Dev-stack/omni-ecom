import mongoose, { Schema, model, models } from 'mongoose';

export interface ICategory {
  name: string;
  description?: string;
  slug: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Create indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

const Category = models.Category || model<ICategory>('Category', categorySchema);

export default Category;
