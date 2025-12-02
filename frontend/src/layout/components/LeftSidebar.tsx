// frontend/src/components/LeftSidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useUser, SignInButton, useClerk } from "@clerk/clerk-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Home,
	Search,
	Calendar,
	Ticket,
	MessageSquare,
	Plus,
	Shield,
	LogOut,
	ChevronDown,
	Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LeftSidebar = () => {
	const { user, isSignedIn } = useUser();
	const { signOut } = useClerk();
	const { isAdmin } = useAuthStore();
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

	const NavLink = ({
		to,
		icon: Icon,
		label,
		isAdminLink = false,
	}: {
		to: string;
		icon: any;
		label: string;
		isAdminLink?: boolean;
	}) => (
		<Link to={to}>
			<div
				className={cn(
					"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
					isActive(to)
						? isAdminLink
							? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 shadow-sm"
							: "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 shadow-sm"
						: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
				)}
			>
				<div className={cn(
					"p-1.5 rounded-lg transition-all",
					isActive(to) 
						? isAdminLink 
							? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" 
							: "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
						: "bg-zinc-100 text-zinc-500"
				)}>
					<Icon className="size-4" />
				</div>
				<span className="font-medium">{label}</span>
				{isActive(to) && (
					<div className={cn(
						"ml-auto size-2 rounded-full",
						isAdminLink 
							? "bg-gradient-to-r from-amber-500 to-orange-500"
							: "bg-gradient-to-r from-purple-500 to-pink-500"
					)} />
				)}
			</div>
		</Link>
	);

	return (
		<div className="h-full flex flex-col bg-white border-r border-zinc-200 w-64 shadow-sm">
			{/* Logo */}
			<div className="p-4 border-b border-zinc-100">
				<Link to="/" className="flex items-center gap-3 group">
					<div className="size-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
						<Sparkles className="size-6 text-white" />
					</div>
					<div>
						<span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							EventBrite
						</span>
						<p className="text-xs text-zinc-400 font-medium">Discover Events</p>
					</div>
				</Link>
			</div>

			{/* Navigation */}
			<div className="flex-1 p-4 space-y-6 overflow-y-auto">
				{/* Main Navigation */}
				<div className="space-y-1.5">
					<NavLink to="/" icon={Home} label="Home" />
					<NavLink to="/browse" icon={Search} label="Browse Events" />
				</div>

				{/* User Navigation */}
				{isSignedIn && (
					<>
						<div className="pt-4 border-t border-zinc-100">
							<p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
								Your Events
							</p>
							<div className="space-y-1.5">
								<NavLink to="/my-events" icon={Calendar} label="My Events" />
								<NavLink to="/my-tickets" icon={Ticket} label="My Tickets" />
								<NavLink to="/chat" icon={MessageSquare} label="Messages" />
							</div>
						</div>

						{/* Create Event Button */}
						<Link to="/my-events">
							<Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-5 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-[1.02]">
								<Plus className="size-5 mr-2" />
								Create Event
							</Button>
						</Link>
					</>
				)}

				{/* Admin Section */}
				{isAdmin && (
					<div className="pt-4 border-t border-zinc-100">
						<p className="px-3 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-2">
							<Shield className="size-3" />
							Admin
						</p>
						<NavLink to="/admin" icon={Shield} label="Admin Dashboard" isAdminLink />
					</div>
				)}
			</div>

			{/* User Section */}
			<div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
				{isSignedIn ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-zinc-200">
								<div className="relative">
									<img
										src={user?.imageUrl}
										alt={user?.fullName || "User"}
										className="size-10 rounded-full ring-2 ring-purple-500/20"
									/>
									{isAdmin && (
										<div className="absolute -bottom-0.5 -right-0.5 size-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center ring-2 ring-white">
											<Shield className="size-2.5 text-white" />
										</div>
									)}
								</div>
								<div className="flex-1 text-left">
									<p className="text-sm font-semibold text-zinc-800 truncate">
										{user?.fullName || user?.username}
									</p>
									<p className={cn(
										"text-xs font-medium",
										isAdmin ? "text-amber-500" : "text-zinc-400"
									)}>
										{isAdmin ? "Administrator" : "Member"}
									</p>
								</div>
								<ChevronDown className="size-4 text-zinc-400" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-56 bg-white border-zinc-200 shadow-xl rounded-xl p-1"
						>
							<DropdownMenuItem asChild>
								<Link
									to="/my-events"
									className="flex items-center gap-3 cursor-pointer text-zinc-700 hover:text-zinc-900 rounded-lg px-3 py-2.5"
								>
									<div className="p-1.5 rounded-lg bg-purple-100">
										<Calendar className="size-4 text-purple-600" />
									</div>
									My Events
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									to="/my-tickets"
									className="flex items-center gap-3 cursor-pointer text-zinc-700 hover:text-zinc-900 rounded-lg px-3 py-2.5"
								>
									<div className="p-1.5 rounded-lg bg-pink-100">
										<Ticket className="size-4 text-pink-600" />
									</div>
									My Tickets
								</Link>
							</DropdownMenuItem>
							{isAdmin && (
								<>
									<DropdownMenuSeparator className="bg-zinc-100 my-1" />
									<DropdownMenuItem asChild>
										<Link
											to="/admin"
											className="flex items-center gap-3 cursor-pointer text-amber-600 hover:text-amber-700 rounded-lg px-3 py-2.5"
										>
											<div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
												<Shield className="size-4 text-amber-600" />
											</div>
											Admin Dashboard
										</Link>
									</DropdownMenuItem>
								</>
							)}
							<DropdownMenuSeparator className="bg-zinc-100 my-1" />
							<DropdownMenuItem
								onClick={() => signOut({ redirectUrl: "/" })}
								className="flex items-center gap-3 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2.5"
							>
								<div className="p-1.5 rounded-lg bg-red-100">
									<LogOut className="size-4 text-red-500" />
								</div>
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<SignInButton mode="modal">
						<Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-5 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all">
							Sign In
						</Button>
					</SignInButton>
				)}
			</div>
		</div>
	);
};

export default LeftSidebar;