// backend/src/controller/event.controller.js
import { Event } from "../models/event.model.js";
import { Ticket } from "../models/ticket.model.js";
import fs from "fs";

// Helper function to convert file to base64
const fileToBase64 = (file) => {
	try {
		const fileBuffer = fs.readFileSync(file.tempFilePath);
		const base64String = fileBuffer.toString("base64");
		const mimeType = file.mimetype || "image/jpeg";
		return `data:${mimeType};base64,${base64String}`;
	} catch (error) {
		console.error("Error converting file to base64:", error);
		throw new Error("Failed to process image");
	}
};

// ==========================================
// PUBLIC ENDPOINTS - NO AUTH REQUIRED
// ==========================================

// GET /api/events - Get ALL events (PUBLIC)
export const getAllEvents = async (req, res, next) => {
	try {
		console.log("\n========================================");
		console.log("📋 GET /api/events - PUBLIC ENDPOINT");
		console.log("========================================");
		
		// Fetch ALL events from database - NO FILTERING
		const events = await Event.find({}).sort({ createdAt: -1 });
		
		console.log(`✅ Found ${events.length} total events in database`);
		
		// Log each event for debugging
		if (events.length > 0) {
			events.forEach((e, i) => {
				console.log(`   ${i + 1}. "${e.title}" - by ${e.createdBy}`);
			});
		} else {
			console.log("   ⚠️ No events in database!");
		}
		
		console.log("========================================\n");
		
		return res.status(200).json(events);
	} catch (error) {
		console.error("❌ Error in getAllEvents:", error);
		next(error);
	}
};

// GET /api/events/featured - Get featured events (PUBLIC)
export const getFeaturedEvents = async (req, res, next) => {
	try {
		console.log("📋 GET /api/events/featured - PUBLIC");
		
		const totalEvents = await Event.countDocuments();
		
		if (totalEvents === 0) {
			return res.status(200).json([]);
		}

		const events = await Event.aggregate([
			{ $sample: { size: Math.min(8, totalEvents) } },
		]);

		console.log(`✅ Returning ${events.length} featured events`);
		res.status(200).json(events);
	} catch (error) {
		console.error("❌ Error in getFeaturedEvents:", error);
		next(error);
	}
};

// GET /api/events/search - Search events (PUBLIC)
export const searchEvents = async (req, res, next) => {
	try {
		const { q } = req.query;
		console.log("📋 GET /api/events/search - PUBLIC - query:", q);

		let query = {};
		if (q) {
			query.$or = [
				{ title: { $regex: q, $options: "i" } },
				{ description: { $regex: q, $options: "i" } },
				{ location: { $regex: q, $options: "i" } },
			];
		}

		const events = await Event.find(query).sort({ eventDate: 1 });
		console.log(`✅ Found ${events.length} events`);
		
		res.status(200).json(events);
	} catch (error) {
		console.error("❌ Error in searchEvents:", error);
		next(error);
	}
};

// GET /api/events/:eventId - Get single event (PUBLIC)
export const getEventById = async (req, res, next) => {
	try {
		const { eventId } = req.params;
		console.log("📋 GET /api/events/:id - PUBLIC -", eventId);

		const event = await Event.findById(eventId);

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Increment views
		event.views = (event.views || 0) + 1;
		await event.save();

		console.log(`✅ Returning event: "${event.title}"`);
		res.status(200).json(event);
	} catch (error) {
		console.error("❌ Error in getEventById:", error);
		next(error);
	}
};

// ==========================================
// PROTECTED ENDPOINTS - AUTH REQUIRED
// ==========================================

