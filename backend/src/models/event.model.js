// backend/src/models/event.model.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
	{
		// Basic Info
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			default: "",
		},
		summary: {
			type: String,
			maxlength: 140, // Short summary for cards
			default: "",
		},
		category: {
			type: String,
			default: "Other",
		},
		tags: [{
			type: String,
		}],

		// Media
		imageUrl: {
			type: String,
			required: true,
		},
		galleryImages: [{
			type: String,
		}],

		// Date & Time
		eventDate: {
			type: Date,
			required: true,
		},
		eventTime: {
			type: String,
			required: true,
		},
		endDate: {
			type: Date,
			default: null,
		},
		endTime: {
			type: String,
			default: null,
		},
		timezone: {
			type: String,
			default: "America/New_York",
		},

		// Location
		locationType: {
			type: String,
			enum: ["venue", "online", "tba"],
			default: "venue",
		},
		location: {
			type: String,
			required: true,
		},
		venue: {
			type: String,
			default: null,
		},
		address: {
			street: { type: String, default: "" },
			city: { type: String, default: "" },
			state: { type: String, default: "" },
			zipCode: { type: String, default: "" },
			country: { type: String, default: "USA" },
		},
		coordinates: {
			lat: { type: Number, default: null },
			lng: { type: Number, default: null },
		},
		onlineEventUrl: {
			type: String,
			default: null,
		},

		// Tickets & Capacity
		capacity: {
			type: Number,
			required: true,
			min: 1,
		},
		ticketsAvailable: {
			type: Number,
			required: true,
			min: 0,
		},
		ticketPrice: {
			type: Number,
			default: 0,
			min: 0,
		},
		ticketTypes: [{
			name: { type: String, default: "General Admission" },
			price: { type: Number, default: 0 },
			quantity: { type: Number, default: 0 },
			sold: { type: Number, default: 0 },
			description: { type: String, default: "" },
			salesStart: { type: Date, default: null },
			salesEnd: { type: Date, default: null },
		}],
		maxTicketsPerOrder: {
			type: Number,
			default: 10,
		},

		// Event Highlights (Eventbrite style)
		highlights: {
			duration: { type: String, default: null }, // e.g., "5 hours", "2 days"
			ageRestriction: { type: String, default: null }, // e.g., "21+", "All ages", "18+"
			format: { type: String, enum: ["in-person", "online", "hybrid"], default: "in-person" },
			parking: { type: String, default: null }, // e.g., "Free parking", "Paid parking", "Street parking"
			dresscode: { type: String, default: null }, // e.g., "Casual", "Business casual", "Formal"
			language: { type: String, default: "English" },
			accessibility: { type: String, default: null },
		},

		// Policies
		refundPolicy: {
			type: String,
			enum: ["no-refunds", "1-day", "7-days", "30-days", "flexible", "custom"],
			default: "no-refunds",
		},
		refundPolicyText: {
			type: String,
			default: "",
		},

		// Organizer Contact
		contactEmail: {
			type: String,
			default: null,
		},
		contactPhone: {
			type: String,
			default: null,
		},
		organizerName: {
			type: String,
			default: null,
		},
		organizerDescription: {
			type: String,
			default: null,
		},
		socialLinks: {
			website: { type: String, default: null },
			facebook: { type: String, default: null },
			twitter: { type: String, default: null },
			instagram: { type: String, default: null },
		},

		// Status & Visibility
		status: {
			type: String,
			enum: ["draft", "published", "upcoming", "ongoing", "completed", "cancelled", "postponed"],
			default: "upcoming",
		},
		visibility: {
			type: String,
			enum: ["public", "private", "unlisted"],
			default: "public",
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},

		// Creator
		createdBy: {
			type: String, // Clerk user ID
			required: true,
		},

		// Attendees
		attendees: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Ticket",
		}],

		// Analytics
		views: {
			type: Number,
			default: 0,
		},
		saves: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes for searching and filtering
eventSchema.index({ title: "text", description: "text", location: "text" });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ status: 1 });

// Virtual for checking if event is sold out
eventSchema.virtual("isSoldOut").get(function() {
	return this.ticketsAvailable === 0;
});

// Virtual for checking if event has ended
eventSchema.virtual("hasEnded").get(function() {
	const endDateTime = this.endDate || this.eventDate;
	return new Date() > endDateTime;
});

export const Event = mongoose.model("Event", eventSchema);