import { Event } from "@/types";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket } from "lucide-react";

interface EventGridCardProps {
	event: Event;
}

const EventGridCard = ({ event }: EventGridCardProps) => {
	const eventDate = new Date(event.eventDate);
	const isUpcoming = eventDate > new Date();

	return (
		<Link to={`/events/${event._id}`}>
			<div className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer'>
				<div className='relative mb-4'>
					<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
						<img
							src={event.imageUrl}
							alt={event.title}
							className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
						/>
						{!isUpcoming && (
							<div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
								<span className='text-white font-semibold'>Completed</span>
							</div>
						)}
					</div>
				</div>
				<h3 className='font-medium mb-2 truncate text-white'>{event.title}</h3>
				
				<div className='space-y-1 text-xs text-zinc-400'>
					<div className='flex items-center gap-1'>
						<Calendar className='size-3' />
						<span>{eventDate.toLocaleDateString()}</span>
					</div>
					<div className='flex items-center gap-1 truncate'>
						<MapPin className='size-3 flex-shrink-0' />
						<span className='truncate'>{event.location}</span>
					</div>
					<div className='flex items-center justify-between pt-2 border-t border-zinc-700'>
						<span className='text-emerald-400 font-semibold'>${event.ticketPrice}</span>
						<span className='flex items-center gap-1'>
							<Ticket className='size-3' />
							{event.ticketsAvailable}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
};
export default EventGridCard;