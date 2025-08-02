import mongoose from "mongoose";
import { Schema } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxLength: [50, "Product name should be less than 50 characters"]
  },
  description: {
    type: String,
    required: [true, "Product description is required"]
  },
 price: {
  type: Number,
  required: [true, "Product price is required"],
  max: [99999, "Product price should not exceed 99999"] // ✅ Use 'max' for numbers
},
count : {
  type: Number,
  required: [true, "Product count is required"],
  max: [9999, "Product count should not exceed 9999"], // ✅ Use 'max' for numbers
  default: 0
},
  category: {
    type: String,
    required: [true, "Please select product category"]
  },
  color: {
    type: String,
    required: [true, "Product color is required"],
    trim: true
  },
  brand: {
    type: String,
    required: [true, "Product brand is required"],
    trim: true,
    maxLength: [30, "Brand name should be less than 30 characters"]
  },
  gender: {
    type: String,
    // required: [true, "Product brand is required"],
    trim: true,
    maxLength: [30, "Brand name should be less than 30 characters"],
      enum: ["Male", "Female","Unisex"],
        default: "Unisex",

  },
  images: [
    {
      type : String
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // averageRating: {
  //   type: Number,
  //   default: 0,
  //   min: [0, "Rating cannot be less than 0"],
  //   max: [5, "Rating cannot exceed 5"]
  // },
  // totalRatings: {
  //   type: Number,
  //   default: 0,
  //   min: [0, "Total ratings cannot be negative"]
  // },
  
}, {timestamps: true});

export const Product = mongoose.model("Product", productSchema);
        