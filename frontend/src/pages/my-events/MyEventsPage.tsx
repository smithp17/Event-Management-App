// frontend/src/pages/my-events/MyEventsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useEventStore } from "@/stores/useEventStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import CreateEventDialog from "@/components/events/CreateEventDialog";
import { 
	Calendar,
	MapPin,
	Clock,
	Users,
	DollarSign,
	Eye,
	Edit,
	Trash2,
	Plus,
	BarChart3,
	Ticket,
	TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

const MyEventsPage = () => {
	const { user } = useUser();
	const { myEvents, fetchMyEvents, deleteEvent, isLoading } = useEventStore();
	
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<any>(null);
	const [activeTab, setActiveTab] = useState("all");

	useEffect(() => {
		fetchMyEvents();
	}, [fetchMyEvents]);

	const handleDelete = async () => {
		if (!selectedEvent) return;
		
		try {
			await deleteEvent(selectedEvent._id);
			toast.success("Event deleted successfully");
			setDeleteDialogOpen(false);
			setSelectedEvent(null);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to delete event");
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Filter events
	const upcomingEvents = myEvents.filter(e => 
		new Date(e.eventDate) >= new Date() && e.status !== "cancelled"
	);
	const pastEvents = myEvents.filter(e => 
		new Date(e.eventDate) < new Date() || e.status === "completed"
	);
	const draftEvents = myEvents.filter(e => e.status === "draft");

	// Calculate stats
	const totalRevenue = myEvents.reduce((sum, e) => sum + (e.stats?.revenue || 0), 0);
	const totalTicketsSold = myEvents.reduce((sum, e) => sum + (e.stats?.ticketsSold || 0), 0);
	const totalViews = myEvents.reduce((sum, e) => sum + (e.views || 0), 0);

	const getStatusBadge = (event: any) => {
		const now = new Date();
		const eventDate = new Date(event.eventDate);
		
		if (event.status === "cancelled") {
			return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded">Cancelled</span>;
		}
		if (event.status === "draft") {
			return <span className="px-2 py-0.5 bg-zinc-500/20 text-zinc-400 text-xs font-semibold rounded">Draft</span>;
		}
		if (eventDate < now) {
			return <span className="px-2 py-0.5 bg-zinc-500/20 text-zinc-400 text-xs font-semibold rounded">Completed</span>;
		}
		if (event.ticketsAvailable === 0) {
			return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">Sold Out</span>;
		}
		return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded">Active</span>;
	};

	const EventCard = ({ event }: { event: any }) => {
		const ticketsSold = event.capacity - event.ticketsAvailable;
		const soldPercentage = (ticketsSold / event.capacity) * 100;

		return (
			<Card className="bg-zinc-800/50 border-zinc-700 overflow-hidden hover:border-emerald-500/30 transition-all group">
				<div className="flex flex-col md:flex-row">
					{/* Event Image */}
					<div className="w-full md:w-48 h-40 md:h-auto flex-shrink-0 relative overflow-hidden">
						<img
							src={event.imageUrl}
							alt={event.title}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						/>
						<div className="absolute top-2 left-2">
							{getStatusBadge(event)}
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 p-4">
						<div className="flex items-start justify-between gap-4">
							<div>
								<span className="text-xs text-emerald-400 font-medium">{event.category}</span>
								<h3 className="text-lg font-semibold text-white mt-1">{event.title}</h3>
							</div>
							<div className="flex items-center gap-1">
								<Link to={`/events/${event._id}`}>
									<Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
										<Eye className="size-4" />
									</Button>
								</Link>
								<Link to={`/my-events/${event._id}/edit`}>
									<Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
										<Edit className="size-4" />
									</Button>
								</Link>
								<Button
									size="sm"
									variant="ghost"
									className="text-red-400 hover:text-red-300"
									onClick={() => {
										setSelectedEvent(event);
										setDeleteDialogOpen(true);
									}}
								>
									<Trash2 className="size-4" />
								</Button>
							</div>
						</div>

						{/* Event Details */}
						<div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-zinc-400">
							<div className="flex items-center gap-1">
								<Calendar className="size-4 text-emerald-500" />
								{formatDate(event.eventDate)}
							</div>
							<div className="flex items-center gap-1">
								<Clock className="size-4 text-emerald-500" />
								{event.eventTime}
							</div>
							<div className="flex items-center gap-1">
								<MapPin className="size-4 text-emerald-500" />
								{event.location}
							</div>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-zinc-700/50">
							<div>
								<p className="text-xs text-zinc-500">Tickets Sold</p>
								<p className="text-lg font-semibold text-white">{event.stats?.ticketsSold || 0}</p>
							</div>
							<div>
								<p className="text-xs text-zinc-500">Revenue</p>
								<p className="text-lg font-semibold text-emerald-400">${(event.stats?.revenue || 0).toFixed(2)}</p>
							</div>
							<div>
								<p className="text-xs text-zinc-500">Capacity</p>
								<div className="flex items-center gap-2">
									<p className="text-lg font-semibold text-white">{event.ticketsAvailable}/{event.capacity}</p>
								</div>
							</div>
							<div>
								<p className="text-xs text-zinc-500">Price</p>
								<p className="text-lg font-semibold text-white">
									{event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice}`}
								</p>
							</div>
						</div>

						{/* Progress Bar */}
						<div className="mt-3">
							<div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
								<div
									className={`h-full rounded-full transition-all ${
										soldPercentage > 90 ? "bg-red-500" :
										soldPercentage > 70 ? "bg-amber-500" : "bg-emerald-500"
									}`}
									style={{ width: `${soldPercentage}%` }}
								/>
							</div>
						</div>
					</div>
				</div>
			</Card>
		);
	};

	return (
		<div className="h-full rounded-md overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950">
			{/* Header */}
			<div className="bg-gradient-to-r from-emerald-900/20 to-zinc-900 border-b border-zinc-800 p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
							<Calendar className="size-6 text-emerald-500" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-white">My Events</h1>
							<p className="text-zinc-400">
								Events you're organizing
							</p>
						</div>
					</div>
					<Button
						onClick={() => setCreateDialogOpen(true)}
						className="bg-emerald-500 hover:bg-emerald-600 text-white"
					>
						<Plus className="size-4 mr-2" />
						Create Event
					</Button>
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
					<div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
								<Calendar className="size-5 text-emerald-500" />
							</div>
							<div>
								<p className="text-2xl font-bold text-white">{myEvents.length}</p>
								<p className="text-xs text-zinc-500">Total Events</p>
							</div>
						</div>
					</div>
					<div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
								<Ticket className="size-5 text-purple-500" />
							</div>
							<div>
								<p className="text-2xl font-bold text-white">{totalTicketsSold}</p>
								<p className="text-xs text-zinc-500">Tickets Sold</p>
							</div>
						</div>
					</div>
					<div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
								<DollarSign className="size-5 text-amber-500" />
							</div>
							<div>
								<p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
								<p className="text-xs text-zinc-500">Total Revenue</p>
							</div>
						</div>
					</div>
					<div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
								<Eye className="size-5 text-blue-500" />
							</div>
							<div>
								<p className="text-2xl font-bold text-white">{totalViews}</p>
								<p className="text-xs text-zinc-500">Total Views</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-6">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="bg-zinc-800 mb-6">
						<TabsTrigger value="all" className="data-[state=active]:bg-emerald-500">
							All ({myEvents.length})
						</TabsTrigger>
						<TabsTrigger value="upcoming" className="data-[state=active]:bg-emerald-500">
							Upcoming ({upcomingEvents.length})
						</TabsTrigger>
						<TabsTrigger value="past" className="data-[state=active]:bg-emerald-500">
							Past ({pastEvents.length})
						</TabsTrigger>
					</TabsList>

					<ScrollArea className="h-[calc(100vh-450px)]">
						<TabsContent value="all" className="mt-0">
							{isLoading ? (
								<div className="flex items-center justify-center h-64">
									<div className="flex flex-col items-center gap-4">
										<div className="size-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
										<p className="text-zinc-400">Loading events...</p>
									</div>
								</div>
							) : myEvents.length === 0 ? (
								<Card className="bg-zinc-800/50 border-zinc-700">
									<CardContent className="pt-12 pb-12 text-center">
										<Calendar className="size-16 mx-auto text-zinc-600 mb-4" />
										<h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
										<p className="text-zinc-400 mb-6 max-w-md mx-auto">
											Create your first event and start selling tickets!
										</p>
										<Button
											onClick={() => setCreateDialogOpen(true)}
											className="bg-emerald-500 hover:bg-emerald-600 text-white"
										>
											<Plus className="size-4 mr-2" />
											Create Your First Event
										</Button>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-4">
									{myEvents.map((event) => (
										<EventCard key={event._id} event={event} />
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="upcoming" className="mt-0">
							{upcomingEvents.length === 0 ? (
								<Card className="bg-zinc-800/50 border-zinc-700">
									<CardContent className="pt-12 pb-12 text-center">
										<Calendar className="size-16 mx-auto text-zinc-600 mb-4" />
										<h3 className="text-xl font-semibold text-white mb-2">No Upcoming Events</h3>
										<p className="text-zinc-400">Create an event to get started!</p>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-4">
									{upcomingEvents.map((event) => (
										<EventCard key={event._id} event={event} />
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="past" className="mt-0">
							{pastEvents.length === 0 ? (
								<Card className="bg-zinc-800/50 border-zinc-700">
									<CardContent className="pt-12 pb-12 text-center">
										<Calendar className="size-16 mx-auto text-zinc-600 mb-4" />
										<h3 className="text-xl font-semibold text-white mb-2">No Past Events</h3>
										<p className="text-zinc-400">Your completed events will appear here.</p>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-4">
									{pastEvents.map((event) => (
										<EventCard key={event._id} event={event} />
									))}
								</div>
							)}
						</TabsContent>
					</ScrollArea>
				</Tabs>
			</div>

			{/* Create Event Dialog */}
			<CreateEventDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle>Delete Event</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Are you sure you want to delete this event? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{selectedEvent && (
						<div className="py-4">
							<div className="p-4 bg-zinc-800 rounded-lg mb-4">
								<p className="font-medium text-white">{selectedEvent.title}</p>
								<p className="text-sm text-zinc-400">
									{formatDate(selectedEvent.eventDate)} • {selectedEvent.location}
								</p>
								{selectedEvent.stats?.ticketsSold > 0 && (
									<p className="text-sm text-amber-400 mt-2">
										⚠️ {selectedEvent.stats.ticketsSold} tickets have been sold
									</p>
								)}
							</div>
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={() => setDeleteDialogOpen(false)}
									className="flex-1 border-zinc-700"
								>
									Cancel
								</Button>
								<Button
									onClick={handleDelete}
									className="flex-1 bg-red-500 hover:bg-red-600"
								>
									Delete Event
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default MyEventsPage;