// GET /api/events/user/my-events - Get events created by current user
export const getUserEvents = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		console.log("📋 GET /api/events/user/my-events - User:", userId);
		
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const events = await Event.find({ createdBy: userId }).sort({ createdAt: -1 });
		
		// Add stats for each event
		const eventsWithStats = await Promise.all(events.map(async (event) => {
			const ticketStats = await Ticket.aggregate([
				{ $match: { eventId: event._id, bookingStatus: { $ne: "cancelled" } } },
				{ $group: { _id: null, totalTickets: { $sum: "$quantity" }, totalRevenue: { $sum: "$totalPrice" } } },
			]);
			const stats = ticketStats[0] || { totalTickets: 0, totalRevenue: 0 };
			return {
				...event.toObject(),
				stats: { ticketsSold: stats.totalTickets, revenue: stats.totalRevenue },
			};
		}));

		console.log(`✅ Found ${eventsWithStats.length} events for user`);
		res.status(200).json(eventsWithStats);
	} catch (error) {
		console.error("❌ Error in getUserEvents:", error);
		next(error);
	}
};

// GET /api/events/user/my-tickets - Get tickets purchased by current user
export const getUserBookedEvents = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		console.log("📋 GET /api/events/user/my-tickets - User:", userId);

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 }).populate("eventId");

		const bookings = tickets.map(ticket => ({
			ticket: {
				_id: ticket._id,
				ticketNumber: ticket.ticketNumber,
				ticketType: ticket.ticketType,
				quantity: ticket.quantity,
				totalPrice: ticket.totalPrice,
				bookingStatus: ticket.bookingStatus,
				paymentStatus: ticket.paymentStatus,
				qrCode: ticket.qrCode,
				createdAt: ticket.createdAt,
			},
			event: ticket.eventId,
		}));

		console.log(`✅ Found ${bookings.length} tickets for user`);
		res.status(200).json(bookings);
	} catch (error) {
		console.error("❌ Error in getUserBookedEvents:", error);
		next(error);
	}
};

// POST /api/events - Create event
export const createEvent = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		console.log("📝 POST /api/events - Creating event for user:", userId);

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const {
			title, description, summary, category, tags,
			eventDate, eventTime, endDate, endTime,
			locationType, location, venue, address, onlineEventUrl,
			capacity, ticketPrice, maxTicketsPerOrder,
			highlights, refundPolicy, refundPolicyText,
			contactEmail, contactPhone, organizerName, organizerDescription, socialLinks,
		} = req.body;

		// Handle image
		let imageUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800";
		if (req.files?.imageFile) {
			imageUrl = fileToBase64(req.files.imageFile);
			console.log("✅ Image converted to base64");
		}

		// Parse JSON fields safely
		const parseJSON = (str) => {
			if (!str) return {};
			if (typeof str === 'object') return str;
			try { return JSON.parse(str); } catch { return {}; }
		};
		
		const parseTags = (str) => {
			if (!str) return [];
			if (Array.isArray(str)) return str;
			return str.split(',').map(t => t.trim()).filter(Boolean);
		};

		const newEvent = new Event({
			title,
			description: description || "",
			summary: summary || "",
			category: category || "Other",
			tags: parseTags(tags),
			imageUrl,
			eventDate: new Date(eventDate),
			eventTime,
			endDate: endDate ? new Date(endDate) : null,
			endTime: endTime || null,
			locationType: locationType || "venue",
			location,
			venue: venue || null,
			address: parseJSON(address),
			onlineEventUrl: onlineEventUrl || null,
			capacity: parseInt(capacity) || 100,
			ticketsAvailable: parseInt(capacity) || 100,
			ticketPrice: parseFloat(ticketPrice) || 0,
			maxTicketsPerOrder: parseInt(maxTicketsPerOrder) || 10,
			highlights: parseJSON(highlights),
			refundPolicy: refundPolicy || "no-refunds",
			refundPolicyText: refundPolicyText || "",
			contactEmail: contactEmail || null,
			contactPhone: contactPhone || null,
			organizerName: organizerName || null,
			organizerDescription: organizerDescription || null,
			socialLinks: parseJSON(socialLinks),
			createdBy: userId,
			status: "upcoming",
			visibility: "public",
		});

		await newEvent.save();
		console.log("✅ Event created:", newEvent._id, "-", newEvent.title);

		res.status(201).json(newEvent);
	} catch (error) {
		console.error("❌ Error in createEvent:", error);
		next(error);
	}
};

