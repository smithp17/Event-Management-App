import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import EventsTable from "./EventsTable";

const EventsTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Calendar className='h-5 w-5 text-emerald-500' />
							Events Library
						</CardTitle>
						<CardDescription>Manage all events</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<EventsTable />
			</CardContent>
		</Card>
	);
};
export default EventsTabContent;