// backend/src/routes/admin.route.js
import { Router } from "express";
import {
	checkAdmin,
	deleteEventAdmin,
	getAllEventsAdmin,
	updateEventStatusAdmin,
	getAllTicketSales,
	getEventRevenue,
	getStats,
} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);
router.get("/stats", getStats);

// Event Management
router.get("/events", getAllEventsAdmin);
router.delete("/events/:id", deleteEventAdmin);
router.patch("/events/:id/status", updateEventStatusAdmin);

// Ticket & Revenue
router.get("/tickets/sales", getAllTicketSales);
router.get("/events/:id/revenue", getEventRevenue);

export default router;