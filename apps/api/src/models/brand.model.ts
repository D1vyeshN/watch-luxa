import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IBrand extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  founded?: number;
  heritageStory?: string;
  featured: boolean;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: 'text',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    founded: {
      type: Number,
      min: 1500,
      max: new Date().getFullYear(),
    },
    heritageStory: {
      type: String,
      maxlength: 5000,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Compound indexes for common admin queries
BrandSchema.index({ status: 1, name: 1 });
BrandSchema.index({ featured: 1, status: 1 });

export const Brand: Model<IBrand> = mongoose.model<IBrand>('Brand', BrandSchema);
