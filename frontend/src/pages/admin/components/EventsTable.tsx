import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEventStore } from "@/stores/useEventStore";
import { Calendar, Trash2, Edit } from "lucide-react";
import { useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

const EventsTable = () => {
	const { events, isLoading, error, fetchAllEvents } = useEventStore();

	useEffect(() => {
		fetchAllEvents();
	}, [fetchAllEvents]);

	const handleDelete = async (eventId: string) => {
		if (window.confirm("Are you sure you want to delete this event?")) {
			try {
				await axiosInstance.delete(`/admin/events/${eventId}`);
				fetchAllEvents();
				toast.success("Event deleted successfully");
			} catch (error: any) {
				toast.error("Failed to delete event");
			}
		}
	};

	const handleStatusChange = async (eventId: string, newStatus: string) => {
		try {
			await axiosInstance.patch(`/admin/events/${eventId}/status`, {
				status: newStatus,
			});
			fetchAllEvents();
			toast.success("Event status updated");
		} catch (error: any) {
			toast.error("Failed to update status");
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading events...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-red-400'>{error}</div>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead className='w-[50px]'></TableHead>
					<TableHead>Title</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Location</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Tickets</TableHead>
					<TableHead className='text-right'>Actions</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{events.map((event) => (
					<TableRow key={event._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<img
								src={event.imageUrl}
								alt={event.title}
								className='size-10 rounded object-cover'
							/>
						</TableCell>
						<TableCell className='font-medium'>{event.title}</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{new Date(event.eventDate).toLocaleDateString()}
							</span>
						</TableCell>
						<TableCell className='text-sm text-zinc-400'>{event.location}</TableCell>
						<TableCell>
							<select
								value={event.status}
								onChange={(e) => handleStatusChange(event._id, e.target.value)}
								className='bg-zinc-800 text-zinc-100 rounded px-2 py-1 text-sm'
							>
								<option value='upcoming'>Upcoming</option>
								<option value='ongoing'>Ongoing</option>
								<option value='completed'>Completed</option>
								<option value='cancelled'>Cancelled</option>
							</select>
						</TableCell>
						<TableCell className='text-sm'>
							{event.ticketsAvailable} / {event.capacity}
						</TableCell>

						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<Button
									variant='ghost'
									size='sm'
									className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
									onClick={() => handleDelete(event._id)}
								>
									<Trash2 className='size-4' />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
export default EventsTable;