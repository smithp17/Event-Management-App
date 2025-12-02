// frontend/src/pages/event-detail/EventDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useEventStore } from "@/stores/useEventStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Calendar,
	Clock,
	MapPin,
	Users,
	Share2,
	Heart,
	ArrowLeft,
	Ticket,
	Mail,
	Phone,
	Globe,
	Car,
	User,
	AlertCircle,
	CheckCircle,
	Minus,
	Plus,
	ExternalLink,
	Copy,
	MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const EventDetailPage = () => {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { user, isSignedIn } = useUser();
	const { currentEvent, fetchEventById, bookTickets, isLoading } = useEventStore();

	const [bookingOpen, setBookingOpen] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [contactOpen, setContactOpen] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);
	const [isBooking, setIsBooking] = useState(false);
	const [isSaved, setIsSaved] = useState(false);

	useEffect(() => {
		if (eventId) {
			fetchEventById(eventId);
		}
	}, [eventId, fetchEventById]);

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

	const event = currentEvent;
	const isOwner = user?.id === event.createdBy;
	const isSoldOut = event.ticketsAvailable === 0;
	const ticketsSold = event.capacity - event.ticketsAvailable;
	const soldPercentage = (ticketsSold / event.capacity) * 100;

	// Format dates
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
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

	// Handle booking
	const handleBooking = async () => {
		if (!isSignedIn) {
			toast.error("Please sign in to book tickets");
			return;
		}

		setIsBooking(true);
		try {
			await bookTickets(event._id, quantity);
			toast.success(`Successfully booked ${quantity} ticket${quantity > 1 ? "s" : ""}!`);
			setBookingOpen(false);
			setQuantity(1);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to book tickets");
		} finally {
			setIsBooking(false);
		}
	};

	// Message creator - navigate to chat with creator
	const handleMessageCreator = () => {
		if (!isSignedIn) {
			toast.error("Please sign in to message the organizer");
			return;
		}
		// Navigate to chat with the creator's ID
		navigate(`/chat?userId=${event.createdBy}`);
	};

	// Share functionality
	const handleShare = async (platform?: string) => {
		const url = window.location.href;
		const text = `Check out ${event.title}`;

		if (platform === "copy") {
			await navigator.clipboard.writeText(url);
			toast.success("Link copied to clipboard!");
		} else if (navigator.share) {
			await navigator.share({ title: event.title, text, url });
		}
		setShareOpen(false);
	};

	const totalPrice = quantity * event.ticketPrice;
	const maxQuantity = Math.min(event.ticketsAvailable, event.maxTicketsPerOrder || 10);

	return (
		<div className="h-full bg-zinc-950 overflow-hidden">
			<ScrollArea className="h-full">
				{/* Hero Image */}
				<div className="relative h-[300px] md:h-[400px]">
					<img
						src={event.imageUrl}
						alt={event.title}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
					
					{/* Navigation */}
					<div className="absolute top-4 left-4 right-4 flex justify-between">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(-1)}
							className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
						>
							<ArrowLeft className="size-5" />
						</Button>
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsSaved(!isSaved)}
								className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
							>
								<Heart className={`size-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShareOpen(true)}
								className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
							>
								<Share2 className="size-5" />
							</Button>
						</div>
					</div>

					{/* Badges */}
					<div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
						<span className="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
							{event.category}
						</span>
						{isSoldOut && (
							<span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
								Sold Out
							</span>
						)}
					</div>
				</div>

				<div className="max-w-6xl mx-auto px-4 py-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-6">
							{/* Title */}
							<div>
								<h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
									{event.title}
								</h1>
								{event.summary && (
									<p className="text-lg text-zinc-400">{event.summary}</p>
								)}
							</div>

							{/* Date & Time */}
							<Card className="bg-zinc-900/50 border-zinc-800">
								<CardContent className="p-4">
									<h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
										<Calendar className="size-5 text-emerald-500" />
										Date and Time
									</h3>
									<div className="space-y-2 text-zinc-300">
										<p className="text-lg">{formatDate(event.eventDate)}</p>
										<p className="flex items-center gap-2">
											<Clock className="size-4 text-zinc-500" />
											{formatTime(event.eventTime)}
											{event.endTime && ` - ${formatTime(event.endTime)}`}
										</p>
										{event.endDate && event.endDate !== event.eventDate && (
											<p className="text-zinc-400">
												Ends: {formatDate(event.endDate)}
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Location */}
							<Card className="bg-zinc-900/50 border-zinc-800">
								<CardContent className="p-4">
									<h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
										<MapPin className="size-5 text-emerald-500" />
										Location
									</h3>
									<div className="space-y-1 text-zinc-300">
										{event.venue && <p className="text-lg font-medium">{event.venue}</p>}
										<p>{event.location}</p>
										{event.address && (
											<p className="text-zinc-400">
												{[event.address.street, event.address.city, event.address.state, event.address.zipCode]
													.filter(Boolean)
													.join(", ")}
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Highlights */}
							{event.highlights && Object.values(event.highlights).some(v => v) && (
								<Card className="bg-zinc-900/50 border-zinc-800">
									<CardContent className="p-4">
										<h3 className="text-lg font-semibold text-white mb-4">Highlights</h3>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
											{event.highlights.duration && (
												<div className="flex items-center gap-3">
													<div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center">
														<Clock className="size-5 text-emerald-500" />
													</div>
													<div>
														<p className="text-xs text-zinc-500">Duration</p>
														<p className="text-white">{event.highlights.duration}</p>
													</div>
												</div>
											)}
											{event.highlights.ageRestriction && (
												<div className="flex items-center gap-3">
													<div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center">
														<User className="size-5 text-emerald-500" />
													</div>
													<div>
														<p className="text-xs text-zinc-500">Age</p>
														<p className="text-white">{event.highlights.ageRestriction}</p>
													</div>
												</div>
											)}
											{event.highlights.format && (
												<div className="flex items-center gap-3">
													<div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center">
														<Globe className="size-5 text-emerald-500" />
													</div>
													<div>
														<p className="text-xs text-zinc-500">Format</p>
														<p className="text-white capitalize">{event.highlights.format.replace("-", " ")}</p>
													</div>
												</div>
											)}
											{event.highlights.parking && (
												<div className="flex items-center gap-3">
													<div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center">
														<Car className="size-5 text-emerald-500" />
													</div>
													<div>
														<p className="text-xs text-zinc-500">Parking</p>
														<p className="text-white">{event.highlights.parking}</p>
													</div>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Refund Policy */}
							{event.refundPolicy && (
								<Card className="bg-zinc-900/50 border-zinc-800">
									<CardContent className="p-4">
										<h3 className="text-lg font-semibold text-white mb-2">Refund Policy</h3>
										<p className="text-zinc-400">
											{event.refundPolicy === "no-refunds" && "No refunds available for this event."}
											{event.refundPolicy === "1-day" && "Refunds available up to 1 day before the event."}
											{event.refundPolicy === "7-days" && "Refunds available up to 7 days before the event."}
											{event.refundPolicy === "30-days" && "Refunds available up to 30 days before the event."}
											{event.refundPolicy === "flexible" && "Flexible refund policy - refunds available anytime."}
										</p>
									</CardContent>
								</Card>
							)}

							{/* Description */}
							{event.description && (
								<Card className="bg-zinc-900/50 border-zinc-800">
									<CardContent className="p-4">
										<h3 className="text-lg font-semibold text-white mb-3">About this event</h3>
										<div className="text-zinc-300 whitespace-pre-wrap">{event.description}</div>
									</CardContent>
								</Card>
							)}

							{/* Organizer / Contact Creator */}
							<Card className="bg-zinc-900/50 border-zinc-800">
								<CardContent className="p-4">
									<h3 className="text-lg font-semibold text-white mb-4">Contact Organizer</h3>
									<div className="flex items-start gap-4">
										<div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
											<User className="size-6 text-emerald-500" />
										</div>
										<div className="flex-1">
											<p className="text-white font-medium">
												{event.organizerName || "Event Organizer"}
											</p>
											{event.organizerDescription && (
												<p className="text-zinc-400 text-sm mt-1">{event.organizerDescription}</p>
											)}
											
											{/* Contact Options */}
											<div className="flex flex-wrap gap-2 mt-4">
												{/* Message Creator - Primary Action */}
												{!isOwner && (
													<Button
														onClick={handleMessageCreator}
														className="bg-emerald-500 hover:bg-emerald-600 text-white"
													>
														<MessageSquare className="size-4 mr-2" />
														Message Creator
													</Button>
												)}
												
												{/* Email */}
												{event.contactEmail && (
													<a href={`mailto:${event.contactEmail}`}>
														<Button
															variant="outline"
															className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
														>
															<Mail className="size-4 mr-2" />
															Email
														</Button>
													</a>
												)}
												
												{/* Phone */}
												{event.contactPhone && (
													<a href={`tel:${event.contactPhone}`}>
														<Button
															variant="outline"
															className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
														>
															<Phone className="size-4 mr-2" />
															Call
														</Button>
													</a>
												)}
												
												{/* Website */}
												{event.socialLinks?.website && (
													<a href={event.socialLinks.website} target="_blank" rel="noopener noreferrer">
														<Button
															variant="outline"
															className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
														>
															<Globe className="size-4 mr-2" />
															Website
														</Button>
													</a>
												)}
											</div>

											{/* Show contact details */}
											{(event.contactEmail || event.contactPhone) && (
												<div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
													{event.contactEmail && (
														<p className="text-sm text-zinc-400 flex items-center gap-2">
															<Mail className="size-4" />
															{event.contactEmail}
														</p>
													)}
													{event.contactPhone && (
														<p className="text-sm text-zinc-400 flex items-center gap-2">
															<Phone className="size-4" />
															{event.contactPhone}
														</p>
													)}
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar - Ticket Purchase */}
						<div className="lg:col-span-1">
							<div className="sticky top-4">
								<Card className="bg-zinc-900 border-zinc-800">
									<CardContent className="p-6">
										{/* Price */}
										<div className="text-center mb-4">
											<p className="text-3xl font-bold text-white">
												{event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice.toFixed(2)}`}
											</p>
											{event.ticketPrice > 0 && (
												<p className="text-zinc-500 text-sm">per ticket</p>
											)}
										</div>

										{/* Availability */}
										<div className="mb-4">
											<div className="flex justify-between text-sm mb-1">
												<span className="text-zinc-400">Availability</span>
												<span className="text-white">
													{event.ticketsAvailable} / {event.capacity}
												</span>
											</div>
											<div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
												<div
													className={`h-full rounded-full transition-all ${
														soldPercentage > 90 ? "bg-red-500" :
														soldPercentage > 70 ? "bg-amber-500" : "bg-emerald-500"
													}`}
													style={{ width: `${soldPercentage}%` }}
												/>
											</div>
											{soldPercentage > 70 && !isSoldOut && (
												<p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
													<AlertCircle className="size-3" />
													Selling fast!
												</p>
											)}
										</div>

										<div className="h-px bg-zinc-800 my-4" />

										{/* Book Button */}
										{isOwner ? (
											<div className="text-center py-4">
												<p className="text-zinc-400 mb-2">You created this event</p>
												<Link to={`/my-events/${event._id}/edit`}>
													<Button variant="outline" className="w-full border-zinc-700">
														Edit Event
													</Button>
												</Link>
											</div>
										) : isSoldOut ? (
											<Button disabled className="w-full bg-zinc-700 text-zinc-400">
												Sold Out
											</Button>
										) : (
											<Button
												onClick={() => setBookingOpen(true)}
												className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg"
											>
												<Ticket className="size-5 mr-2" />
												Get Tickets
											</Button>
										)}

										{/* Stats */}
										<div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-800">
											<div className="text-center">
												<p className="text-2xl font-bold text-white">{ticketsSold}</p>
												<p className="text-xs text-zinc-500">Registered</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold text-white">{event.views || 0}</p>
												<p className="text-xs text-zinc-500">Views</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>

			{/* Booking Dialog */}
			<Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle>Get Tickets</DialogTitle>
						<DialogDescription className="text-zinc-400">
							{event.title}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						{/* Quantity Selector */}
						<div>
							<label className="text-sm text-zinc-400 mb-2 block">Number of Tickets</label>
							<div className="flex items-center justify-center gap-4">
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									disabled={quantity <= 1}
									className="border-zinc-700"
								>
									<Minus className="size-4" />
								</Button>
								<span className="text-3xl font-bold w-16 text-center">{quantity}</span>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
									disabled={quantity >= maxQuantity}
									className="border-zinc-700"
								>
									<Plus className="size-4" />
								</Button>
							</div>
							<p className="text-xs text-zinc-500 text-center mt-2">
								Max {maxQuantity} tickets per order
							</p>
						</div>

						{/* Price Summary */}
						<div className="bg-zinc-800/50 rounded-lg p-4">
							<div className="flex justify-between text-zinc-400 mb-2">
								<span>{quantity}x {event.ticketPrice === 0 ? "Free Ticket" : `$${event.ticketPrice.toFixed(2)}`}</span>
								<span>${totalPrice.toFixed(2)}</span>
							</div>
							<div className="h-px bg-zinc-700 my-2" />
							<div className="flex justify-between text-white font-semibold">
								<span>Total</span>
								<span>${totalPrice.toFixed(2)}</span>
							</div>
						</div>

						{/* Book Button */}
						<Button
							onClick={handleBooking}
							disabled={isBooking}
							className="w-full bg-emerald-500 hover:bg-emerald-600 py-6"
						>
							{isBooking ? (
								<span className="flex items-center gap-2">
									<div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Processing...
								</span>
							) : (
								<span className="flex items-center gap-2">
									<CheckCircle className="size-5" />
									Confirm Booking
								</span>
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Share Dialog */}
			<Dialog open={shareOpen} onOpenChange={setShareOpen}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle>Share Event</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<Button
							variant="outline"
							onClick={() => handleShare("copy")}
							className="w-full flex items-center justify-center gap-2 border-zinc-700"
						>
							<Copy className="size-5" />
							Copy Link
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EventDetailPage;