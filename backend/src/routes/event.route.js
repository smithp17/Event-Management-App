// backend/src/routes/event.route.js
import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	getAllEvents,
	getFeaturedEvents,
	getEventById,
	searchEvents,
	getUserEvents,
	getUserBookedEvents,
	createEvent,
	updateEvent,
	deleteEvent,
	bookTicket,
	cancelTicket,
	getAdminStats,
	getAllEventsAdmin,
} from "../controller/event.controller.js";

const router = Router();

// ==========================================
// PUBLIC ROUTES - NO AUTH REQUIRED
// These MUST come first and NOT use protectRoute
// ==========================================

// GET /api/events - Get all events (PUBLIC)
router.get("/", getAllEvents);

// GET /api/events/featured - Get featured events (PUBLIC)
router.get("/featured", getFeaturedEvents);

// GET /api/events/search - Search events (PUBLIC)
router.get("/search", searchEvents);

// ==========================================
// PROTECTED ROUTES - AUTH REQUIRED
// These use protectRoute middleware
// ==========================================

// User-specific routes
router.get("/user/my-events", protectRoute, getUserEvents);
router.get("/user/my-tickets", protectRoute, getUserBookedEvents);

// Admin routes
router.get("/admin/stats", protectRoute, getAdminStats);
router.get("/admin/all", protectRoute, getAllEventsAdmin);

// CRUD operations
router.post("/", protectRoute, createEvent);
router.put("/:eventId", protectRoute, updateEvent);
router.delete("/:eventId", protectRoute, deleteEvent);

// Booking
router.post("/:eventId/book", protectRoute, bookTicket);
router.post("/tickets/:ticketId/cancel", protectRoute, cancelTicket);

// ==========================================
// SINGLE EVENT BY ID - PUBLIC
// Must be LAST because :eventId is a wildcard
// ==========================================
router.get("/:eventId", getEventById);

export default router;