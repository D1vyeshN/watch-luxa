import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─────────────────────────────────────────────────────────────
// SUB-INTERFACES
// ─────────────────────────────────────────────────────────────

export interface IProductSpecs {
  referenceNumber: string;
  movementCaliber?: string;
  movementType: string;
  powerReserve?: number;
  jewels?: number;
  caseDiameter: number;
  caseThickness?: number;
  lugWidth?: number;
  caseMaterial: string;
  bezelMaterial?: string;
  crystalType: string;
  waterResistance: number;
  indices?: string;
  hands?: string;
  warranty: string;
  boxAndPapers: boolean;
}

export interface IProductVariant {
  _id: Types.ObjectId;
  sku: string;
  dialColor: string;
  dialFinish?: string;
  caseMaterial: string;
  caseSize: number;
  bezelType?: string;
  indicesType?: string;
  strapType: string;
  strapColor: string;
  claspType?: string;
  movement: 'automatic' | 'manual' | 'quartz' | 'solar';
  complications: string[];
  price: number;              // in paise
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  isActive: boolean;
  weight?: number;            // grams
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  brandId: Types.ObjectId;
  category: string;
  collectionIds: Types.ObjectId[];
  gender: 'men' | 'women' | 'unisex';
  shortDescription: string;
  fullDescription: string;
  story?: string;
  basePrice: number;
  images: string[];
  video?: string;
  heroImage: string;
  specs: IProductSpecs;
  variants: IProductVariant[];
  tags: string[];
  status: 'draft' | 'active' | 'archived';
  featured: boolean;
  isLimitedEdition: boolean;
  limitedQuantity?: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  internalNotes?: string;     // admin-only, never exposed to storefront
  rating: number;
  reviewCount: number;
  soldCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  totalStock?: number;
  variantCount?: number;
  priceRange?: { min: number; max: number };
  lowStockVariants?: IProductVariant[];
  outOfStock?: boolean;
}

// ─────────────────────────────────────────────────────────────
// VARIANT SCHEMA
// ─────────────────────────────────────────────────────────────

const VariantSchema = new Schema<IProductVariant>(
  {
    sku: {
      type: String,
      required: false,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    dialColor: { type: String, required: true, index: true },
    dialFinish: String,
    caseMaterial: { type: String, required: true, index: true },
    caseSize: { type: Number, required: true, index: true },
    bezelType: { type: String, index: true },
    indicesType: String,
    strapType: { type: String, required: true, index: true },
    strapColor: { type: String, required: true },
    claspType: String,
    movement: {
      type: String,
      enum: ['automatic', 'manual', 'quartz', 'solar'],
      required: true,
      index: true,
    },
    complications: [{ type: String, index: true }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 3, min: 0 },
    images: [String],
    isActive: { type: Boolean, default: true, index: true },
    weight: { type: Number, min: 0 },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────
// PRODUCT SCHEMA
// ─────────────────────────────────────────────────────────────

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: 2,
      maxlength: 150,
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
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    collectionIds: [
      { type: Schema.Types.ObjectId, ref: 'Collection', index: true },
    ],
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex'],
      default: 'unisex',
      index: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    fullDescription: {
      type: String,
      required: true,
      index: 'text',
    },
    story: { type: String, maxlength: 5000 },
    basePrice: { type: Number, required: true, min: 0 },
    images: [String],
    video: String,
    heroImage: { type: String, required: [true, 'Hero image is required'] },
    specs: {
      referenceNumber: { type: String, required: true, index: true },
      movementCaliber: String,
      movementType: { type: String, required: true },
      powerReserve: Number,
      jewels: Number,
      caseDiameter: { type: Number, required: true },
      caseThickness: Number,
      lugWidth: Number,
      caseMaterial: { type: String, required: true },
      bezelMaterial: String,
      crystalType: { type: String, required: true },
      waterResistance: { type: Number, required: true, index: true },
      indices: String,
      hands: String,
      warranty: { type: String, required: true },
      boxAndPapers: { type: Boolean, default: true },
    },
    variants: [VariantSchema],
    tags: [{ type: String, index: true }],
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    isLimitedEdition: { type: Boolean, default: false, index: true },
    limitedQuantity: Number,
    metaTitle: { type: String, maxlength: 60, trim: true },
    metaDescription: { type: String, maxlength: 160, trim: true },
    ogImage: String,
    internalNotes: { type: String, maxlength: 1000 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    publishedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────

ProductSchema.index({ status: 1, category: 1, basePrice: 1 });
ProductSchema.index({ status: 1, brandId: 1 });
ProductSchema.index({ status: 1, featured: 1, createdAt: -1 });
ProductSchema.index({ 'variants.dialColor': 1, 'variants.caseMaterial': 1 });
ProductSchema.index({ 'variants.movement': 1, 'variants.strapType': 1 });
ProductSchema.index({ gender: 1, status: 1 });
ProductSchema.index({ name: 'text', fullDescription: 'text', tags: 'text' });

// ─────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────

ProductSchema.virtual('totalStock').get(function () {
  return this.variants.reduce((sum, v) => sum + (v.isActive ? v.stock : 0), 0);
});

ProductSchema.virtual('variantCount').get(function () {
  return this.variants.filter((v) => v.isActive).length;
});

ProductSchema.virtual('priceRange').get(function () {
  const active = this.variants.filter((v) => v.isActive);
  if (!active.length) return { min: this.basePrice, max: this.basePrice };
  const prices = active.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
});

ProductSchema.virtual('lowStockVariants').get(function () {
  return this.variants.filter(
    (v) => v.isActive && v.stock > 0 && v.stock <= v.lowStockThreshold
  );
});

ProductSchema.virtual('outOfStock').get(function () {
  return this.totalStock === 0;
});

export const Product: Model<IProduct> = mongoose.model<IProduct>(
  'Product',
  ProductSchema
);
