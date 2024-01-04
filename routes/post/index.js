import express from "express";
import { createPost, getImageUploadUrl } from "../../controllers/post/index.js";
import verifyJwt from "../../middleware/verifyJwt.js";

const router = express.Router();

router.get("/image-upload-url", getImageUploadUrl);
router.post("/create-post", verifyJwt, createPost);

export default router;
