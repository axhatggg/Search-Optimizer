import { Rating } from "../models/rating.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Add or update a product rating
const rateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be a number between 1 and 5");
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if user is trying to rate their own product
    if (product.owner.toString() === userId.toString()) {
        throw new ApiError(403, "You cannot rate your own product");
    }

    // Check if user has already rated this product
    let existingRating = await Rating.findOne({ product: productId, user: userId });

    if (existingRating) {
        // Update existing rating
        existingRating.rating = parseFloat(rating);
        await existingRating.save();
    } else {
        // Create new rating
        existingRating = await Rating.create({
            product: productId,
            user: userId,
            rating: parseFloat(rating)
        });
    }

    // Recalculate average rating for the product
    await updateProductRating(productId);

    // Get updated product
    const updatedProduct = await Product.findById(productId);

    return res.status(200).json(
        new ApiResponse(200, {
            rating: existingRating,
            product: {
                _id: updatedProduct._id,
                name: updatedProduct.name,
                averageRating: updatedProduct.averageRating,
                totalRatings: updatedProduct.totalRatings
            }
        }, existingRating ? "Rating updated successfully" : "Rating added successfully")
    );
});

// Get all ratings for a product
const getProductRatings = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ product: productId })
        .populate("user", "username fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Rating.countDocuments({ product: productId });

    return res.status(200).json(
        new ApiResponse(200, {
            ratings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRatings: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            },
            productInfo: {
                name: product.name,
                averageRating: product.averageRating,
                totalRatings: product.totalRatings
            }
        }, "Product ratings retrieved successfully")
    );
});

// Get user's rating for a specific product
const getUserProductRating = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({ product: productId, user: userId });

    if (!rating) {
        return res.status(200).json(
            new ApiResponse(200, null, "User has not rated this product")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, rating, "User rating retrieved successfully")
    );
});

// Delete user's rating for a product
const deleteProductRating = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({ product: productId, user: userId });

    if (!rating) {
        throw new ApiError(404, "Rating not found");
    }

    await Rating.findByIdAndDelete(rating._id);

    // Recalculate average rating for the product
    await updateProductRating(productId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Rating deleted successfully")
    );
});

// Helper function to update product's average rating
const updateProductRating = async (productId) => {
    const ratings = await Rating.find({ product: productId });
    
    if (ratings.length === 0) {
        // No ratings, set to 0
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            totalRatings: 0
        });
    } else {
        // Calculate average
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRating / ratings.length;
        
        await Product.findByIdAndUpdate(productId, {
            averageRating: parseFloat(averageRating.toFixed(2)),
            totalRatings: ratings.length
        });
    }
};

export {
    rateProduct,
    getProductRatings,
    getUserProductRating,
    deleteProductRating
};
