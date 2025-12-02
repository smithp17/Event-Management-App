// backend/src/routes/auth.route.js
import { Router } from "express";
import { authCallback, checkAdmin } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

// Auth callback after Clerk sign in
router.post("/callback", protectRoute, authCallback);

// Check if current user is admin
router.get("/check-admin", protectRoute, checkAdmin);

export default router;