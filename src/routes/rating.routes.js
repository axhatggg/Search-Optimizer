import { Router } from "express";
import {
    rateProduct,
    getProductRatings,
    getUserProductRating,
    deleteProductRating
} from "../controllers/rating.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All rating routes require authentication
router.use(verifyJWT);

// Rate a product (or update existing rating)
router.route("/product/:productId").post(rateProduct);

// Get all ratings for a product
router.route("/product/:productId/all").get(getProductRatings);

// Get user's rating for a specific product
router.route("/product/:productId/user").get(getUserProductRating);

// Delete user's rating for a product
router.route("/product/:productId").delete(deleteProductRating);

export default router;
