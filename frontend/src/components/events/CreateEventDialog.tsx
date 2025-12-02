// frontend/src/components/events/CreateEventDialog.tsx
import { useState, useRef, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
	Calendar, 
	MapPin, 
	DollarSign, 
	Users, 
	Clock, 
	Upload,
	X,
	Mail,
	Phone,
	Ticket,
	ImageIcon,
	Globe,
	Car,
	User,
	FileText,
	Info,
	Tag
} from "lucide-react";
import toast from "react-hot-toast";

interface CreateEventDialogProps {
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
	"Nightlife",
	"Holiday",
	"Other",
];

const ageRestrictions = [
	{ value: "all-ages", label: "All Ages" },
	{ value: "18+", label: "18+" },
	{ value: "21+", label: "21+" },
];

const refundPolicies = [
	{ value: "no-refunds", label: "No Refunds" },
	{ value: "1-day", label: "Refund up to 1 day before event" },
	{ value: "7-days", label: "Refund up to 7 days before event" },
	{ value: "30-days", label: "Refund up to 30 days before event" },
	{ value: "flexible", label: "Flexible - Refund anytime" },
];

const CreateEventDialog = ({ open, onOpenChange }: CreateEventDialogProps) => {
	const { createEvent, isLoading } = useEventStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [activeTab, setActiveTab] = useState("basic");
	
	const [formData, setFormData] = useState({
		// Basic Info
		title: "",
		summary: "",
		description: "",
		category: "",
		tags: "",
		
		// Date & Time
		eventDate: "",
		eventTime: "",
		endDate: "",
		endTime: "",
		
		// Location
		locationType: "venue",
		location: "",
		venue: "",
		street: "",
		city: "",
		state: "",
		zipCode: "",
		onlineEventUrl: "",
		
		// Tickets
		ticketPrice: "",
		capacity: "",
		maxTicketsPerOrder: "10",
		
		// Highlights
		duration: "",
		ageRestriction: "all-ages",
		format: "in-person",
		parking: "",
		dresscode: "",
		
		// Policies
		refundPolicy: "no-refunds",
		refundPolicyText: "",
		
		// Contact
		contactEmail: "",
		contactPhone: "",
		organizerName: "",
		organizerDescription: "",
		website: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Image handling
	const handleImageSelect = (file: File) => {
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error("Image must be less than 10MB");
			return;
		}
		setImageFile(file);
		const reader = new FileReader();
		reader.onloadend = () => setImagePreview(reader.result as string);
		reader.readAsDataURL(file);
	};

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) handleImageSelect(file);
	}, []);

	const resetForm = () => {
		setFormData({
			title: "", summary: "", description: "", category: "", tags: "",
			eventDate: "", eventTime: "", endDate: "", endTime: "",
			locationType: "venue", location: "", venue: "", street: "", city: "", state: "", zipCode: "", onlineEventUrl: "",
			ticketPrice: "", capacity: "", maxTicketsPerOrder: "10",
			duration: "", ageRestriction: "all-ages", format: "in-person", parking: "", dresscode: "",
			refundPolicy: "no-refunds", refundPolicyText: "",
			contactEmail: "", contactPhone: "", organizerName: "", organizerDescription: "", website: "",
		});
		setImageFile(null);
		setImagePreview(null);
		setActiveTab("basic");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.title.trim()) {
			toast.error("Please enter an event title");
			setActiveTab("basic");
			return;
		}
		if (!formData.category) {
			toast.error("Please select a category");
			setActiveTab("basic");
			return;
		}
		if (!formData.eventDate || !formData.eventTime) {
			toast.error("Please set the event date and time");
			setActiveTab("datetime");
			return;
		}
		if (!formData.location.trim()) {
			toast.error("Please enter a location");
			setActiveTab("location");
			return;
		}
		if (!formData.capacity || parseInt(formData.capacity) < 1) {
			toast.error("Please enter a valid capacity");
			setActiveTab("tickets");
			return;
		}

		const submitData = new FormData();
		
		if (imageFile) {
			submitData.append("imageFile", imageFile);
		}

		// Basic info
		submitData.append("title", formData.title.trim());
		submitData.append("summary", formData.summary.trim());
		submitData.append("description", formData.description.trim());
		submitData.append("category", formData.category);
		if (formData.tags) submitData.append("tags", formData.tags);

		// Date & Time
		submitData.append("eventDate", formData.eventDate);
		submitData.append("eventTime", formData.eventTime);
		if (formData.endDate) submitData.append("endDate", formData.endDate);
		if (formData.endTime) submitData.append("endTime", formData.endTime);

		// Location
		submitData.append("locationType", formData.locationType);
		submitData.append("location", formData.location.trim());
		if (formData.venue) submitData.append("venue", formData.venue.trim());
		if (formData.locationType === "online" && formData.onlineEventUrl) {
			submitData.append("onlineEventUrl", formData.onlineEventUrl);
		}

		// Address
		const address = {
			street: formData.street,
			city: formData.city,
			state: formData.state,
			zipCode: formData.zipCode,
		};
		submitData.append("address", JSON.stringify(address));

		// Tickets
		submitData.append("ticketPrice", formData.ticketPrice || "0");
		submitData.append("capacity", formData.capacity);
		submitData.append("maxTicketsPerOrder", formData.maxTicketsPerOrder);

		// Highlights
		const highlights = {
			duration: formData.duration || null,
			ageRestriction: formData.ageRestriction,
			format: formData.format,
			parking: formData.parking || null,
			dresscode: formData.dresscode || null,
		};
		submitData.append("highlights", JSON.stringify(highlights));

		// Policies
		submitData.append("refundPolicy", formData.refundPolicy);
		if (formData.refundPolicyText) {
			submitData.append("refundPolicyText", formData.refundPolicyText);
		}

		// Contact
		if (formData.contactEmail) submitData.append("contactEmail", formData.contactEmail.trim());
		if (formData.contactPhone) submitData.append("contactPhone", formData.contactPhone.trim());
		if (formData.organizerName) submitData.append("organizerName", formData.organizerName.trim());
		if (formData.organizerDescription) submitData.append("organizerDescription", formData.organizerDescription.trim());

		// Social links
		const socialLinks = { website: formData.website || null };
		submitData.append("socialLinks", JSON.stringify(socialLinks));

		try {
			await createEvent(submitData);
			toast.success("Event created successfully!");
			resetForm();
			onOpenChange(false);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to create event");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">Create Event</DialogTitle>
					<DialogDescription className="text-zinc-400">
						Create and publish your event to start selling tickets
					</DialogDescription>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
					<TabsList className="grid grid-cols-6 bg-zinc-800">
						<TabsTrigger value="basic">Basic</TabsTrigger>
						<TabsTrigger value="datetime">Date</TabsTrigger>
						<TabsTrigger value="location">Location</TabsTrigger>
						<TabsTrigger value="tickets">Tickets</TabsTrigger>
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="contact">Contact</TabsTrigger>
					</TabsList>

					<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-1">
						{/* Basic Info Tab */}
						<TabsContent value="basic" className="space-y-4 mt-4">
							{/* Image Upload */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Event Image</label>
								{!imagePreview ? (
									<div
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
										onClick={() => fileInputRef.current?.click()}
										className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
											isDragging ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-700 hover:border-zinc-600"
										}`}
									>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
											className="hidden"
										/>
										<Upload className="size-8 mx-auto mb-2 text-zinc-500" />
										<p className="text-zinc-400">Drag & drop or click to upload</p>
										<p className="text-xs text-zinc-500">PNG, JPG up to 10MB</p>
									</div>
								) : (
									<div className="relative rounded-lg overflow-hidden">
										<img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
										<Button
											type="button"
											size="sm"
											variant="destructive"
											className="absolute top-2 right-2"
											onClick={() => { setImageFile(null); setImagePreview(null); }}
										>
											<X className="size-4" />
										</Button>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Title *</label>
								<Input
									name="title"
									value={formData.title}
									onChange={handleChange}
									placeholder="Event title"
									className="bg-zinc-800 border-zinc-700"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Short Summary</label>
								<Input
									name="summary"
									value={formData.summary}
									onChange={handleChange}
									placeholder="Brief description (max 140 chars)"
									maxLength={140}
									className="bg-zinc-800 border-zinc-700"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Description</label>
								<Textarea
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Full event description..."
									rows={4}
									className="bg-zinc-800 border-zinc-700 resize-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Category *</label>
									<Select value={formData.category} onValueChange={(v) => handleSelectChange("category", v)}>
										<SelectTrigger className="bg-zinc-800 border-zinc-700">
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent className="bg-zinc-800 border-zinc-700">
											{categories.map((cat) => (
												<SelectItem key={cat} value={cat}>{cat}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Tags</label>
									<Input
										name="tags"
										value={formData.tags}
										onChange={handleChange}
										placeholder="music, concert, live (comma separated)"
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
							</div>
						</TabsContent>

						{/* Date & Time Tab */}
						<TabsContent value="datetime" className="space-y-4 mt-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
										<Calendar className="size-4 text-emerald-500" />
										Start Date *
									</label>
									<Input
										type="date"
										name="eventDate"
										value={formData.eventDate}
										onChange={handleChange}
										min={new Date().toISOString().split('T')[0]}
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
										<Clock className="size-4 text-emerald-500" />
										Start Time *
									</label>
									<Input
										type="time"
										name="eventTime"
										value={formData.eventTime}
										onChange={handleChange}
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">End Date</label>
									<Input
										type="date"
										name="endDate"
										value={formData.endDate}
										onChange={handleChange}
										min={formData.eventDate || new Date().toISOString().split('T')[0]}
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">End Time</label>
									<Input
										type="time"
										name="endTime"
										value={formData.endTime}
										onChange={handleChange}
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Duration</label>
								<Input
									name="duration"
									value={formData.duration}
									onChange={handleChange}
									placeholder="e.g., 3 hours, 2 days"
									className="bg-zinc-800 border-zinc-700"
								/>
							</div>
						</TabsContent>

						{/* Location Tab */}
						<TabsContent value="location" className="space-y-4 mt-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Event Format</label>
								<Select value={formData.locationType} onValueChange={(v) => handleSelectChange("locationType", v)}>
									<SelectTrigger className="bg-zinc-800 border-zinc-700">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="bg-zinc-800 border-zinc-700">
										<SelectItem value="venue">In-Person Venue</SelectItem>
										<SelectItem value="online">Online Event</SelectItem>
										<SelectItem value="tba">To Be Announced</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{formData.locationType === "venue" && (
								<>
									<div className="space-y-2">
										<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
											<MapPin className="size-4 text-emerald-500" />
											Location *
										</label>
										<Input
											name="location"
											value={formData.location}
											onChange={handleChange}
											placeholder="City, State"
											className="bg-zinc-800 border-zinc-700"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-zinc-300">Venue Name</label>
										<Input
											name="venue"
											value={formData.venue}
											onChange={handleChange}
											placeholder="Convention Center, Stadium, etc."
											className="bg-zinc-800 border-zinc-700"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-zinc-300">Street Address</label>
										<Input
											name="street"
											value={formData.street}
											onChange={handleChange}
											placeholder="123 Main St"
											className="bg-zinc-800 border-zinc-700"
										/>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<Input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="bg-zinc-800 border-zinc-700" />
										<Input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="bg-zinc-800 border-zinc-700" />
										<Input name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Zip" className="bg-zinc-800 border-zinc-700" />
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
											<Car className="size-4 text-emerald-500" />
											Parking Info
										</label>
										<Input
											name="parking"
											value={formData.parking}
											onChange={handleChange}
											placeholder="Free parking, Paid parking, Street parking"
											className="bg-zinc-800 border-zinc-700"
										/>
									</div>
								</>
							)}

							{formData.locationType === "online" && (
								<>
									<div className="space-y-2">
										<label className="text-sm font-medium text-zinc-300">Platform/Location *</label>
										<Input
											name="location"
											value={formData.location}
											onChange={handleChange}
											placeholder="Zoom, YouTube Live, etc."
											className="bg-zinc-800 border-zinc-700"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
											<Globe className="size-4 text-emerald-500" />
											Event URL
										</label>
										<Input
											name="onlineEventUrl"
											value={formData.onlineEventUrl}
											onChange={handleChange}
											placeholder="https://zoom.us/j/..."
											className="bg-zinc-800 border-zinc-700"
										/>
									</div>
								</>
							)}
						</TabsContent>

						{/* Tickets Tab */}
						<TabsContent value="tickets" className="space-y-4 mt-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
										<DollarSign className="size-4 text-emerald-500" />
										Ticket Price
									</label>
									<Input
										type="number"
										name="ticketPrice"
										value={formData.ticketPrice}
										onChange={handleChange}
										placeholder="0 for free"
										min="0"
										step="0.01"
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
										<Users className="size-4 text-emerald-500" />
										Capacity *
									</label>
									<Input
										type="number"
										name="capacity"
										value={formData.capacity}
										onChange={handleChange}
										placeholder="100"
										min="1"
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Max Tickets Per Order</label>
								<Input
									type="number"
									name="maxTicketsPerOrder"
									value={formData.maxTicketsPerOrder}
									onChange={handleChange}
									min="1"
									max="100"
									className="bg-zinc-800 border-zinc-700"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Refund Policy</label>
								<Select value={formData.refundPolicy} onValueChange={(v) => handleSelectChange("refundPolicy", v)}>
									<SelectTrigger className="bg-zinc-800 border-zinc-700">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="bg-zinc-800 border-zinc-700">
										{refundPolicies.map((policy) => (
											<SelectItem key={policy.value} value={policy.value}>{policy.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</TabsContent>

						{/* Details Tab */}
						<TabsContent value="details" className="space-y-4 mt-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Age Restriction</label>
									<Select value={formData.ageRestriction} onValueChange={(v) => handleSelectChange("ageRestriction", v)}>
										<SelectTrigger className="bg-zinc-800 border-zinc-700">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-zinc-800 border-zinc-700">
											{ageRestrictions.map((age) => (
												<SelectItem key={age.value} value={age.value}>{age.label}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Format</label>
									<Select value={formData.format} onValueChange={(v) => handleSelectChange("format", v)}>
										<SelectTrigger className="bg-zinc-800 border-zinc-700">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-zinc-800 border-zinc-700">
											<SelectItem value="in-person">In Person</SelectItem>
											<SelectItem value="online">Online</SelectItem>
											<SelectItem value="hybrid">Hybrid</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">Dress Code</label>
								<Input
									name="dresscode"
									value={formData.dresscode}
									onChange={handleChange}
									placeholder="Casual, Business Casual, Formal"
									className="bg-zinc-800 border-zinc-700"
								/>
							</div>
						</TabsContent>

						{/* Contact Tab */}
						<TabsContent value="contact" className="space-y-4 mt-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
									<User className="size-4 text-emerald-500" />
									Organizer Name
								</label>
								<Input
									name="organizerName"
									value={formData.organizerName}
									onChange={handleChange}
									placeholder="Your name or organization"
									className="bg-zinc-800 border-zinc-700"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
										<Mail className="size-4 text-emerald-500" />
										Contact Email
									</label>
									<Input
										type="email"
										name="contactEmail"
										value={formData.contactEmail}
										onChange={handleChange}
										placeholder="contact@email.com"
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
										<Phone className="size-4 text-emerald-500" />
										Contact Phone
									</label>
									<Input
										type="tel"
										name="contactPhone"
										value={formData.contactPhone}
										onChange={handleChange}
										placeholder="+1 (555) 000-0000"
										className="bg-zinc-800 border-zinc-700"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
									<Globe className="size-4 text-emerald-500" />
									Website
								</label>
								<Input
									name="website"
									value={formData.website}
									onChange={handleChange}
									placeholder="https://yourwebsite.com"
									className="bg-zinc-800 border-zinc-700"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-300">About the Organizer</label>
								<Textarea
									name="organizerDescription"
									value={formData.organizerDescription}
									onChange={handleChange}
									placeholder="Tell attendees about yourself or your organization..."
									rows={3}
									className="bg-zinc-800 border-zinc-700 resize-none"
								/>
							</div>
						</TabsContent>

						{/* Actions */}
						<div className="flex justify-between items-center pt-6 mt-6 border-t border-zinc-800">
							<Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600">
								{isLoading ? "Creating..." : "Create Event"}
							</Button>
						</div>
					</form>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

export default CreateEventDialog;