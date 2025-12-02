// frontend/src/pages/home/HomePage.tsx
import { useEffect, useState, useRef } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useUser, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { 
	Calendar, 
	MapPin, 
	Users, 
	ArrowRight, 
	Sparkles, 
	Play,
	Music,
	Briefcase,
	PartyPopper,
	ChevronLeft,
	ChevronRight,
	Ticket,
	Star,
	TrendingUp,
	Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Background images for the hero slideshow
const HERO_IMAGES = [
	{
		url: "/images/concert.jpg",
		title: "Live Concerts",
		subtitle: "Experience the energy of live music",
		icon: Music,
		gradient: "from-purple-600 via-pink-500 to-orange-400",
		bgGradient: "from-purple-900/40 to-pink-900/40",
	},
	{
		url: "/images/office.jpg",
		title: "Business Events",
		subtitle: "Network and grow your career",
		icon: Briefcase,
		gradient: "from-blue-600 via-cyan-500 to-teal-400",
		bgGradient: "from-blue-900/40 to-cyan-900/40",
	},
	{
		url: "/images/party.jpg",
		title: "Celebrations",
		subtitle: "Make unforgettable memories",
		icon: PartyPopper,
		gradient: "from-rose-600 via-pink-500 to-purple-400",
		bgGradient: "from-rose-900/40 to-purple-900/40",
	},
];

// Animated counter component
const AnimatedCounter = ({ value, label, icon: Icon, color }: { value: number; label: string; icon: any; color: string }) => {
	const [count, setCount] = useState(0);
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setIsVisible(true);
			},
			{ threshold: 0.1 }
		);
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!isVisible) return;
		const duration = 2000;
		const steps = 60;
		const stepValue = value / steps;
		let current = 0;
		const timer = setInterval(() => {
			current += stepValue;
			if (current >= value) {
				setCount(value);
				clearInterval(timer);
			} else {
				setCount(Math.floor(current));
			}
		}, duration / steps);
		return () => clearInterval(timer);
	}, [isVisible, value]);

	return (
		<div ref={ref} className="text-center group">
			<div className={cn(
				"inline-flex items-center justify-center size-16 rounded-2xl mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
				color
			)}>
				<Icon className="size-8 text-white" />
			</div>
			<div className="text-3xl font-bold text-zinc-800 mb-1">{count.toLocaleString()}+</div>
			<div className="text-zinc-500 text-sm font-medium">{label}</div>
		</div>
	);
};