// PUT /api/events/:eventId - Update event
export const updateEvent = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		const userEmail = req.auth?.email;
		const { eventId } = req.params;
		
		console.log("📝 PUT /api/events/:id - Updating:", eventId);

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const event = await Event.findById(eventId);
		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Check ownership or admin
		const adminEmail = process.env.ADMIN_EMAIL;
		const isAdmin = userEmail && adminEmail && userEmail.toLowerCase() === adminEmail.toLowerCase();
		
		if (event.createdBy !== userId && !isAdmin) {
			return res.status(403).json({ message: "You can only edit your own events" });
		}

		// Update fields
		const fields = [
			'title', 'description', 'summary', 'category', 'eventDate', 'eventTime',
			'endDate', 'endTime', 'locationType', 'location', 'venue', 'onlineEventUrl',
			'capacity', 'ticketsAvailable', 'ticketPrice', 'maxTicketsPerOrder',
			'refundPolicy', 'refundPolicyText', 'contactEmail', 'contactPhone',
			'organizerName', 'organizerDescription', 'status'
		];

		fields.forEach(field => {
			if (req.body[field] !== undefined) {
				if (field === 'eventDate' || field === 'endDate') {
					event[field] = req.body[field] ? new Date(req.body[field]) : null;
				} else if (['capacity', 'ticketsAvailable', 'maxTicketsPerOrder'].includes(field)) {
					event[field] = parseInt(req.body[field]) || event[field];
				} else if (field === 'ticketPrice') {
					event[field] = parseFloat(req.body[field]) || 0;
				} else {
					event[field] = req.body[field];
				}
			}
		});

		// Handle JSON fields
		['highlights', 'address', 'socialLinks'].forEach(field => {
			if (req.body[field]) {
				event[field] = typeof req.body[field] === 'string' 
					? JSON.parse(req.body[field]) : req.body[field];
			}
		});
		
		if (req.body.tags) {
			event.tags = typeof req.body.tags === 'string' 
				? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) 
				: req.body.tags;
		}

		// Handle image
		if (req.files?.imageFile) {
			event.imageUrl = fileToBase64(req.files.imageFile);
		}

		await event.save();
		console.log("✅ Event updated:", event._id);

		res.status(200).json(event);
	} catch (error) {
		console.error("❌ Error in updateEvent:", error);
		next(error);
	}
};

// DELETE /api/events/:eventId - Delete event
export const deleteEvent = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		const userEmail = req.auth?.email;
		const { eventId } = req.params;
		
		console.log("📝 DELETE /api/events/:id -", eventId);

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const event = await Event.findById(eventId);
		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Check ownership or admin
		const adminEmail = process.env.ADMIN_EMAIL;
		const isAdmin = userEmail && adminEmail && userEmail.toLowerCase() === adminEmail.toLowerCase();
		
		if (event.createdBy !== userId && !isAdmin) {
			return res.status(403).json({ message: "You can only delete your own events" });
		}

		await Event.findByIdAndDelete(eventId);
		console.log("✅ Event deleted:", eventId);

		res.status(200).json({ message: "Event deleted successfully" });
	} catch (error) {
		console.error("❌ Error in deleteEvent:", error);
		next(error);
	}
};

// POST /api/events/:eventId/book - Book tickets
export const bookTicket = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		const { eventId } = req.params;
		const { quantity = 1 } = req.body;
		
		console.log("🎫 POST /api/events/:id/book - User:", userId, "Event:", eventId);

		if (!userId) {
			return res.status(401).json({ message: "Please sign in to book tickets" });
		}

		const event = await Event.findById(eventId);
		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		if (event.createdBy === userId) {
			return res.status(400).json({ message: "You cannot book tickets for your own event" });
		}

		if (event.ticketsAvailable < quantity) {
			return res.status(400).json({ message: `Only ${event.ticketsAvailable} tickets available` });
		}

		const totalPrice = event.ticketPrice * quantity;
		const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		const ticket = new Ticket({
			eventId: event._id,
			userId,
			ticketType: "General Admission",
			quantity,
			unitPrice: event.ticketPrice,
			totalPrice,
			ticketNumber,
			bookingStatus: "confirmed",
			paymentStatus: "completed",
			qrCode: `EVT-${event._id}-${ticketNumber}`,
		});

		await ticket.save();

		event.ticketsAvailable -= quantity;
		event.attendees = event.attendees || [];
		event.attendees.push(ticket._id);
		await event.save();

		console.log("✅ Ticket booked:", ticket._id);

		res.status(201).json({
			message: "Tickets booked successfully",
			ticket,
			event: { _id: event._id, title: event.title, ticketsAvailable: event.ticketsAvailable },
		});
	} catch (error) {
		console.error("❌ Error in bookTicket:", error);
		next(error);
	}
};

// POST /api/events/tickets/:ticketId/cancel - Cancel ticket
export const cancelTicket = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		const { ticketId } = req.params;
		
		console.log("🎫 POST /api/events/tickets/:id/cancel - User:", userId);

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const ticket = await Ticket.findById(ticketId).populate("eventId");
		if (!ticket) {
			return res.status(404).json({ message: "Ticket not found" });
		}

		if (ticket.userId !== userId) {
			return res.status(403).json({ message: "You can only cancel your own tickets" });
		}

		if (ticket.bookingStatus === "cancelled") {
			return res.status(400).json({ message: "Ticket already cancelled" });
		}

		ticket.bookingStatus = "cancelled";
		await ticket.save();

		// Return tickets to pool
		await Event.findByIdAndUpdate(ticket.eventId._id, {
			$inc: { ticketsAvailable: ticket.quantity },
		});

		console.log("✅ Ticket cancelled:", ticketId);

		res.status(200).json({ message: "Ticket cancelled", ticket });
	} catch (error) {
		console.error("❌ Error in cancelTicket:", error);
		next(error);
	}
};

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// GET /api/events/admin/stats - Admin stats
export const getAdminStats = async (req, res, next) => {
	try {
		const userEmail = req.auth?.email;
		const adminEmail = process.env.ADMIN_EMAIL;
		const isAdmin = userEmail && adminEmail && userEmail.toLowerCase() === adminEmail.toLowerCase();
		
		console.log("👑 GET /api/events/admin/stats");
		console.log("   User email:", userEmail);
		console.log("   Admin email:", adminEmail);
		console.log("   Is admin:", isAdmin);

		if (!isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const totalEvents = await Event.countDocuments();
		const ticketStats = await Ticket.aggregate([
			{ $match: { bookingStatus: "confirmed" } },
			{ $group: { _id: null, totalTickets: { $sum: "$quantity" }, totalRevenue: { $sum: "$totalPrice" } } },
		]);

		const stats = ticketStats[0] || { totalTickets: 0, totalRevenue: 0 };

		res.status(200).json({
			totalEvents,
			totalTickets: stats.totalTickets,
			totalRevenue: stats.totalRevenue,
		});
	} catch (error) {
		console.error("❌ Error in getAdminStats:", error);
		next(error);
	}
};

// GET /api/events/admin/all - All events for admin
export const getAllEventsAdmin = async (req, res, next) => {
	try {
		const userEmail = req.auth?.email;
		const adminEmail = process.env.ADMIN_EMAIL;
		const isAdmin = userEmail && adminEmail && userEmail.toLowerCase() === adminEmail.toLowerCase();
		
		console.log("👑 GET /api/events/admin/all - isAdmin:", isAdmin);

		if (!isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const events = await Event.find().sort({ createdAt: -1 });
		res.status(200).json(events);
	} catch (error) {
		console.error("❌ Error in getAllEventsAdmin:", error);
		next(error);
	}
};