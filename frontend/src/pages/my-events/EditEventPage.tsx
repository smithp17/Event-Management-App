// frontend/src/pages/my-events/EditEventPage.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "@/stores/useEventStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
	Globe,
	Car,
	User,
	ArrowLeft,
	Save,
} from "lucide-react";
import toast from "react-hot-toast";

const categories = [
	"Music", "Sports", "Arts & Theater", "Food & Drink", "Business & Networking",
	"Technology", "Health & Wellness", "Community", "Film & Media", "Fashion",
	"Education", "Charity", "Nightlife", "Holiday", "Other",
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

const EditEventPage = () => {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { currentEvent, fetchEventById, updateEvent, isLoading } = useEventStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [activeTab, setActiveTab] = useState("basic");
	const [isSaving, setIsSaving] = useState(false);
	
	const [formData, setFormData] = useState({
		title: "",
		summary: "",
		description: "",
		category: "",
		tags: "",
		eventDate: "",
		eventTime: "",
		endDate: "",
		endTime: "",
		locationType: "venue",
		location: "",
		venue: "",
		street: "",
		city: "",
		state: "",
		zipCode: "",
		onlineEventUrl: "",
		ticketPrice: "",
		capacity: "",
		ticketsAvailable: "",
		maxTicketsPerOrder: "10",
		duration: "",
		ageRestriction: "all-ages",
		format: "in-person",
		parking: "",
		dresscode: "",
		refundPolicy: "no-refunds",
		refundPolicyText: "",
		contactEmail: "",
		contactPhone: "",
		organizerName: "",
		organizerDescription: "",
		website: "",
		status: "upcoming",
	});

	useEffect(() => {
		if (eventId) {
			fetchEventById(eventId);
		}
	}, [eventId, fetchEventById]);

	useEffect(() => {
		if (currentEvent) {
			const event = currentEvent;
			setFormData({
				title: event.title || "",
				summary: event.summary || "",
				description: event.description || "",
				category: event.category || "",
				tags: event.tags?.join(", ") || "",
				eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
				eventTime: event.eventTime || "",
				endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
				endTime: event.endTime || "",
				locationType: event.locationType || "venue",
				location: event.location || "",
				venue: event.venue || "",
				street: event.address?.street || "",
				city: event.address?.city || "",
				state: event.address?.state || "",
				zipCode: event.address?.zipCode || "",
				onlineEventUrl: event.onlineEventUrl || "",
				ticketPrice: event.ticketPrice?.toString() || "0",
				capacity: event.capacity?.toString() || "",
				ticketsAvailable: event.ticketsAvailable?.toString() || "",
				maxTicketsPerOrder: event.maxTicketsPerOrder?.toString() || "10",
				duration: event.highlights?.duration || "",
				ageRestriction: event.highlights?.ageRestriction || "all-ages",
				format: event.highlights?.format || "in-person",
				parking: event.highlights?.parking || "",
				dresscode: event.highlights?.dresscode || "",
				refundPolicy: event.refundPolicy || "no-refunds",
				refundPolicyText: event.refundPolicyText || "",
				contactEmail: event.contactEmail || "",
				contactPhone: event.contactPhone || "",
				organizerName: event.organizerName || "",
				organizerDescription: event.organizerDescription || "",
				website: event.socialLinks?.website || "",
				status: event.status || "upcoming",
			});
			setImagePreview(event.imageUrl);
		}
	}, [currentEvent]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error("Please enter an event title");
			setActiveTab("basic");
			return;
		}

		setIsSaving(true);

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
		if (formData.onlineEventUrl) submitData.append("onlineEventUrl", formData.onlineEventUrl);

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
		submitData.append("ticketsAvailable", formData.ticketsAvailable);
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
		submitData.append("refundPolicyText", formData.refundPolicyText);

		// Contact
		if (formData.contactEmail) submitData.append("contactEmail", formData.contactEmail.trim());
		if (formData.contactPhone) submitData.append("contactPhone", formData.contactPhone.trim());
		if (formData.organizerName) submitData.append("organizerName", formData.organizerName.trim());
		if (formData.organizerDescription) submitData.append("organizerDescription", formData.organizerDescription.trim());

		// Social links
		const socialLinks = { website: formData.website || null };
		submitData.append("socialLinks", JSON.stringify(socialLinks));

		// Status
		submitData.append("status", formData.status);

		try {
			await updateEvent(eventId!, submitData);
			toast.success("Event updated successfully!");
			navigate("/my-events");
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to update event");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading || !currentEvent) {
		return (
			<div className="h-full flex items-center justify-center bg-zinc-950">
				<div className="flex flex-col items-center gap-4">
					<div className="size-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
					<p className="text-zinc-400">Loading event...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full bg-zinc-950">
			<ScrollArea className="h-full">
				{/* Header */}
				<div className="bg-gradient-to-r from-emerald-900/20 to-zinc-900 border-b border-zinc-800 p-6">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => navigate("/my-events")}
								className="text-zinc-400 hover:text-white"
							>
								<ArrowLeft className="size-5" />
							</Button>
							<div>
								<h1 className="text-2xl font-bold text-white">Edit Event</h1>
								<p className="text-zinc-400">{currentEvent.title}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form */}
				<div className="max-w-4xl mx-auto p-6">
					<Card className="bg-zinc-900 border-zinc-800">
						<CardContent className="p-6">
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<TabsList className="grid grid-cols-6 bg-zinc-800 mb-6">
									<TabsTrigger value="basic">Basic</TabsTrigger>
									<TabsTrigger value="datetime">Date</TabsTrigger>
									<TabsTrigger value="location">Location</TabsTrigger>
									<TabsTrigger value="tickets">Tickets</TabsTrigger>
									<TabsTrigger value="details">Details</TabsTrigger>
									<TabsTrigger value="contact">Contact</TabsTrigger>
								</TabsList>

								<form onSubmit={handleSubmit}>
									{/* Basic Info Tab */}
									<TabsContent value="basic" className="space-y-4">
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
												</div>
											) : (
												<div className="relative rounded-lg overflow-hidden">
													<img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
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
											<Input name="title" value={formData.title} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Summary</label>
											<Input name="summary" value={formData.summary} onChange={handleChange} maxLength={140} className="bg-zinc-800 border-zinc-700" />
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Description</label>
											<Textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="bg-zinc-800 border-zinc-700 resize-none" />
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Category</label>
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
												<label className="text-sm font-medium text-zinc-300">Status</label>
												<Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
													<SelectTrigger className="bg-zinc-800 border-zinc-700">
														<SelectValue />
													</SelectTrigger>
													<SelectContent className="bg-zinc-800 border-zinc-700">
														<SelectItem value="draft">Draft</SelectItem>
														<SelectItem value="upcoming">Upcoming</SelectItem>
														<SelectItem value="ongoing">Ongoing</SelectItem>
														<SelectItem value="completed">Completed</SelectItem>
														<SelectItem value="cancelled">Cancelled</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</TabsContent>

									{/* Date & Time Tab */}
									<TabsContent value="datetime" className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Start Date *</label>
												<Input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Start Time *</label>
												<Input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">End Date</label>
												<Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">End Time</label>
												<Input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
											</div>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Duration</label>
											<Input name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 3 hours" className="bg-zinc-800 border-zinc-700" />
										</div>
									</TabsContent>

									{/* Location Tab */}
									<TabsContent value="location" className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Location *</label>
											<Input name="location" value={formData.location} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Venue</label>
											<Input name="venue" value={formData.venue} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Street</label>
											<Input name="street" value={formData.street} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
										</div>
										<div className="grid grid-cols-3 gap-4">
											<Input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="bg-zinc-800 border-zinc-700" />
											<Input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="bg-zinc-800 border-zinc-700" />
											<Input name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Zip" className="bg-zinc-800 border-zinc-700" />
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Parking</label>
											<Input name="parking" value={formData.parking} onChange={handleChange} placeholder="Free, Paid, Street parking" className="bg-zinc-800 border-zinc-700" />
										</div>
									</TabsContent>

									{/* Tickets Tab */}
									<TabsContent value="tickets" className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Ticket Price ($)</label>
												<Input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} min="0" step="0.01" className="bg-zinc-800 border-zinc-700" />
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Total Capacity</label>
												<Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" className="bg-zinc-800 border-zinc-700" />
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Tickets Available</label>
												<Input type="number" name="ticketsAvailable" value={formData.ticketsAvailable} onChange={handleChange} min="0" className="bg-zinc-800 border-zinc-700" />
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Max Per Order</label>
												<Input type="number" name="maxTicketsPerOrder" value={formData.maxTicketsPerOrder} onChange={handleChange} min="1" className="bg-zinc-800 border-zinc-700" />
											</div>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Refund Policy</label>
											<Select value={formData.refundPolicy} onValueChange={(v) => handleSelectChange("refundPolicy", v)}>
												<SelectTrigger className="bg-zinc-800 border-zinc-700">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="bg-zinc-800 border-zinc-700">
													{refundPolicies.map((p) => (
														<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</TabsContent>

									{/* Details Tab */}
									<TabsContent value="details" className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Age Restriction</label>
												<Select value={formData.ageRestriction} onValueChange={(v) => handleSelectChange("ageRestriction", v)}>
													<SelectTrigger className="bg-zinc-800 border-zinc-700">
														<SelectValue />
													</SelectTrigger>
													<SelectContent className="bg-zinc-800 border-zinc-700">
														{ageRestrictions.map((a) => (
															<SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
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
											<Input name="dresscode" value={formData.dresscode} onChange={handleChange} placeholder="Casual, Formal, etc." className="bg-zinc-800 border-zinc-700" />
										</div>
									</TabsContent>

									{/* Contact Tab */}
									<TabsContent value="contact" className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Organizer Name</label>
											<Input name="organizerName" value={formData.organizerName} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Email</label>
												<Input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-300">Phone</label>
												<Input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
											</div>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">Website</label>
											<Input name="website" value={formData.website} onChange={handleChange} className="bg-zinc-800 border-zinc-700" />
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-zinc-300">About Organizer</label>
											<Textarea name="organizerDescription" value={formData.organizerDescription} onChange={handleChange} rows={3} className="bg-zinc-800 border-zinc-700 resize-none" />
										</div>
									</TabsContent>

									{/* Actions */}
									<div className="flex justify-between items-center pt-6 mt-6 border-t border-zinc-800">
										<Button type="button" variant="ghost" onClick={() => navigate("/my-events")}>
											Cancel
										</Button>
										<Button type="submit" disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600">
											{isSaving ? (
												<>
													<div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
													Saving...
												</>
											) : (
												<>
													<Save className="size-4 mr-2" />
													Save Changes
												</>
											)}
										</Button>
									</div>
								</form>
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</ScrollArea>
		</div>
	);
};

export default EditEventPage;