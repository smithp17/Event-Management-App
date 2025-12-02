import { Event } from "../models/event.model.js";
import { Ticket } from "../models/ticket.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

// helper function for cloudinary uploads
const uploadToCloudinary = async (file) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
		});
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

// ============ EVENT ADMIN FUNCTIONS ============

// Get all events (admin view)
export const getAllEventsAdmin = async (req, res, next) => {
	try {
		const events = await Event.find().sort({ createdAt: -1 });
		res.status(200).json(events);
	} catch (error) {
		next(error);
	}
};

// Delete any event (admin only)
export const deleteEventAdmin = async (req, res, next) => {
	try {
		const { id } = req.params;

		const event = await Event.findById(id);

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Delete all associated tickets
		await Ticket.deleteMany({ eventId: id });

		// Delete event
		await Event.findByIdAndDelete(id);

		res.status(200).json({ message: "Event deleted successfully" });
	} catch (error) {
		console.log("Error in deleteEventAdmin", error);
		next(error);
	}
};

// Update event status (admin only)
export const updateEventStatusAdmin = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		const validStatuses = ["upcoming", "ongoing", "completed", "cancelled"];

		if (!validStatuses.includes(status)) {
			return res.status(400).json({ message: "Invalid status" });
		}

		const event = await Event.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		);

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		res.status(200).json(event);
	} catch (error) {
		next(error);
	}
};

// Get all ticket sales
export const getAllTicketSales = async (req, res, next) => {
	try {
		const tickets = await Ticket.find({
			bookingStatus: "confirmed",
		})
			.populate("eventId", "title category")
			.sort({ createdAt: -1 });

		res.status(200).json(tickets);
	} catch (error) {
		next(error);
	}
};

// Get event revenue
export const getEventRevenue = async (req, res, next) => {
	try {
		const { id } = req.params;

		const revenue = await Ticket.aggregate([
			{
				$match: {
					eventId: new mongoose.Types.ObjectId(id),
					bookingStatus: "confirmed",
				},
			},
			{
				$group: {
					_id: "$eventId",
					totalRevenue: { $sum: "$totalPrice" },
					totalTickets: { $sum: "$quantity" },
				},
			},
		]);

		res.status(200).json(revenue[0] || { totalRevenue: 0, totalTickets: 0 });
	} catch (error) {
		next(error);
	}
};

// Get dashboard stats
export const getStats = async (req, res, next) => {
	try {
		const [
			totalEvents,
			totalTicketsSold,
			totalUsers,
			upcomingEvents,
			totalRevenue,
		] = await Promise.all([
			Event.countDocuments(),
			Ticket.countDocuments({ bookingStatus: "confirmed" }),
			User.countDocuments(),
			Event.countDocuments({ status: "upcoming" }),
			Ticket.aggregate([
				{
					$match: { bookingStatus: "confirmed" },
				},
				{
					$group: {
						_id: null,
						total: { $sum: "$totalPrice" },
					},
				},
			]),
		]);

		res.status(200).json({
			totalEvents,
			totalTicketsSold,
			totalUsers,
			upcomingEvents,
			totalRevenue: totalRevenue[0]?.total || 0,
		});
	} catch (error) {
		next(error);
	}
};

// Check admin status
export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true });
};