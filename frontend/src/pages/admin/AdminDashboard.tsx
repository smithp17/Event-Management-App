// frontend/src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { 
	Calendar,
	Users,
	Ticket,
	DollarSign,
	Eye,
	Edit,
	Trash2,
	LayoutDashboard,
	TrendingUp,
	ArrowUpRight,
	AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface AdminStats {
	totalEvents: number;
	upcomingEvents: number;
	totalTickets: number;
	totalRevenue: number;
	recentEvents: any[];
}

const AdminDashboard = () => {
	const navigate = useNavigate();
	const { isAdmin } = useAuthStore();
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [allEvents, setAllEvents] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<any>(null);

	useEffect(() => {
		if (!isAdmin) {
			navigate("/");
			return;
		}
		fetchAdminData();
	}, [isAdmin, navigate]);

	const fetchAdminData = async () => {
		try {
			const [statsRes, eventsRes] = await Promise.all([
				axiosInstance.get("/events/admin/stats"),
				axiosInstance.get("/events/admin/all"),
			]);
			setStats(statsRes.data);
			setAllEvents(eventsRes.data);
		} catch (error) {
			console.error("Error fetching admin data:", error);
			toast.error("Failed to load admin data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!selectedEvent) return;
		
		try {
			await axiosInstance.delete(`/events/${selectedEvent._id}`);
			toast.success("Event deleted successfully");
			setAllEvents(allEvents.filter(e => e._id !== selectedEvent._id));
			setDeleteDialogOpen(false);
			setSelectedEvent(null);
			fetchAdminData(); // Refresh stats
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

	const getStatusBadge = (event: any) => {
		const statusColors: Record<string, string> = {
			draft: "bg-zinc-500/20 text-zinc-400",
			upcoming: "bg-emerald-500/20 text-emerald-400",
			ongoing: "bg-blue-500/20 text-blue-400",
			completed: "bg-zinc-500/20 text-zinc-400",
			cancelled: "bg-red-500/20 text-red-400",
		};
		const color = statusColors[event.status] || statusColors.upcoming;
		return (
			<span className={`px-2 py-0.5 text-xs font-semibold rounded ${color}`}>
				{event.status || "upcoming"}
			</span>
		);
	};

	if (!isAdmin) {
		return null;
	}

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center bg-zinc-950">
				<div className="flex flex-col items-center gap-4">
					<div className="size-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
					<p className="text-zinc-400">Loading admin dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full bg-gradient-to-b from-zinc-900 to-zinc-950">
			<ScrollArea className="h-full">
				{/* Header */}
				<div className="bg-gradient-to-r from-amber-900/20 to-zinc-900 border-b border-zinc-800 p-6">
					<div className="flex items-center gap-3">
						<div className="size-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
							<LayoutDashboard className="size-6 text-amber-500" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
							<p className="text-zinc-400">Manage all events and view analytics</p>
						</div>
					</div>
				</div>

				<div className="p-6 space-y-6">
					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Total Events</p>
										<p className="text-3xl font-bold text-white">{stats?.totalEvents || 0}</p>
									</div>
									<div className="size-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
										<Calendar className="size-6 text-emerald-500" />
									</div>
								</div>
								<div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
									<TrendingUp className="size-3" />
									<span>{stats?.upcomingEvents || 0} upcoming</span>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Tickets Sold</p>
										<p className="text-3xl font-bold text-white">{stats?.totalTickets || 0}</p>
									</div>
									<div className="size-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
										<Ticket className="size-6 text-purple-500" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Total Revenue</p>
										<p className="text-3xl font-bold text-white">${(stats?.totalRevenue || 0).toFixed(2)}</p>
									</div>
									<div className="size-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
										<DollarSign className="size-6 text-amber-500" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-800/50 border-zinc-700">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Active Users</p>
										<p className="text-3xl font-bold text-white">-</p>
									</div>
									<div className="size-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
										<Users className="size-6 text-blue-500" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* All Events Table */}
					<Card className="bg-zinc-900 border-zinc-800">
						<CardContent className="p-6">
							<h2 className="text-xl font-semibold text-white mb-4">All Events</h2>
							
							{allEvents.length === 0 ? (
								<div className="text-center py-12">
									<Calendar className="size-12 mx-auto text-zinc-600 mb-4" />
									<p className="text-zinc-400">No events found</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b border-zinc-800">
												<th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Event</th>
												<th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Date</th>
												<th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
												<th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tickets</th>
												<th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Price</th>
												<th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Actions</th>
											</tr>
										</thead>
										<tbody>
											{allEvents.map((event) => (
												<tr key={event._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
													<td className="py-3 px-4">
														<div className="flex items-center gap-3">
															<img
																src={event.imageUrl}
																alt={event.title}
																className="size-10 rounded object-cover"
															/>
															<div>
																<p className="text-white font-medium line-clamp-1">{event.title}</p>
																<p className="text-xs text-zinc-500">{event.category}</p>
															</div>
														</div>
													</td>
													<td className="py-3 px-4 text-zinc-300">{formatDate(event.eventDate)}</td>
													<td className="py-3 px-4">{getStatusBadge(event)}</td>
													<td className="py-3 px-4 text-zinc-300">
														{event.capacity - event.ticketsAvailable} / {event.capacity}
													</td>
													<td className="py-3 px-4 text-zinc-300">
														{event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice}`}
													</td>
													<td className="py-3 px-4">
														<div className="flex items-center justify-end gap-1">
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
													</td>
												</tr>
											))}
										</tbody>
									</table>
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
							</div>
							<div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
								<AlertCircle className="size-5 text-amber-500" />
								<p className="text-sm text-amber-400">
									As admin, you can delete any event regardless of sold tickets.
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

export default AdminDashboard;