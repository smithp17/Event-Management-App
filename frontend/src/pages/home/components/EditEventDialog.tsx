import { useState, useEffect } from "react";
import { useEventStore } from "@/stores/useEventStore";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { 
	Calendar, 
	MapPin, 
	DollarSign, 
	Users, 
	Clock, 
	Image, 
	Mail,
	Phone,
	Ticket,
	Save
} from "lucide-react";
import toast from "react-hot-toast";

interface Event {
	_id: string;
	title: string;
	description?: string;
	category: string;
	imageUrl: string;
	eventDate: string;
	eventTime: string;
	endTime?: string;
	location: string;
	venue?: string;
	ticketPrice: number;
	capacity: number;
	ticketsAvailable: number;
	status?: string;
	contactEmail?: string;
	contactPhone?: string;
}

interface EditEventDialogProps {
	event: Event;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const categories = [
	"Music",
	"Sports",
	"Arts & Theater",
	"Food & Drink",
	"Business & Networking",
	"Technology",
	"Health & Wellness",
	"Community",
	"Film & Media",
	"Fashion",
	"Education",
	"Charity",
	"Other",
];

const statuses = [
	{ value: "upcoming", label: "Upcoming" },
	{ value: "ongoing", label: "Ongoing" },
	{ value: "completed", label: "Completed" },
	{ value: "cancelled", label: "Cancelled" },
];

const EditEventDialog = ({ event, open, onOpenChange }: EditEventDialogProps) => {
	const { updateEvent, isLoading } = useEventStore();
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		category: "",
		imageUrl: "",
		eventDate: "",
		eventTime: "",
		endTime: "",
		location: "",
		venue: "",
		ticketPrice: "",
		capacity: "",
		ticketsAvailable: "",
		status: "",
		contactEmail: "",
		contactPhone: "",
	});

	// Populate form when event changes
	useEffect(() => {
		if (event) {
			setFormData({
				title: event.title || "",
				description: event.description || "",
				category: event.category || "",
				imageUrl: event.imageUrl || "",
				eventDate: event.eventDate ? event.eventDate.split('T')[0] : "",
				eventTime: event.eventTime || "",
				endTime: event.endTime || "",
				location: event.location || "",
				venue: event.venue || "",
				ticketPrice: event.ticketPrice?.toString() || "0",
				capacity: event.capacity?.toString() || "",
				ticketsAvailable: event.ticketsAvailable?.toString() || "",
				status: event.status || "upcoming",
				contactEmail: event.contactEmail || "",
				contactPhone: event.contactPhone || "",
			});
		}
	}, [event]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.title.trim()) {
			toast.error("Please enter an event title");
			return;
		}
		if (!formData.category) {
			toast.error("Please select a category");
			return;
		}
		if (!formData.eventDate) {
			toast.error("Please select an event date");
			return;
		}
		if (!formData.eventTime) {
			toast.error("Please enter an event time");
			return;
		}
		if (!formData.location.trim()) {
			toast.error("Please enter a location");
			return;
		}

		const capacity = parseInt(formData.capacity) || event.capacity;
		const ticketsAvailable = parseInt(formData.ticketsAvailable) || event.ticketsAvailable;

		const eventData = {
			title: formData.title.trim(),
			description: formData.description.trim(),
			category: formData.category,
			imageUrl: formData.imageUrl.trim() || event.imageUrl,
			eventDate: formData.eventDate,
			eventTime: formData.eventTime,
			endTime: formData.endTime || null,
			location: formData.location.trim(),
			venue: formData.venue.trim(),
			ticketPrice: parseFloat(formData.ticketPrice) || 0,
			capacity: capacity,
			ticketsAvailable: Math.min(ticketsAvailable, capacity),
			status: formData.status,
			contactEmail: formData.contactEmail.trim(),
			contactPhone: formData.contactPhone.trim(),
		};

		try {
			await updateEvent(event._id, eventData);
			toast.success("Event updated successfully!");
			onOpenChange(false);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to update event");
		}
	};

	const ticketsSold = event.capacity - event.ticketsAvailable;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
						Edit Event
					</DialogTitle>
					<DialogDescription className="text-zinc-400">
						Update your event details. {ticketsSold > 0 && (
							<span className="text-amber-400">
								Note: {ticketsSold} ticket(s) already sold.
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6 mt-4">
					{/* Title */}
					<div className="space-y-2">
						<label htmlFor="title" className="text-sm font-medium text-zinc-300">
							Event Title <span className="text-red-500">*</span>
						</label>
						<Input
							id="title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder="Enter event title"
							className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
						/>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<label htmlFor="description" className="text-sm font-medium text-zinc-300">
							Description
						</label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Describe your event..."
							rows={4}
							className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 resize-none"
						/>
					</div>

					{/* Category, Status & Image */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-zinc-300">
								Category <span className="text-red-500">*</span>
							</label>
							<Select value={formData.category} onValueChange={(v) => handleSelectChange("category", v)}>
								<SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent className="bg-zinc-800 border-zinc-700">
									{categories.map((category) => (
										<SelectItem
											key={category}
											value={category}
											className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
										>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-zinc-300">
								Status
							</label>
							<Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
								<SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500">
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent className="bg-zinc-800 border-zinc-700">
									{statuses.map((status) => (
										<SelectItem
											key={status.value}
											value={status.value}
											className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
										>
											{status.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label htmlFor="imageUrl" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
								<Image className="size-4 text-blue-500" />
								Image URL
							</label>
							<Input
								id="imageUrl"
								name="imageUrl"
								value={formData.imageUrl}
								onChange={handleChange}
								placeholder="https://..."
								className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
							/>
						</div>
					</div>

					{/* Date and Time */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="space-y-2">
							<label htmlFor="eventDate" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
								<Calendar className="size-4 text-blue-500" />
								Date <span className="text-red-500">*</span>
							</label>
							<Input
								id="eventDate"
								name="eventDate"
								type="date"
								value={formData.eventDate}
								onChange={handleChange}
								className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="eventTime" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
								<Clock className="size-4 text-blue-500" />
								Start Time <span className="text-red-500">*</span>
							</label>
							<Input
								id="eventTime"
								name="eventTime"
								type="time"
								value={formData.eventTime}
								onChange={handleChange}
								className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="endTime" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
								<Clock className="size-4 text-zinc-500" />
								End Time
							</label>
							<Input
								id="endTime"
								name="endTime"
								type="time"
								value={formData.endTime}
								onChange={handleChange}
								className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500"
							/>
						</div>
					</div>

					{/* Location */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="location" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
								<MapPin className="size-4 text-blue-500" />
								Location <span className="text-red-500">*</span>
							</label>
							<Input
								id="location"
								name="location"
								value={formData.location}
								onChange={handleChange}
								placeholder="City, State or Address"
								className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="venue" className="text-sm font-medium text-zinc-300">
								Venue Name
							</label>
							<Input
								id="venue"
								name="venue"
								value={formData.venue}
								onChange={handleChange}
								placeholder="Convention Center, etc."
								className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
							/>
						</div>
					</div>

					{/* Tickets Section */}
					<div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 space-y-4">
						<h3 className="text-lg font-semibold text-white flex items-center gap-2">
							<Ticket className="size-5 text-blue-500" />
							Ticket Settings
							{ticketsSold > 0 && (
								<span className="text-sm font-normal text-amber-400 ml-2">
									({ticketsSold} sold)
								</span>
							)}
						</h3>
						
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="space-y-2">
								<label htmlFor="ticketPrice" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
									<DollarSign className="size-4 text-blue-500" />
									Ticket Price
								</label>
								<Input
									id="ticketPrice"
									name="ticketPrice"
									type="number"
									min="0"
									step="0.01"
									value={formData.ticketPrice}
									onChange={handleChange}
									placeholder="0.00"
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="capacity" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
									<Users className="size-4 text-blue-500" />
									Total Capacity
								</label>
								<Input
									id="capacity"
									name="capacity"
									type="number"
									min={ticketsSold || 1}
									value={formData.capacity}
									onChange={handleChange}
									placeholder="100"
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
								/>
								{ticketsSold > 0 && (
									<p className="text-xs text-amber-400">Min: {ticketsSold} (tickets sold)</p>
								)}
							</div>
							<div className="space-y-2">
								<label htmlFor="ticketsAvailable" className="text-sm font-medium text-zinc-300">
									Tickets Available
								</label>
								<Input
									id="ticketsAvailable"
									name="ticketsAvailable"
									type="number"
									min="0"
									max={parseInt(formData.capacity) - ticketsSold || undefined}
									value={formData.ticketsAvailable}
									onChange={handleChange}
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
								/>
							</div>
						</div>
					</div>

					{/* Contact Info */}
					<div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 space-y-4">
						<h3 className="text-lg font-semibold text-white">Contact Information</h3>
						
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="contactEmail" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
									<Mail className="size-4 text-blue-500" />
									Contact Email
								</label>
								<Input
									id="contactEmail"
									name="contactEmail"
									type="email"
									value={formData.contactEmail}
									onChange={handleChange}
									placeholder="organizer@email.com"
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="contactPhone" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
									<Phone className="size-4 text-blue-500" />
									Contact Phone
								</label>
								<Input
									id="contactPhone"
									name="contactPhone"
									type="tel"
									value={formData.contactPhone}
									onChange={handleChange}
									placeholder="+1 (555) 000-0000"
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
								/>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="bg-blue-500 hover:bg-blue-600 text-white min-w-[120px]"
						>
							{isLoading ? (
								<span className="flex items-center gap-2">
									<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Saving...
								</span>
							) : (
								<span className="flex items-center gap-2">
									<Save className="size-4" />
									Save Changes
								</span>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditEventDialog;