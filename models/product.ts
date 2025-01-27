import mongoose from 'mongoose';
import slugify from 'slugify';

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  sku: { type: String, unique: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, min: 0, default: 5 },
  location: { type: String },
  lastRestocked: { type: Date },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'out_of_stock'
  }
});

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true 
  },
  slug: { 
    type: String,
    unique: true,
    lowercase: true,
    required: false // We'll generate this automatically
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'] 
  },
  images: [{ 
    type: String,
    default: [] 
  }],
  category: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  sku: { 
    type: String, 
    unique: true,
    sparse: true, // Allow null/undefined values
    trim: true 
  },
  stock: { 
    type: Number, 
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0 
  },
  lowStockThreshold: {
    type: Number,
    min: 0,
    default: 5
  },
  location: {
    type: String,
    trim: true
  },
  lastRestocked: {
    type: Date
  },
  status: { 
    type: String, 
    enum: ['active', 'draft', 'archived', 'out_of_stock'],
    default: 'active' 
  },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'out_of_stock'
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  variants: [variantSchema],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Generate slug before validation
productSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Update stock status before save
productSchema.pre('save', function(next) {
  // Update main product stock status
  if (this.isModified('stock') || this.isModified('lowStockThreshold')) {
    if (this.stock <= 0) {
      this.stockStatus = 'out_of_stock';
      this.status = 'out_of_stock';
    } else if (this.stock <= this.lowStockThreshold) {
      this.stockStatus = 'low_stock';
      this.status = 'active';
    } else {
      this.stockStatus = 'in_stock';
      this.status = 'active';
    }
  }

  // Update variants stock status
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach(variant => {
      if (variant.isModified('stock') || variant.isModified('lowStockThreshold')) {
        if (variant.stock <= 0) {
          variant.stockStatus = 'out_of_stock';
        } else if (variant.stock <= variant.lowStockThreshold) {
          variant.stockStatus = 'low_stock';
        } else {
          variant.stockStatus = 'in_stock';
        }
      }
    });
  }

  next();
});

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ stockStatus: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
