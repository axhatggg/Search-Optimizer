import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Add a new product
const addProduct = asyncHandler(async (req, res) => {
    const { name, description, price, count, category, color, brand } = req.body;

        console.log("Request body:", req.body);
        

    // Validate required fields
    if (!name || !description || !price || !category || !color || !brand) {
        throw new ApiError(400, "All fields are required: name, description, price, category, color, and brand");
    }

   

    // Validate price and count are numbers
    if (isNaN(price) || price <= 0) {
        throw new ApiError(400, "Price must be a valid positive number");
    }

    if (count && (isNaN(count) || count < 0)) {
        throw new ApiError(400, "Count must be a valid non-negative number");
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
        throw new ApiError(409, "Product with this name already exists");
    }

    // Handle image uploads (same pattern as user controller)
    const imageLocalPath = req.files?.images[0]?.path;
    
    let imageUrl = "";
    if (imageLocalPath) {
        const image = await uploadOnCloudinary(imageLocalPath);
        if (!image) {
            throw new ApiError(500, "Image upload failed");
        }
        imageUrl = image.url;
    }

    // Create the product
    const product = await Product.create({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        count: count ? parseInt(count) : 0,
        category: category.trim(),
        color: color.trim(),
        brand: brand.trim(),
        images: imageUrl ? [imageUrl] : []
    });

    if (!product) {
        throw new ApiError(500, "Something went wrong while creating the product");
    }

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

export { addProduct };
