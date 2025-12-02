import { useEventStore } from "@/stores/useEventStore";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import EventCard from "./EventCard";

const FeaturedSection = () => {
	const { isLoading, featuredEvents, error } = useEventStore();

	if (isLoading) return <FeaturedGridSkeleton />;

	if (error) return <p className='text-red-500 mb-4 text-lg'>{error}</p>;

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
			{featuredEvents.map((event, index) => (
				<div
					key={event._id}
					className='animate-fade-in'
					style={{ animationDelay: `${index * 100}ms` }}
				>
					<EventCard event={event} />
				</div>
			))}
		</div>
	);
};
export default FeaturedSection;