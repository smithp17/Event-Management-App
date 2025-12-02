// frontend/src/pages/admin/AdminPage.tsx
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import {
	Shield,
	Calendar,
	Ticket,
	DollarSign,
	Users,
	Eye,
	Pencil,
	Trash2,
	AlertTriangle,
	ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

interface Event {
	_id: string;
	title: string;
	imageUrl: string;
	category: string;
	eventDate: string;
	status: string;
	capacity: number;
	ticketsAvailable: number;
	ticketPrice: number;
	createdBy: string;
}

interface Stats {
	totalEvents: number;
	totalTickets: number;
	totalRevenue: number;
}

const AdminPage = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [stats, setStats] = useState<Stats>({ totalEvents: 0, totalTickets: 0, totalRevenue: 0 });
	const [isLoading, setIsLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [statsRes, eventsRes] = await Promise.all([
				axiosInstance.get("/events/admin/stats"),
				axiosInstance.get("/events/admin/all"),
			]);
			setStats(statsRes.data);
			setEvents(eventsRes.data);
		} catch (error: any) {
			console.error("Error fetching admin data:", error);
			toast.error("Failed to load admin data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteEvent = async () => {
		if (!selectedEvent) return;

		setIsDeleting(true);
		try {
			await axiosInstance.delete(`/events/${selectedEvent._id}`);
			toast.success("Event deleted successfully");
			setDeleteDialogOpen(false);
			setSelectedEvent(null);
			fetchData(); // Refresh data
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to delete event");
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getStatusBadge = (status: string) => {
		const styles: Record<string, string> = {
			upcoming: "bg-blue-500/20 text-blue-400",
			ongoing: "bg-emerald-500/20 text-emerald-400",
			completed: "bg-zinc-500/20 text-zinc-400",
			cancelled: "bg-red-500/20 text-red-400",
			draft: "bg-amber-500/20 text-amber-400",
		};
		return (
			<span className={`px-2 py-1 text-xs font-semibold rounded ${styles[status] || styles.draft}`}>
				{status}
			</span>
		);
	};

	return (
		<div className="h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
			<ScrollArea className="h-full">
				<div className="max-w-7xl mx-auto px-6 py-8">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-4">
							<Link to="/">
								<Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
									<ArrowLeft className="size-5" />
								</Button>
							</Link>
							<div className="flex items-center gap-3">
								<div className="p-3 bg-amber-500/20 rounded-xl">
									<Shield className="size-8 text-amber-400" />
								</div>
								<div>
									<h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
									<p className="text-zinc-400">Manage all events and users</p>
								</div>
							</div>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-zinc-400">Total Events</CardTitle>
								<Calendar className="size-5 text-emerald-500" />
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-zinc-400">Tickets Sold</CardTitle>
								<Ticket className="size-5 text-purple-500" />
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-bold text-white">{stats.totalTickets}</p>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
								<DollarSign className="size-5 text-amber-500" />
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-bold text-white">${stats.totalRevenue?.toFixed(2) || "0.00"}</p>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium text-zinc-400">Active Users</CardTitle>
								<Users className="size-5 text-blue-500" />
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-bold text-white">-</p>
							</CardContent>
						</Card>
					</div>

					{/* Events Table */}
					<Card className="bg-zinc-800/50 border-zinc-700">
						<CardHeader>
							<CardTitle className="text-white">All Events</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center h-48">
									<div className="size-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
								</div>
							) : events.length === 0 ? (
								<div className="text-center py-12">
									<Calendar className="size-12 mx-auto text-zinc-600 mb-4" />
									<p className="text-zinc-400">No events found</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="border-zinc-700 hover:bg-transparent">
												<TableHead className="text-zinc-400">Event</TableHead>
												<TableHead className="text-zinc-400">Date</TableHead>
												<TableHead className="text-zinc-400">Status</TableHead>
												<TableHead className="text-zinc-400">Tickets</TableHead>
												<TableHead className="text-zinc-400">Price</TableHead>
												<TableHead className="text-zinc-400 text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{events.map((event) => (
												<TableRow key={event._id} className="border-zinc-700 hover:bg-zinc-800/50">
													<TableCell>
														<div className="flex items-center gap-3">
															<img
																src={event.imageUrl}
																alt={event.title}
																className="size-10 rounded-lg object-cover"
															/>
															<div>
																<p className="text-white font-medium">{event.title}</p>
																<p className="text-xs text-zinc-500">{event.category}</p>
															</div>
														</div>
													</TableCell>
													<TableCell className="text-zinc-300">
														{formatDate(event.eventDate)}
													</TableCell>
													<TableCell>{getStatusBadge(event.status || "upcoming")}</TableCell>
													<TableCell className="text-zinc-300">
														{event.capacity - event.ticketsAvailable} / {event.capacity}
													</TableCell>
													<TableCell className="text-zinc-300">
														{event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice}`}
													</TableCell>
													<TableCell>
														<div className="flex items-center justify-end gap-2">
															<Link to={`/events/${event._id}`}>
																<Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
																	<Eye className="size-4" />
																</Button>
															</Link>
															<Link to={`/my-events/${event._id}/edit`}>
																<Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
																	<Pencil className="size-4" />
																</Button>
															</Link>
															<Button
																variant="ghost"
																size="icon"
																onClick={() => {
																	setSelectedEvent(event);
																	setDeleteDialogOpen(true);
																}}
																className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
															>
																<Trash2 className="size-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</ScrollArea>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="size-5 text-red-500" />
							Delete Event
						</DialogTitle>
						<DialogDescription className="text-zinc-400">
							Are you sure you want to delete this event? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{selectedEvent && (
						<div className="py-4">
							<div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
								<p className="text-white font-semibold">{selectedEvent.title}</p>
								<p className="text-sm text-zinc-400 mt-1">
									{formatDate(selectedEvent.eventDate)}
								</p>
							</div>

							<div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
								<p className="text-amber-400 text-sm">
									⚠️ As an admin, you can delete any event regardless of ticket sales.
								</p>
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
									onClick={handleDeleteEvent}
									disabled={isDeleting}
									className="flex-1 bg-red-500 hover:bg-red-600"
								>
									{isDeleting ? "Deleting..." : "Delete Event"}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminPage;