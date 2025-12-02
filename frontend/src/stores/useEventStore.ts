// frontend/src/stores/useEventStore.ts
import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

interface Event {
	_id: string;
	title: string;
	description: string;
	summary?: string;
	category: string;
	tags?: string[];
	imageUrl: string;
	eventDate: string;
	eventTime: string;
	endDate?: string;
	endTime?: string;
	location: string;
	venue?: string;
	address?: {
		street?: string;
		city?: string;
		state?: string;
		zipCode?: string;
	};
	locationType?: string;
	onlineEventUrl?: string;
	capacity: number;
	ticketsAvailable: number;
	ticketPrice: number;
	maxTicketsPerOrder?: number;
	highlights?: {
		duration?: string;
		ageRestriction?: string;
		format?: string;
		parking?: string;
		dresscode?: string;
	};
	refundPolicy?: string;
	refundPolicyText?: string;
	contactEmail?: string;
	contactPhone?: string;
	organizerName?: string;
	organizerDescription?: string;
	socialLinks?: {
		website?: string;
		facebook?: string;
		twitter?: string;
		instagram?: string;
	};
	status?: string;
	visibility?: string;
	createdBy: string;
	views?: number;
	stats?: {
		ticketsSold: number;
		revenue: number;
		attendeesCount: number;
	};
	createdAt: string;
	updatedAt: string;
}

interface Ticket {
	_id: string;
	ticketNumber: string;
	ticketType: string;
	quantity: number;
	totalPrice: number;
	bookingStatus: string;
	paymentStatus: string;
	qrCode: string;
	checkedInAt?: string;
	createdAt: string;
}

interface Booking {
	ticket: Ticket;
	event: Event;
}

interface EventStore {
	// State
	events: Event[];
	myEvents: Event[];
	myTickets: Booking[];
	featuredEvents: Event[];
	currentEvent: Event | null;
	isLoading: boolean;
	error: string | null;

	// Public actions (no auth needed)
	fetchAllEvents: (filters?: Record<string, string>) => Promise<void>;
	fetchFeaturedEvents: () => Promise<void>;
	fetchEventById: (eventId: string) => Promise<void>;
	searchEvents: (query: string) => Promise<void>;

	// Organizer actions (auth required)
	fetchMyEvents: () => Promise<void>;
	createEvent: (eventData: FormData) => Promise<Event>;
	updateEvent: (eventId: string, eventData: FormData) => Promise<Event>;
	deleteEvent: (eventId: string) => Promise<void>;

