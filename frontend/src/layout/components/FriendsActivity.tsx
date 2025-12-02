// frontend/src/layout/components/FriendsActivity.tsx
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Music, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const FriendsActivity = () => {
	const { user, isSignedIn } = useUser();
	const { users, onlineUsers, fetchUsers, isLoading } = useChatStore();

	useEffect(() => {
		if (isSignedIn && user) {
			fetchUsers();
		}
	}, [isSignedIn, user, fetchUsers]);

	// If not signed in, show sign in prompt
	if (!isSignedIn) {
		return (
			<div className="h-full bg-white rounded-xl border border-zinc-200 p-4">
				<div className="flex flex-col items-center justify-center h-full text-center">
					<div className="size-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
						<Users className="size-6 text-zinc-400" />
					</div>
					<p className="text-zinc-600 font-medium text-sm">Sign in to see friends</p>
					<p className="text-zinc-400 text-xs mt-1">Connect with other event-goers</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full bg-white rounded-xl border border-zinc-200 flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-zinc-100">
				<div className="flex items-center justify-between">
					<h3 className="font-bold text-zinc-800">Friends Activity</h3>
					<span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
						{onlineUsers.size} online
					</span>
				</div>
			</div>

			{/* Users List */}
			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-8">
							<div className="relative">
								<div className="size-8 border-3 border-purple-200 rounded-full" />
								<div className="absolute inset-0 size-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
							</div>
							<p className="text-zinc-500 text-xs mt-2">Loading...</p>
						</div>
					) : users.length === 0 ? (
						<div className="text-center py-8 px-4">
							<div className="size-10 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-2">
								<Users className="size-5 text-zinc-400" />
							</div>
							<p className="text-zinc-500 text-sm">No friends yet</p>
							<p className="text-zinc-400 text-xs mt-1">Attend events to connect</p>
						</div>
					) : (
						users.map((friendUser) => {
							// Use .has() for Set
							const isOnline = onlineUsers.has(friendUser.clerkId);
							
							return (
								<Link
									key={friendUser._id}
									to="/chat"
									className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors group cursor-pointer"
								>
									{/* Avatar with online indicator */}
									<div className="relative flex-shrink-0">
										<Avatar className="size-10">
											<AvatarImage src={friendUser.imageUrl} alt={friendUser.fullName} />
										</Avatar>
										<div
											className={cn(
												"absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-white",
												isOnline
													? "bg-green-500"
													: "bg-zinc-300"
											)}
										/>
									</div>

									{/* User Info */}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-zinc-800 truncate group-hover:text-purple-600 transition-colors">
											{friendUser.fullName}
										</p>
										<p className="text-xs text-zinc-500 truncate">
											{isOnline ? (
												<span className="text-green-600">Active now</span>
											) : (
												"Offline"
											)}
										</p>
									</div>

									{/* Activity indicator (optional) */}
									{isOnline && (
										<div className="flex-shrink-0 p-1.5 bg-purple-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
											<HeadphonesIcon className="size-3.5 text-purple-600" />
										</div>
									)}
								</Link>
							);
						})
					)}
				</div>
			</ScrollArea>

			{/* Footer - Quick action */}
			<div className="p-3 border-t border-zinc-100">
				<Link
					to="/chat"
					className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
				>
					<Users className="size-4" />
					Open Messages
				</Link>
			</div>
		</div>
	);
};

export default FriendsActivity;