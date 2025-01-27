import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  location?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: [true, 'Low stock threshold is required'],
      min: 0,
      default: 5,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'out_of_stock',
    },
    lastRestocked: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update status based on quantity and threshold
inventorySchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('lowStockThreshold')) {
    if (this.quantity <= 0) {
      this.status = 'out_of_stock';
    } else if (this.quantity <= this.lowStockThreshold) {
      this.status = 'low_stock';
    } else {
      this.status = 'in_stock';
    }
  }
  next();
});

// Indexes for better performance
inventorySchema.index({ product: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ quantity: 1 });

const Inventory = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', inventorySchema);

export default Inventory;
