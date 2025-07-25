import { Router } from "express";
import { addProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();





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
