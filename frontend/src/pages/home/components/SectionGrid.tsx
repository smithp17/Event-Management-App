import { Event } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import EventGridCard from "./EventGridCard";

type SectionGridProps = {
	title: string;
	events: Event[];
	isLoading: boolean;
};

const SectionGrid = ({ events, title, isLoading }: SectionGridProps) => {
	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
				<Button variant='link' className='text-sm text-zinc-400 hover:text-white'>
					Show all
				</Button>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{events.map((event) => (
					<EventGridCard key={event._id} event={event} />
				))}
			</div>
		</div>
	);
};
export default SectionGrid;