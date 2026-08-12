import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revoked: boolean;
  replacedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    familyId: {
      type: String,
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revoked: {
      type: Boolean,
      default: false,
    },

    replacedBy: {
      type: Schema.Types.ObjectId,
      ref: "RefreshToken",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);