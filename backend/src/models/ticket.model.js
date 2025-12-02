// backend/src/models/ticket.model.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
	{
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			required: true,
		},
		userId: {
			type: String, // Clerk user ID
			required: true,
		},
		ticketNumber: {
			type: String,
			required: true,
			unique: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
			max: 10,
		},
		totalPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		bookingStatus: {
			type: String,
			enum: ["confirmed", "cancelled", "pending"],
			default: "confirmed",
		},
		bookingDate: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
ticketSchema.index({ userId: 1, eventId: 1 });
ticketSchema.index({ ticketNumber: 1 });

export const Ticket = mongoose.model("Ticket", ticketSchema);