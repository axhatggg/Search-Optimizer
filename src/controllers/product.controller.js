import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Add a new product
const   addProduct = asyncHandler(async (req, res) => {
    const { name, description, price, count, category, color, brand, gender, discount } = req.body;

        // console.log("Request body:", req.body);
        

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
    // const existingProduct = await Product.findOne({ name: name.trim() });
    // if (existingProduct) {
    //     throw new ApiError(409, "Product with this name already exists");
    // }

    // Handle multiple image uploads
    let imageUrls = [];
    if (req.files && req.files.images && Array.isArray(req.files.images)) {
        for (const file of req.files.images) {
            if (file.path) {
                const image = await uploadOnCloudinary(file.path);
                if (!image) {
                    throw new ApiError(500, "Image upload failed");
                }
                imageUrls.push(image.url);
            }
        }
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
        gender: gender || "Unisex",
        images: imageUrls,
        owner: req.user._id // Add the logged-in user as owner
    });

    if (!product) {
        throw new ApiError(500, "Something went wrong while creating the product");
    }

    // Send product data to second server
    const secondServerData = {
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        color: product.color,
        gender: product.gender || "Unisex",
        price: product.price,
        stock: product.count,
        discount: discount || 0
    };

    try {
        const response = await fetch('https://search-optimizer-bibv.onrender.com/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(secondServerData)
        });

        if (!response.ok) {
            console.error('Failed to sync with second server:', response.statusText);
        } else {
            console.log('Product successfully synced with second server');
        }
    } catch (error) {
        console.error('Error syncing with second server:', error.message);
        // Don't fail the main request if second server sync fails
    }

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

// Update product (only by owner)
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, price, count, category, color, brand } = req.body;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if user is the owner
    if (product.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit your own products");
    }

    // Handle new image uploads
    let newImageUrls = [];
    if (req.files && req.files.images && Array.isArray(req.files.images)) {
        for (const file of req.files.images) {
            if (file.path) {
                const image = await uploadOnCloudinary(file.path);
                if (!image) {
                    throw new ApiError(500, "Image upload failed");
                }
                newImageUrls.push(image.url);
            }
        }
    }

    // Update fields only if provided
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (count !== undefined) updateData.count = parseInt(count);
    if (category) updateData.category = category.trim();
    if (color) updateData.color = color.trim();
    if (brand) updateData.brand = brand.trim();
    
   // Replace images if new ones are uploaded
if (newImageUrls.length > 0) {
    updateData.images = newImageUrls; // ✅ Replace existing images
}

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product updated successfully")
    );
});

// Delete product (only by owner)
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if user is the owner
    if (product.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own products");
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Product deleted successfully")
    );
});

// Get all products with filtering, pagination, and search
const getAllProducts = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        search, 
        category, 
        brand, 
        color, 
        minPrice, 
        maxPrice,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = req.query;

    // Build filter object
    let filter = {};
    
    // Search functionality
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } }
        ];
    }
    
    // Category filter
    if (category) {
        filter.category = { $regex: category, $options: "i" };
    }
    
    // Brand filter
    if (brand) {
        filter.brand = { $regex: brand, $options: "i" };
    }
    
    // Color filter
    if (color) {
        filter.color = { $regex: color, $options: "i" };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const products = await Product.find(filter)
        .populate("owner", "username fullName")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
                limit: parseInt(limit)
            },
            filters: {
                search,
                category,
                brand,
                color,
                minPrice,
                maxPrice,
                sortBy,
                sortOrder
            }
        }, "Products retrieved successfully")
    );
});

export { addProduct, updateProduct, deleteProduct, getAllProducts };
