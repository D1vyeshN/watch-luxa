import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index — MongoDB auto-deletes expired
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Token: Model<IToken> = mongoose.model<IToken>(
  "Token",
  TokenSchema,
);
