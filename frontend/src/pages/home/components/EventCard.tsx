import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface EventCardProps {
	event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
	const eventDate = new Date(event.eventDate);
	const formattedDate = eventDate.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});

	return (
		<Link to={`/events/${event._id}`}>
			<div className='group h-full flex flex-col bg-gradient-to-br from-zinc-800/50 to-zinc-900/30 rounded-xl overflow-hidden hover:from-zinc-700/50 hover:to-zinc-800/30 transition-all duration-300 border border-zinc-700/30 hover:border-emerald-500/30 shadow-lg hover:shadow-emerald-500/10'>
				{/* Image Container */}
				<div className='relative overflow-hidden h-48 bg-zinc-900'>
					<img
						src={event.imageUrl}
						alt={event.title}
						className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
					/>
					<div className='absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
				</div>

				{/* Content */}
				<div className='flex-1 p-4 flex flex-col gap-3'>
					{/* Category Badge */}
					<div className='flex gap-2'>
						<span className='px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30'>
							{event.category}
						</span>
						{event.ticketsAvailable < 10 && (
							<span className='px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30'>
								Limited
							</span>
						)}
					</div>

					{/* Title */}
					<h3 className='font-semibold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors'>
						{event.title}
					</h3>

					{/* Info */}
					<div className='space-y-2 text-sm text-zinc-400'>
						<div className='flex items-center gap-2'>
							<Calendar className='size-4 flex-shrink-0 text-emerald-500' />
							<span>{formattedDate} at {event.eventTime}</span>
						</div>
						<div className='flex items-center gap-2 line-clamp-1'>
							<MapPin className='size-4 flex-shrink-0 text-emerald-500' />
							<span className='truncate'>{event.location}</span>
						</div>
					</div>

					{/* Footer */}
					<div className='mt-auto pt-3 border-t border-zinc-700/30 flex items-center justify-between'>
						<span className='text-lg font-bold text-emerald-400'>
							${event.ticketPrice}
						</span>
						<ChevronRight className='size-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300' />
					</div>
				</div>
			</div>
		</Link>
	);
};
export default EventCard;