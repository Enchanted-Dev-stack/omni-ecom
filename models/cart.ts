import mongoose, { Schema, model, models } from 'mongoose';

export interface ICart {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }]
  },
  {
    timestamps: true,
  }
);

// Create indexes
cartSchema.index({ user: 1 });

const Cart = models.Cart || model<ICart>('Cart', cartSchema);

export default Cart;
