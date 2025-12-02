// frontend/src/pages/browse/BrowsePage.tsx
import { useEffect, useState } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
	Calendar,
	MapPin,
	Users,
	Search,
	Filter,
	X,
	SlidersHorizontal,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
	"All",
	"Music",
	"Sports",
	"Arts",
	"Food & Drink",
	"Business",
	"Technology",
	"Health",
	"Community",
	"Film",
	"Fashion",
	"Education",
	"Travel",
	"Charity",
	"Other",
];

const BrowsePage = () => {
	const { events, fetchAllEvents, searchEvents, isLoading } = useEventStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [sortBy, setSortBy] = useState("date");
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		fetchAllEvents();
	}, [fetchAllEvents]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			searchEvents(searchQuery);
		} else {
			fetchAllEvents();
		}
	};

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
		if (category === "All") {
			fetchAllEvents();
		} else {
			fetchAllEvents({ category });
		}
	};

	const handleSortChange = (sort: string) => {
		setSortBy(sort);
		fetchAllEvents({ sort });
	};

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedCategory("All");
		setSortBy("date");
		fetchAllEvents();
	};

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

	// Filter events based on selected category
	const filteredEvents = selectedCategory === "All" 
		? events 
		: events.filter(e => e.category === selectedCategory);

	const EventCard = ({ event }: { event: any }) => {
		const ticketsSold = event.capacity - event.ticketsAvailable;
		const soldPercentage = (ticketsSold / event.capacity) * 100;
		const isSoldOut = event.ticketsAvailable === 0;

		return (
			<Link to={`/events/${event._id}`} className="block group">
				<div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
					{/* Image */}
					<div className="relative h-48 overflow-hidden">
						<img
							src={event.imageUrl}
							alt={event.title}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						
						{/* Category Badge */}
						<div className="absolute top-3 left-3">
							<span className="px-2 py-1 bg-emerald-500/90 text-white text-xs font-semibold rounded">
								{event.category}
							</span>
						</div>

						{/* Price Badge */}
						<div className="absolute top-3 right-3">
							<span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-sm font-bold rounded">
								{event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice}`}
							</span>
						</div>

						{/* Sold Out Overlay */}
						{isSoldOut && (
							<div className="absolute inset-0 bg-black/70 flex items-center justify-center">
								<span className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg">
									SOLD OUT
								</span>
							</div>
						)}
					</div>

					{/* Content */}
					<div className="p-4">
						<h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
							{event.title}
						</h3>

						<div className="space-y-2 text-sm text-zinc-400">
							<div className="flex items-center gap-2">
								<Calendar className="size-4 text-emerald-500" />
								<span>
									{formatDate(event.eventDate)} at {formatTime(event.eventTime)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<MapPin className="size-4 text-emerald-500" />
								<span className="truncate">{event.venue || event.location}</span>
							</div>
							<div className="flex items-center gap-2">
								<Users className="size-4 text-emerald-500" />
								<span>
									{event.ticketsAvailable} / {event.capacity} available
								</span>
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
			</Link>
		);
	};

	return (
		<div className="h-full bg-gradient-to-b from-zinc-900 to-zinc-950">
			<ScrollArea className="h-full">
				{/* Header */}
				<div className="bg-zinc-900/80 border-b border-zinc-800 sticky top-0 z-10 backdrop-blur-sm">
					<div className="max-w-6xl mx-auto px-6 py-4">
						<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
							{/* Search */}
							<form onSubmit={handleSearch} className="flex-1 max-w-xl w-full">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
									<Input
										type="text"
										placeholder="Search events..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 pr-4 py-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-emerald-500 focus:border-emerald-500"
									/>
									{searchQuery && (
										<button
											type="button"
											onClick={() => {
												setSearchQuery("");
												fetchAllEvents();
											}}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
										>
											<X className="size-4" />
										</button>
									)}
								</div>
							</form>

							{/* Filter Toggle */}
							<Button
								variant="outline"
								onClick={() => setShowFilters(!showFilters)}
								className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
							>
								<SlidersHorizontal className="size-4 mr-2" />
								Filters
								{(selectedCategory !== "All" || sortBy !== "date") && (
									<span className="ml-2 size-2 rounded-full bg-emerald-500" />
								)}
							</Button>
						</div>

						{/* Filters Panel */}
						{showFilters && (
							<div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
								<div className="flex flex-wrap gap-4 items-end">
									{/* Category Filter */}
									<div className="flex-1 min-w-[200px]">
										<label className="block text-sm text-zinc-400 mb-1">Category</label>
										<Select value={selectedCategory} onValueChange={handleCategoryChange}>
											<SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
												<SelectValue placeholder="All Categories" />
											</SelectTrigger>
											<SelectContent className="bg-zinc-900 border-zinc-700">
												{CATEGORIES.map((cat) => (
													<SelectItem key={cat} value={cat} className="text-white hover:bg-zinc-800">
														{cat}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* Sort */}
									<div className="flex-1 min-w-[200px]">
										<label className="block text-sm text-zinc-400 mb-1">Sort By</label>
										<Select value={sortBy} onValueChange={handleSortChange}>
											<SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="bg-zinc-900 border-zinc-700">
												<SelectItem value="date" className="text-white hover:bg-zinc-800">Date</SelectItem>
												<SelectItem value="newest" className="text-white hover:bg-zinc-800">Newest First</SelectItem>
												<SelectItem value="popular" className="text-white hover:bg-zinc-800">Most Popular</SelectItem>
												<SelectItem value="price-low" className="text-white hover:bg-zinc-800">Price: Low to High</SelectItem>
												<SelectItem value="price-high" className="text-white hover:bg-zinc-800">Price: High to Low</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Clear Filters */}
									<Button
										variant="ghost"
										onClick={clearFilters}
										className="text-zinc-400 hover:text-white"
									>
										<X className="size-4 mr-1" />
										Clear
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Results */}
				<div className="max-w-6xl mx-auto px-6 py-8">
					{/* Results Header */}
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-2xl font-bold text-white">
							{searchQuery ? `Results for "${searchQuery}"` : 
							 selectedCategory !== "All" ? `${selectedCategory} Events` : 
							 "All Events"}
						</h1>
						<p className="text-zinc-400">
							{filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
						</p>
					</div>

					{/* Events Grid */}
					{isLoading ? (
						<div className="flex items-center justify-center h-64">
							<div className="flex flex-col items-center gap-4">
								<div className="size-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
								<p className="text-zinc-400">Loading events...</p>
							</div>
						</div>
					) : filteredEvents.length === 0 ? (
						<div className="text-center py-16">
							<Search className="size-16 mx-auto text-zinc-600 mb-4" />
							<h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
							<p className="text-zinc-400 mb-6">
								{searchQuery 
									? "Try a different search term" 
									: "No events match your filters"}
							</p>
							<Button onClick={clearFilters} className="bg-emerald-500 hover:bg-emerald-600">
								Clear Filters
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{filteredEvents.map((event: any) => (
								<EventCard key={event._id} event={event} />
							))}
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default BrowsePage;