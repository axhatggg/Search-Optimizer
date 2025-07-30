import { Router } from "express";
import { addProduct, updateProduct, deleteProduct, getAllProducts } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.route("/").get(getAllProducts);

// Admin-only routes (admin authentication required)
router.route("/add").post(
    verifyAdmin,
    upload.fields([
        { name: "images", maxCount: 5 }
    ]),
    addProduct
);

router.route("/:id").put(
    verifyAdmin,
    upload.fields([
        { name: "images", maxCount: 5 }
    ]),
    updateProduct
);

router.route("/:id").delete(verifyAdmin, deleteProduct);

export default router;