const HomePage = () => {
	const { user, isSignedIn } = useUser();
	const { events, featuredEvents, fetchAllEvents, fetchFeaturedEvents, isLoading } = useEventStore();
	const [currentSlide, setCurrentSlide] = useState(0);

	useEffect(() => {
		fetchAllEvents();
		fetchFeaturedEvents();
	}, []);

	// Auto-slide for hero images
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
	const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
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

	const EventCard = ({ event, index }: { event: any; index: number }) => {
		const ticketsSold = event.capacity - event.ticketsAvailable;
		const soldPercentage = (ticketsSold / event.capacity) * 100;
		const isSoldOut = event.ticketsAvailable === 0;

		const cardColors = [
			"hover:shadow-purple-500/20",
			"hover:shadow-blue-500/20",
			"hover:shadow-pink-500/20",
			"hover:shadow-orange-500/20",
		];

		return (
			<Link 
				to={`/events/${event._id}`} 
				className="block group animate-fade-in-up"
				style={{ animationDelay: `${index * 100}ms` }}
			>
				<div className={cn(
					"bg-white rounded-2xl overflow-hidden border border-zinc-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl",
					cardColors[index % cardColors.length]
				)}>
					{/* Image */}
					<div className="relative h-48 overflow-hidden">
						<img
							src={event.imageUrl}
							alt={event.title}
							className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
						
						{/* Category Badge */}
						<div className="absolute top-3 left-3">
							<span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
								{event.category}
							</span>
						</div>

						{/* Price Badge */}
						<div className="absolute top-3 right-3">
							<span className="px-3 py-1.5 bg-white/95 text-zinc-800 text-sm font-bold rounded-full shadow-lg">
								{event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice}`}
							</span>
						</div>

						{/* Sold Out Overlay */}
						{isSoldOut && (
							<div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
								<span className="px-6 py-3 bg-red-500 text-white font-bold rounded-full">
									SOLD OUT
								</span>
							</div>
						)}
					</div>

					{/* Content */}
					<div className="p-5">
						<h3 className="text-lg font-bold text-zinc-800 mb-3 line-clamp-1 group-hover:text-purple-600 transition-colors">
							{event.title}
						</h3>

						<div className="space-y-2.5 text-sm">
							<div className="flex items-center gap-2 text-zinc-600">
								<Calendar className="size-4 text-purple-500 flex-shrink-0" />
								<span>{formatDate(event.eventDate)} at {formatTime(event.eventTime)}</span>
							</div>
							<div className="flex items-center gap-2 text-zinc-600">
								<MapPin className="size-4 text-pink-500 flex-shrink-0" />
								<span className="truncate">{event.venue || event.location}</span>
							</div>
							<div className="flex items-center gap-2 text-zinc-600">
								<Users className="size-4 text-blue-500 flex-shrink-0" />
								<span>{event.ticketsAvailable} / {event.capacity} spots left</span>
							</div>
						</div>

						{/* Progress Bar */}
						<div className="mt-4">
							<div className="flex justify-between text-xs mb-1.5">
								<span className="text-zinc-400 font-medium">Tickets sold</span>
								<span className="text-purple-600 font-bold">{Math.round(soldPercentage)}%</span>
							</div>
							<div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
								<div
									className={cn(
										"h-full rounded-full transition-all duration-1000",
										soldPercentage > 90 ? "bg-gradient-to-r from-red-500 to-orange-500" :
										soldPercentage > 70 ? "bg-gradient-to-r from-amber-500 to-yellow-500" : 
										"bg-gradient-to-r from-purple-500 to-pink-500"
									)}
									style={{ width: `${soldPercentage}%` }}
								/>
							</div>
						</div>
					</div>
				</div>
			</Link>
		);
	};

	const currentImage = HERO_IMAGES[currentSlide];

	return (
		<div className="h-full bg-zinc-50">
			<ScrollArea className="h-full">
				{/* Hero Section */}
				<div className="relative min-h-[650px] overflow-hidden">
					{/* Sliding Background Images */}
					{HERO_IMAGES.map((image, index) => (
						<div
							key={index}
							className={cn(
								"absolute inset-0 transition-opacity duration-1000",
								index === currentSlide ? "opacity-100" : "opacity-0"
							)}
						>
							<img
								src={image.url}
								alt={image.title}
								className="w-full h-full object-cover"
							/>
							{/* Colorful Gradient Overlay */}
							<div className={cn(
								"absolute inset-0 bg-gradient-to-br opacity-80",
								image.bgGradient
							)} />
							<div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
							<div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent" />
						</div>
					))}

					{/* Decorative Shapes */}
					<div className="absolute top-20 right-20 size-72 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl" />
					<div className="absolute bottom-40 left-20 size-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl" />

					{/* Hero Content */}
					<div className="relative z-10 h-full flex items-center py-20">
						<div className="max-w-6xl mx-auto px-6 w-full">
							<div className="grid lg:grid-cols-2 gap-12 items-center">
								{/* Left Content */}
								<div className="space-y-8">
									{/* Badge */}
									<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg animate-fade-in">
										<Zap className="size-4 text-yellow-500" />
										<span className="text-zinc-700 text-sm font-semibold">
											{events.length}+ Events Available Now
										</span>
									</div>

									{/* Main Heading */}
									<h1 className="text-5xl lg:text-7xl font-black leading-tight">
										<span className="text-white drop-shadow-lg animate-slide-in-left">Discover</span>
										<br />
										<span className={cn(
											"inline-block animate-slide-in-left animation-delay-200 bg-gradient-to-r bg-clip-text text-transparent drop-shadow-lg",
											currentImage.gradient
										)}>
											Amazing
										</span>
										<br />
										<span className="text-white drop-shadow-lg animate-slide-in-left animation-delay-400">Events</span>
									</h1>

									{/* Subtitle */}
									<p className="text-xl text-white/90 max-w-lg animate-fade-in animation-delay-600 drop-shadow-md">
										Find unforgettable experiences. Book tickets instantly. 
										Create memories that last a lifetime.
									</p>

									{/* CTA Buttons */}
									<div className="flex flex-wrap gap-4 animate-fade-in animation-delay-800">
										<Link to="/browse">
											<Button size="lg" className={cn(
												"bg-gradient-to-r text-white px-8 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105",
												currentImage.gradient
											)}>
												<Play className="size-5 mr-2" />
												Explore Events
												<ArrowRight className="size-5 ml-2" />
											</Button>
										</Link>
										{isSignedIn ? (
											<Link to="/my-events">
												<Button size="lg" className="bg-white/95 backdrop-blur-sm text-zinc-800 px-8 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:bg-white">
													Create Event
												</Button>
											</Link>
										) : (
											<SignInButton mode="modal">
												<Button size="lg" className="bg-white/95 backdrop-blur-sm text-zinc-800 px-8 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:bg-white">
													Get Started
												</Button>
											</SignInButton>
										)}
									</div>
								</div>

								{/* Right Content - Fixed Info Card */}
								<div className="hidden lg:block">
									<div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
										{/* Card Header */}
										<div className="flex items-center gap-4 mb-6">
											<div className={cn(
												"p-4 rounded-2xl bg-gradient-to-br shadow-lg",
												currentImage.gradient
											)}>
												<currentImage.icon className="size-10 text-white" />
											</div>
											<div>
												<h3 className="text-2xl font-bold text-zinc-800">{currentImage.title}</h3>
												<p className="text-zinc-500">{currentImage.subtitle}</p>
											</div>
										</div>
										
										{/* Features List */}
										<div className="space-y-4 mb-6">
											<div className="flex items-center gap-3 text-zinc-700">
												<div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
													<Star className="size-4 text-green-600" />
												</div>
												<span className="font-medium">Curated events for every taste</span>
											</div>
											<div className="flex items-center gap-3 text-zinc-700">
												<div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
													<Ticket className="size-4 text-blue-600" />
												</div>
												<span className="font-medium">Secure & instant booking</span>
											</div>
											<div className="flex items-center gap-3 text-zinc-700">
												<div className="size-8 rounded-full bg-purple-100 flex items-center justify-center">
													<TrendingUp className="size-4 text-purple-600" />
												</div>
												<span className="font-medium">Real-time availability</span>
											</div>
										</div>

										{/* Slide Navigation */}
										<div className="flex items-center justify-between pt-4 border-t border-zinc-100">
											<div className="flex gap-2">
												{HERO_IMAGES.map((img, index) => (
													<button
														key={index}
														onClick={() => setCurrentSlide(index)}
														className={cn(
															"h-2 rounded-full transition-all duration-300",
															index === currentSlide 
																? `w-8 bg-gradient-to-r ${img.gradient}` 
																: "w-2 bg-zinc-200 hover:bg-zinc-300"
														)}
													/>
												))}
											</div>
											<div className="flex gap-2">
												<button
													onClick={prevSlide}
													className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
												>
													<ChevronLeft className="size-4 text-zinc-600" />
												</button>
												<button
													onClick={nextSlide}
													className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
												>
													<ChevronRight className="size-4 text-zinc-600" />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Section */}
				<div className="bg-white py-16 border-b border-zinc-100">
					<div className="max-w-6xl mx-auto px-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
							<AnimatedCounter value={events.length || 50} label="Total Events" icon={Calendar} color="bg-gradient-to-br from-purple-500 to-pink-500" />
							<AnimatedCounter value={1000} label="Happy Attendees" icon={Users} color="bg-gradient-to-br from-blue-500 to-cyan-500" />
							<AnimatedCounter value={500} label="Tickets Sold" icon={Ticket} color="bg-gradient-to-br from-orange-500 to-yellow-500" />
							<AnimatedCounter value={100} label="Event Organizers" icon={Sparkles} color="bg-gradient-to-br from-green-500 to-emerald-500" />
						</div>
					</div>
				</div>

				{/* Categories Section */}
				<div className="py-16 px-6 bg-gradient-to-b from-white to-zinc-50">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-zinc-800 mb-4">Browse by Category</h2>
							<p className="text-zinc-500">Find events that match your interests</p>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{[
								{ name: "Music", icon: Music, gradient: "from-purple-500 to-pink-500", bg: "bg-purple-50 hover:bg-purple-100" },
								{ name: "Business", icon: Briefcase, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50 hover:bg-blue-100" },
								{ name: "Sports", icon: Play, gradient: "from-orange-500 to-red-500", bg: "bg-orange-50 hover:bg-orange-100" },
								{ name: "Party", icon: PartyPopper, gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50 hover:bg-pink-100" },
							].map((category, index) => (
								<Link
									key={category.name}
									to={`/browse?category=${category.name}`}
									className="group animate-fade-in-up"
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<div className={cn(
										"p-6 rounded-2xl border border-zinc-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
										category.bg
									)}>
										<div className="flex flex-col items-center gap-4">
											<div className={cn(
												"p-4 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
												category.gradient
											)}>
												<category.icon className="size-8 text-white" />
											</div>
											<span className="text-zinc-800 font-bold text-lg">{category.name}</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="max-w-6xl mx-auto px-6 py-16">
					{/* Featured Events */}
					{featuredEvents.length > 0 && (
						<section className="mb-16">
							<div className="flex items-center justify-between mb-8">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
										<Sparkles className="size-6 text-white" />
									</div>
									<div>
										<h2 className="text-2xl font-bold text-zinc-800">Featured Events</h2>
										<p className="text-zinc-500 text-sm">Hand-picked experiences for you</p>
									</div>
								</div>
								<Link to="/browse">
									<Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 hover:shadow-lg transition-shadow group">
										View All
										<ArrowRight className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
									</Button>
								</Link>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{featuredEvents.slice(0, 8).map((event: any, index: number) => (
									<EventCard key={event._id} event={event} index={index} />
								))}
							</div>
						</section>
					)}

					{/* All Events */}
					<section>
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-3">
								<div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
									<Calendar className="size-6 text-white" />
								</div>
								<div>
									<h2 className="text-2xl font-bold text-zinc-800">All Events</h2>
									<p className="text-zinc-500 text-sm">Explore everything happening near you</p>
								</div>
							</div>
							<Link to="/browse">
								<Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-6 hover:shadow-lg transition-shadow group">
									View All
									<ArrowRight className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
								</Button>
							</Link>
						</div>

						{isLoading ? (
							<div className="flex items-center justify-center h-64">
								<div className="flex flex-col items-center gap-4">
									<div className="relative">
										<div className="size-16 border-4 border-purple-200 rounded-full" />
										<div className="absolute inset-0 size-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
									</div>
									<p className="text-zinc-500 font-medium">Loading amazing events...</p>
								</div>
							</div>
						) : events.length === 0 ? (
							<div className="text-center py-20 bg-white rounded-3xl border border-zinc-200">
								<div className="relative inline-block mb-6">
									<div className="size-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
										<Calendar className="size-12 text-purple-400" />
									</div>
									<div className="absolute -top-2 -right-2 size-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
										<span className="text-white text-lg font-bold">!</span>
									</div>
								</div>
								<h3 className="text-2xl font-bold text-zinc-800 mb-3">No Events Yet</h3>
								<p className="text-zinc-500 mb-8 max-w-md mx-auto">
									Be a pioneer! Create the first event and start building your community.
								</p>
								{isSignedIn ? (
									<Link to="/my-events">
										<Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
											Create Your First Event
											<ArrowRight className="size-5 ml-2" />
										</Button>
									</Link>
								) : (
									<SignInButton mode="modal">
										<Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
											Sign In to Create Events
										</Button>
									</SignInButton>
								)}
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{events.map((event: any, index: number) => (
									<EventCard key={event._id} event={event} index={index} />
								))}
							</div>
						)}
					</section>
				</div>

				{/* CTA Section */}
				<div className="relative py-24 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
					<div className="absolute inset-0 bg-[url('/images/concert.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay" />
					
					{/* Decorative Blobs */}
					<div className="absolute top-0 left-0 size-64 bg-white/10 rounded-full blur-3xl" />
					<div className="absolute bottom-0 right-0 size-96 bg-white/10 rounded-full blur-3xl" />
					
					<div className="relative max-w-4xl mx-auto px-6 text-center">
						<h2 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-lg">
							Ready to Create Your Own Event?
						</h2>
						<p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
							Join thousands of organizers who use our platform to create unforgettable experiences.
						</p>
						{isSignedIn ? (
							<Link to="/my-events">
								<Button size="lg" className="bg-white text-purple-600 hover:bg-zinc-100 px-12 py-7 text-xl font-bold rounded-full shadow-2xl hover:scale-105 transition-transform">
									Start Creating Now
									<ArrowRight className="size-6 ml-2" />
								</Button>
							</Link>
						) : (
							<SignInButton mode="modal">
								<Button size="lg" className="bg-white text-purple-600 hover:bg-zinc-100 px-12 py-7 text-xl font-bold rounded-full shadow-2xl hover:scale-105 transition-transform">
									Get Started Free
									<ArrowRight className="size-6 ml-2" />
								</Button>
							</SignInButton>
						)}
					</div>
				</div>

				{/* Footer Space */}
				<div className="h-8 bg-zinc-50" />
			</ScrollArea>

			{/* Custom Animation Styles */}
			<style>{`
				@keyframes slide-in-left {
					0% { transform: translateX(-30px); opacity: 0; }
					100% { transform: translateX(0); opacity: 1; }
				}
				
				@keyframes fade-in {
					0% { opacity: 0; }
					100% { opacity: 1; }
				}
				
				@keyframes fade-in-up {
					0% { transform: translateY(20px); opacity: 0; }
					100% { transform: translateY(0); opacity: 1; }
				}
				
				.animate-slide-in-left { animation: slide-in-left 0.8s ease-out forwards; }
				.animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
				.animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
				
				.animation-delay-200 { animation-delay: 200ms; }
				.animation-delay-400 { animation-delay: 400ms; }
				.animation-delay-600 { animation-delay: 600ms; }
				.animation-delay-800 { animation-delay: 800ms; }
			`}</style>
		</div>
	);
};

export default HomePage;