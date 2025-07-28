import mongoose from "mongoose";
import { Schema } from "mongoose";

const ratingSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"]
  }
}, {timestamps: true});

// Ensure one rating per user per product
ratingSchema.index({ product: 1, user: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", ratingSchema);
