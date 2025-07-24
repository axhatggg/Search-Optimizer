import { Router } from "express";
import { addProduct } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/test").post((req, res) => {
    return res.json({ message: "Test route works!", body: req.body });
});

router.route("/upload-test").post(
    upload.single("testImage"),
    (req, res) => {
        console.log("File received:", req.file);
        return res.json({ 
            message: "File upload test", 
            fileReceived: !!req.file,
            file: req.file 
        });
    }
);



router.route("/add").post(
    upload.fields([
        { name: "images", maxCount: 1 }
    ]),
    addProduct
);

export default router;
