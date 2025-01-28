import mongoose, { Schema, Document } from 'mongoose';

export interface IHero extends Document {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const heroSchema = new Schema<IHero>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      required: [true, 'Button text is required'],
      trim: true,
    },
    buttonLink: {
      type: String,
      required: [true, 'Button link is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
heroSchema.index({ isActive: 1, order: 1 });

const Hero = mongoose.models.Hero || mongoose.model<IHero>('Hero', heroSchema);

export default Hero;
