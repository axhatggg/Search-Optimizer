import { Router } from "express";
import { addProduct, updateProduct, deleteProduct, getAllProducts } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.route("/").get(getAllProducts);

// Protected routes (authentication required)
router.route("/add").post(
    verifyJWT,
    upload.fields([
        { name: "images", maxCount: 5 }
    ]),
    addProduct
);

router.route("/:id").put(
    verifyJWT,
    upload.fields([
        { name: "images", maxCount: 5 }
    ]),
    updateProduct
);

router.route("/:id").delete(verifyJWT, deleteProduct);

export default router;
