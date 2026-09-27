import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Auto-rule interface
export interface IAutoRule {
  field: 'category' | 'brandId' | 'tags' | 'movement' | 'gender';
  operator: 'equals' | 'in' | 'contains';
  value: string | string[];
}

// Collection model interface
export interface ICollection extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  featured: boolean;
  displayOrder: number;
  productIds: Types.ObjectId[];
  autoRule?: IAutoRule;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// Auto-rule schema (embedded, no _id)
const AutoRuleSchema = new Schema<IAutoRule>(
  {
    field: {
      type: String,
      enum: ['category', 'brandId', 'tags', 'movement', 'gender'],
      required: true,
    },
    operator: {
      type: String,
      enum: ['equals', 'in', 'contains'],
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

// Collection schema definition
const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
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
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 100,
      index: true,
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        index: true,
      },
    ],
    autoRule: AutoRuleSchema,
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
      transform: (_doc: any, ret: any) => {
        // Fix for delete operator on possibly undefined property
        if (ret && (ret as any).__v !== undefined) {
          delete (ret as any).__v;
        }
        return ret;
      },
    },
  }
);
CollectionSchema.index({ status: 1, displayOrder: 1 });
CollectionSchema.index({ featured: 1, status: 1 });

// Virtual: product count
CollectionSchema.virtual('productCount').get(function () {
  return this.productIds?.length || 0;
});

// Fix for delete operator on possibly undefined property
CollectionSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc: any, ret: any) {
    if (ret && (ret as any).__v !== undefined) {
      delete (ret as any).__v;
    }
    return ret;
  },
});

// Export the Collection model
export const Collection: Model<ICollection> = mongoose.model<ICollection>(
  'Collection',
  CollectionSchema
);