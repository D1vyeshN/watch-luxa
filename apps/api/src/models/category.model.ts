import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder: number;
  isSystem: boolean;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
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
    description: {
      type: String,
      maxlength: 500,
    },
    image: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    displayOrder: {
      type: Number,
      default: 100,
      index: true,
    },
    isSystem: {
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
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

CategorySchema.index({ status: 1, displayOrder: 1 });
CategorySchema.index({ isSystem: 1, status: 1 });

export const Category: Model<ICategory> = mongoose.model<ICategory>(
  'Category',
  CategorySchema
);
