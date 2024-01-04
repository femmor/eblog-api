import express from "express";
import {
  signUp,
  signIn,
  googleAuthentication,
} from "../../controllers/auth/index.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/google-auth", googleAuthentication);

export default router;
