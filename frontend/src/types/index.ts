// frontend/src/types/index.ts
export interface Event {
	_id: string;
	title: string;
	description: string;
	category: "Conference" | "Workshop" | "Meetup" | "Webinar" | "Concert" | "Sports" | "Other";
	imageUrl: string;
	createdBy: string;
	eventDate: string;
	eventTime: string;
	location: string;
	capacity: number;
	ticketsAvailable: number;
	ticketPrice: number;
	status: "upcoming" | "ongoing" | "completed" | "cancelled";
	attendees: Ticket[];
	createdAt: string;
	updatedAt: string;
	ticketDetails?: {
		_id: string;
		ticketNumber: string;
		quantity: number;
		totalPrice: number;
		bookingStatus: "confirmed" | "pending" | "cancelled";
		bookingDate: string;
	};
}

export interface Ticket {
	_id: string;
	eventId: string;
	userId: string;
	ticketNumber: string;
	quantity: number;
	totalPrice: number;
	bookingStatus: "confirmed" | "pending" | "cancelled";
	bookingDate: string;
	createdAt: string;
	updatedAt: string;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
}