	// Attendee actions (auth required)
	fetchMyTickets: () => Promise<void>;
	bookTickets: (eventId: string, quantity: number) => Promise<void>;
	cancelTicket: (ticketId: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
	events: [],
	myEvents: [],
	myTickets: [],
	featuredEvents: [],
	currentEvent: null,
	isLoading: false,
	error: null,

	// ============ PUBLIC ACTIONS ============

	fetchAllEvents: async (filters = {}) => {
		set({ isLoading: true, error: null });
		try {
			const params = new URLSearchParams(filters).toString();
			const url = params ? `/events?${params}` : "/events";
			console.log("🌐 Fetching all events from:", url);
			
			const response = await axiosInstance.get(url);
			console.log("✅ Fetched events:", response.data.length);
			
			set({ events: response.data, isLoading: false });
		} catch (error: any) {
			console.error("❌ Error fetching events:", error);
			set({ error: error.message, isLoading: false });
		}
	},

	fetchFeaturedEvents: async () => {
		try {
			console.log("🌐 Fetching featured events");
			const response = await axiosInstance.get("/events/featured");
			console.log("✅ Fetched featured events:", response.data.length);
			set({ featuredEvents: response.data });
		} catch (error: any) {
			console.error("❌ Error fetching featured events:", error);
		}
	},

	fetchEventById: async (eventId: string) => {
		set({ isLoading: true, error: null });
		try {
			console.log("🌐 Fetching event:", eventId);
			const response = await axiosInstance.get(`/events/${eventId}`);
			console.log("✅ Fetched event:", response.data.title);
			set({ currentEvent: response.data, isLoading: false });
		} catch (error: any) {
			console.error("❌ Error fetching event:", error);
			set({ error: error.message, isLoading: false });
		}
	},

	searchEvents: async (query: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/events/search?q=${encodeURIComponent(query)}`);
			set({ events: response.data, isLoading: false });
		} catch (error: any) {
			set({ error: error.message, isLoading: false });
		}
	},

	// ============ ORGANIZER ACTIONS ============

	fetchMyEvents: async () => {
		set({ isLoading: true, error: null });
		try {
			console.log("🌐 Fetching my events");
			const response = await axiosInstance.get("/events/user/my-events");
			console.log("✅ Fetched my events:", response.data.length);
			set({ myEvents: response.data, isLoading: false });
		} catch (error: any) {
			console.error("❌ Error fetching my events:", error);
			set({ error: error.message, isLoading: false });
		}
	},

	createEvent: async (eventData: FormData) => {
		set({ isLoading: true, error: null });
		try {
			console.log("🌐 Creating event");
			const response = await axiosInstance.post("/events", eventData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			console.log("✅ Event created:", response.data._id);
			
			// Add to local state
			set((state) => ({
				myEvents: [response.data, ...state.myEvents],
				events: [response.data, ...state.events],
				isLoading: false,
			}));
			
			return response.data;
		} catch (error: any) {
			console.error("❌ Error creating event:", error);
			set({ error: error.message, isLoading: false });
			throw error;
		}
	},

	updateEvent: async (eventId: string, eventData: FormData) => {
		set({ isLoading: true, error: null });
		try {
			console.log("🌐 Updating event:", eventId);
			const response = await axiosInstance.put(`/events/${eventId}`, eventData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			console.log("✅ Event updated:", response.data._id);

			// Update local state
			set((state) => ({
				myEvents: state.myEvents.map((e) =>
					e._id === eventId ? response.data : e
				),
				events: state.events.map((e) =>
					e._id === eventId ? response.data : e
				),
				currentEvent: state.currentEvent?._id === eventId ? response.data : state.currentEvent,
				isLoading: false,
			}));

			return response.data;
		} catch (error: any) {
			console.error("❌ Error updating event:", error);
			set({ error: error.message, isLoading: false });
			throw error;
		}
	},

	deleteEvent: async (eventId: string) => {
		set({ isLoading: true, error: null });
		try {
			console.log("🌐 Deleting event:", eventId);
			await axiosInstance.delete(`/events/${eventId}`);
			console.log("✅ Event deleted:", eventId);

			// Remove from local state
			set((state) => ({
				myEvents: state.myEvents.filter((e) => e._id !== eventId),
				events: state.events.filter((e) => e._id !== eventId),
				isLoading: false,
			}));
		} catch (error: any) {
			console.error("❌ Error deleting event:", error);
			set({ error: error.message, isLoading: false });
			throw error;
		}
	},

	// ============ ATTENDEE ACTIONS ============

	fetchMyTickets: async () => {
		set({ isLoading: true, error: null });
		try {
			console.log("🌐 Fetching my tickets");
			const response = await axiosInstance.get("/events/user/my-tickets");
			console.log("✅ Fetched my tickets:", response.data.length);
			set({ myTickets: response.data, isLoading: false });
		} catch (error: any) {
			console.error("❌ Error fetching my tickets:", error);
			set({ error: error.message, isLoading: false });
		}
	},

	bookTickets: async (eventId: string, quantity: number) => {
		set({ isLoading: true, error: null });
		try {
			console.log("🌐 Booking tickets for event:", eventId);
			const response = await axiosInstance.post(`/events/${eventId}/book`, { quantity });
			console.log("✅ Tickets booked:", response.data);

			// Update event tickets available
			set((state) => ({
				events: state.events.map((e) =>
					e._id === eventId
						? { ...e, ticketsAvailable: response.data.event.ticketsAvailable }
						: e
				),
				currentEvent: state.currentEvent?._id === eventId
					? { ...state.currentEvent, ticketsAvailable: response.data.event.ticketsAvailable }
					: state.currentEvent,
				isLoading: false,
			}));

			// Refresh tickets
			get().fetchMyTickets();
		} catch (error: any) {
			console.error("❌ Error booking tickets:", error);
			set({ error: error.message, isLoading: false });
			throw error;
		}
	},

	cancelTicket: async (ticketId: string) => {
		set({ isLoading: true, error: null });
		try {
			console.log("🌐 Cancelling ticket:", ticketId);
			await axiosInstance.post(`/events/tickets/${ticketId}/cancel`);
			console.log("✅ Ticket cancelled:", ticketId);

			// Update local state
			set((state) => ({
				myTickets: state.myTickets.map((booking) =>
					booking.ticket._id === ticketId
						? { ...booking, ticket: { ...booking.ticket, bookingStatus: "cancelled" } }
						: booking
				),
				isLoading: false,
			}));
		} catch (error: any) {
			console.error("❌ Error cancelling ticket:", error);
			set({ error: error.message, isLoading: false });
			throw error;
		}
	},
}));