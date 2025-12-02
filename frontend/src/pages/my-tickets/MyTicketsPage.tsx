// frontend/src/pages/my-tickets/MyTicketsPage.tsx
import { useEffect, useState } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { useUser } from "@clerk/clerk-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import {
	Ticket,
	Calendar,
	MapPin,
	Clock,
	QrCode,
	X,
	AlertTriangle,
	CheckCircle,
	XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const MyTicketsPage = () => {
	const { user, isSignedIn } = useUser();
	const navigate = useNavigate();
	const { myTickets, fetchMyTickets, cancelTicket, isLoading } = useEventStore();
	const [selectedTicket, setSelectedTicket] = useState<any>(null);
	const [qrDialogOpen, setQrDialogOpen] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);

	useEffect(() => {
		if (!isSignedIn) {
			navigate("/");
			return;
		}
		fetchMyTickets();
	}, [isSignedIn, navigate, fetchMyTickets]);

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (timeString: string) => {
		if (!timeString) return "";
		const [hours, minutes] = timeString.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const hour12 = hour % 12 || 12;
		return `${hour12}:${minutes} ${ampm}`;
	};

	const handleCancelTicket = async () => {
		if (!selectedTicket) return;
		
		setIsCancelling(true);
		try {
			await cancelTicket(selectedTicket.ticket._id);
			toast.success("Ticket cancelled successfully");
			setCancelDialogOpen(false);
			setSelectedTicket(null);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to cancel ticket");
		} finally {
			setIsCancelling(false);
		}
	};

	// Separate tickets into upcoming and past
	const now = new Date();
	const upcomingTickets = myTickets.filter((booking) => {
		if (!booking.event) return false;
		const eventDate = new Date(booking.event.eventDate);
		return eventDate >= now && booking.ticket.bookingStatus !== "cancelled";
	});

	const pastTickets = myTickets.filter((booking) => {
		if (!booking.event) return false;
		const eventDate = new Date(booking.event.eventDate);
		return eventDate < now || booking.ticket.bookingStatus === "cancelled";
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "confirmed":
				return (
					<span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded flex items-center gap-1">
						<CheckCircle className="size-3" />
						Confirmed
					</span>
				);
			case "cancelled":
				return (
					<span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded flex items-center gap-1">
						<XCircle className="size-3" />
						Cancelled
					</span>
				);
			default:
				return (
					<span className="px-2 py-1 bg-zinc-500/20 text-zinc-400 text-xs font-semibold rounded">
						{status}
					</span>
				);
		}
	};

	const TicketCard = ({ booking }: { booking: any }) => {
		const { ticket, event } = booking;
		
		if (!event) {
			return (
				<Card className="bg-zinc-800/50 border-zinc-700">
					<CardContent className="p-4">
						<p className="text-zinc-400">Event no longer available</p>
					</CardContent>
				</Card>
			);
		}

		const isPast = new Date(event.eventDate) < now;
		const isCancelled = ticket.bookingStatus === "cancelled";

		return (
			<Card className={`bg-zinc-800/50 border-zinc-700 overflow-hidden ${isCancelled ? "opacity-60" : ""}`}>
				<div className="flex flex-col md:flex-row">
					{/* Event Image */}
					<div className="md:w-48 h-32 md:h-auto relative">
						<img
							src={event.imageUrl}
							alt={event.title}
							className="w-full h-full object-cover"
						/>
						<div className="absolute top-2 left-2">
							{getStatusBadge(ticket.bookingStatus)}
						</div>
					</div>

					{/* Content */}
					<CardContent className="flex-1 p-4">
						<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
							{/* Event Info */}
							<div className="flex-1">
								<Link to={`/events/${event._id}`}>
									<h3 className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors">
										{event.title}
									</h3>
								</Link>
								
								<div className="mt-2 space-y-1 text-sm text-zinc-400">
									<div className="flex items-center gap-2">
										<Calendar className="size-4 text-emerald-500" />
										<span>{formatDate(event.eventDate)}</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="size-4 text-emerald-500" />
										<span>{formatTime(event.eventTime)}</span>
									</div>
									<div className="flex items-center gap-2">
										<MapPin className="size-4 text-emerald-500" />
										<span>{event.venue || event.location}</span>
									</div>
								</div>

								{/* Ticket Details */}
								<div className="mt-3 p-3 bg-zinc-900/50 rounded-lg">
									<div className="flex items-center justify-between text-sm">
										<span className="text-zinc-400">Ticket #</span>
										<span className="text-white font-mono">{ticket.ticketNumber}</span>
									</div>
									<div className="flex items-center justify-between text-sm mt-1">
										<span className="text-zinc-400">Quantity</span>
										<span className="text-white">{ticket.quantity}</span>
									</div>
									<div className="flex items-center justify-between text-sm mt-1">
										<span className="text-zinc-400">Total Paid</span>
										<span className="text-emerald-400 font-semibold">
											${ticket.totalPrice?.toFixed(2) || "0.00"}
										</span>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex flex-row md:flex-col gap-2">
								{!isCancelled && !isPast && (
									<>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedTicket(booking);
												setQrDialogOpen(true);
											}}
											className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
										>
											<QrCode className="size-4 mr-1" />
											QR Code
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedTicket(booking);
												setCancelDialogOpen(true);
											}}
											className="border-red-500/50 text-red-400 hover:bg-red-500/10"
										>
											<X className="size-4 mr-1" />
											Cancel
										</Button>
									</>
								)}
								<Link to={`/events/${event._id}`}>
									<Button
										variant="outline"
										size="sm"
										className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
									>
										View Event
									</Button>
								</Link>
							</div>
						</div>
					</CardContent>
				</div>
			</Card>
		);
	};

	if (!isSignedIn) {
		return null;
	}

	return (
		<div className="h-full bg-gradient-to-b from-zinc-900 to-zinc-950">
			<ScrollArea className="h-full">
				<div className="max-w-4xl mx-auto px-6 py-8">
					{/* Header */}
					<div className="flex items-center gap-3 mb-8">
						<div className="p-3 bg-purple-500/20 rounded-xl">
							<Ticket className="size-8 text-purple-400" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-white">My Tickets</h1>
							<p className="text-zinc-400">Events you're attending</p>
						</div>
					</div>

					{/* Tabs */}
					<Tabs defaultValue="upcoming" className="space-y-6">
						<TabsList className="bg-zinc-800/50 border border-zinc-700">
							<TabsTrigger value="upcoming" className="data-[state=active]:bg-emerald-500">
								Upcoming ({upcomingTickets.length})
							</TabsTrigger>
							<TabsTrigger value="past" className="data-[state=active]:bg-zinc-600">
								Past ({pastTickets.length})
							</TabsTrigger>
						</TabsList>

						{/* Upcoming Tickets */}
						<TabsContent value="upcoming" className="space-y-4">
							{isLoading ? (
								<div className="flex items-center justify-center h-48">
									<div className="size-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
								</div>
							) : upcomingTickets.length === 0 ? (
								<div className="text-center py-16">
									<Ticket className="size-16 mx-auto text-zinc-600 mb-4" />
									<h3 className="text-xl font-semibold text-white mb-2">No Upcoming Tickets</h3>
									<p className="text-zinc-400 mb-6">You haven't booked any events yet</p>
									<Link to="/browse">
										<Button className="bg-emerald-500 hover:bg-emerald-600">
											Browse Events
										</Button>
									</Link>
								</div>
							) : (
								upcomingTickets.map((booking) => (
									<TicketCard key={booking.ticket._id} booking={booking} />
								))
							)}
						</TabsContent>

						{/* Past Tickets */}
						<TabsContent value="past" className="space-y-4">
							{pastTickets.length === 0 ? (
								<div className="text-center py-16">
									<Calendar className="size-16 mx-auto text-zinc-600 mb-4" />
									<h3 className="text-xl font-semibold text-white mb-2">No Past Tickets</h3>
									<p className="text-zinc-400">Your past events will appear here</p>
								</div>
							) : (
								pastTickets.map((booking) => (
									<TicketCard key={booking.ticket._id} booking={booking} />
								))
							)}
						</TabsContent>
					</Tabs>
				</div>
			</ScrollArea>

			{/* QR Code Dialog */}
			<Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle>Your Ticket QR Code</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Show this at the event entrance
						</DialogDescription>
					</DialogHeader>
					{selectedTicket && (
						<div className="flex flex-col items-center py-6">
							{/* QR Code Placeholder */}
							<div className="size-48 bg-white rounded-xl flex items-center justify-center mb-4">
								<QrCode className="size-32 text-zinc-900" />
							</div>
							<p className="text-sm text-zinc-400 mb-2">Ticket Number</p>
							<p className="text-lg font-mono text-white">{selectedTicket.ticket.ticketNumber}</p>
							<p className="text-sm text-zinc-500 mt-2">{selectedTicket.event?.title}</p>
							<p className="text-sm text-zinc-500">
								{formatDate(selectedTicket.event?.eventDate)} at {formatTime(selectedTicket.event?.eventTime)}
							</p>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Cancel Confirmation Dialog */}
			<Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="size-5 text-amber-500" />
							Cancel Ticket
						</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Are you sure you want to cancel this ticket?
						</DialogDescription>
					</DialogHeader>
					{selectedTicket && (
						<div className="py-4">
							<div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
								<p className="text-white font-semibold">{selectedTicket.event?.title}</p>
								<p className="text-sm text-zinc-400 mt-1">
									{formatDate(selectedTicket.event?.eventDate)}
								</p>
								<p className="text-sm text-zinc-400">
									Ticket: {selectedTicket.ticket.ticketNumber}
								</p>
							</div>
							
							<div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
								<p className="text-amber-400 text-sm">
									⚠️ Refund policy: {selectedTicket.event?.refundPolicy || "No refunds"}
								</p>
							</div>

							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={() => setCancelDialogOpen(false)}
									className="flex-1 border-zinc-700"
								>
									Keep Ticket
								</Button>
								<Button
									onClick={handleCancelTicket}
									disabled={isCancelling}
									className="flex-1 bg-red-500 hover:bg-red-600"
								>
									{isCancelling ? "Cancelling..." : "Cancel Ticket"}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default MyTicketsPage;