import { Router } from "express";
import { addProduct } from "../controllers/product.controller.js";
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

export default router;
