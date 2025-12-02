// frontend/src/stores/useAdminStore.ts
import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

interface Event {
	_id: string;
	title: string;
	description?: string;
	category: string;
	imageUrl: string;
	eventDate: string;
	eventTime: string;
	location: string;
	ticketPrice: number;
	capacity: number;
	ticketsAvailable: number;
	status?: string;
	createdBy?: string;
	createdAt?: string;
}

interface AdminStats {
	totalEvents: number;
	upcomingEvents: number;
	totalTickets: number;
	totalRevenue: number;
	recentEvents: Event[];
}

interface AdminStore {
	stats: AdminStats | null;
	allEvents: Event[];
	isLoading: boolean;
	error: string | null;

	fetchAdminStats: () => Promise<void>;
	fetchAllEvents: () => Promise<void>;
	deleteEvent: (eventId: string) => Promise<void>;
	updateEvent: (eventId: string, data: Partial<Event>) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
	stats: null,
	allEvents: [],
	isLoading: false,
	error: null,

	fetchAdminStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/events/admin/stats");
			set({ stats: response.data, isLoading: false });
		} catch (error: any) {
			set({
				error: error.response?.data?.message || "Failed to fetch stats",
				isLoading: false,
			});
		}
	},

	fetchAllEvents: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/events/admin/all");
			set({ allEvents: response.data, isLoading: false });
		} catch (error: any) {
			set({
				error: error.response?.data?.message || "Failed to fetch events",
				isLoading: false,
			});
		}
	},

	deleteEvent: async (eventId: string) => {
		try {
			await axiosInstance.delete(`/events/${eventId}`);
			set((state) => ({
				allEvents: state.allEvents.filter((e) => e._id !== eventId),
			}));
			// Refresh stats
			get().fetchAdminStats();
		} catch (error: any) {
			throw error;
		}
	},

	updateEvent: async (eventId: string, data: Partial<Event>) => {
		try {
			const response = await axiosInstance.put(`/events/${eventId}`, data);
			set((state) => ({
				allEvents: state.allEvents.map((e) =>
					e._id === eventId ? response.data : e
				),
			}));
		} catch (error: any) {
			throw error;
		}
	},
}));