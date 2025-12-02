import { useEventStore } from "@/stores/useEventStore";
import { Calendar, Ticket, Users2, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard";

const DashboardStats = () => {
	const { stats } = useEventStore();

	const statsData = [
		{
			icon: Calendar,
			label: "Total Events",
			value: stats.totalEvents.toString(),
			bgColor: "bg-emerald-500/10",
			iconColor: "text-emerald-500",
		},
		{
			icon: Ticket,
			label: "Tickets Sold",
			value: stats.totalTicketsSold.toString(),
			bgColor: "bg-violet-500/10",
			iconColor: "text-violet-500",
		},
		{
			icon: Users2,
			label: "Total Users",
			value: stats.totalUsers.toLocaleString(),
			bgColor: "bg-orange-500/10",
			iconColor: "text-orange-500",
		},
		{
			icon: TrendingUp,
			label: "Revenue",
			value: `$${stats.totalRevenue.toLocaleString()}`,
			bgColor: "bg-sky-500/10",
			iconColor: "text-sky-500",
		},
	];

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 '>
			{statsData.map((stat) => (
				<StatsCard
					key={stat.label}
					icon={stat.icon}
					label={stat.label}
					value={stat.value}
					bgColor={stat.bgColor}
					iconColor={stat.iconColor}
				/>
			))}
		</div>
	);
};
export default DashboardStats;