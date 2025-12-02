// frontend/src/pages/chat/components/UsersList.tsx
import { useChatStore } from "@/stores/useChatStore";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Search, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const UsersList = () => {
	const { users, selectedUser, isLoading, setSelectedUser, onlineUsers } = useChatStore();
	const [searchQuery, setSearchQuery] = useState("");

	const filteredUsers = users.filter(user =>
		user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className='border-r border-zinc-200 bg-white flex flex-col h-full'>
			{/* Header */}
			<div className='p-4 border-b border-zinc-100'>
				<div className='flex items-center gap-3 mb-4'>
					<div className='p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20'>
						<MessageCircle className='size-5 text-white' />
					</div>
					<div className='hidden lg:block'>
						<h2 className='font-bold text-zinc-800'>Messages</h2>
						<p className='text-xs text-zinc-500'>
							{onlineUsers.size} online • {users.length} total
						</p>
					</div>
				</div>

				{/* Search */}
				<div className='hidden lg:block relative'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400' />
					<input
						type='text'
						placeholder='Search users...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-full pl-10 pr-4 py-2.5 bg-zinc-100 border-0 rounded-xl text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all'
					/>
				</div>
			</div>

			{/* Users List */}
			<ScrollArea className='flex-1'>
				<div className='p-2 space-y-1'>
					{isLoading ? (
						<div className='flex flex-col items-center justify-center py-8'>
							<div className='relative'>
								<div className='size-10 border-4 border-purple-200 rounded-full' />
								<div className='absolute inset-0 size-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin' />
							</div>
							<p className='text-zinc-500 text-sm mt-3 hidden lg:block'>Loading users...</p>
						</div>
					) : filteredUsers.length === 0 ? (
						<div className='text-center py-8 px-4'>
							<div className='size-14 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-3'>
								<Users className='size-7 text-zinc-400' />
							</div>
							<p className='text-zinc-600 font-medium hidden lg:block'>No users found</p>
							<p className='text-zinc-400 text-sm hidden lg:block mt-1'>
								{searchQuery ? "Try a different search" : "Users will appear here"}
							</p>
						</div>
					) : (
						filteredUsers.map((user) => {
							const isOnline = onlineUsers.has(user.clerkId);
							const isSelected = selectedUser?.clerkId === user.clerkId;

							return (
								<button
									key={user._id}
									onClick={() => setSelectedUser(user)}
									className={cn(
										'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
										isSelected
											? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 shadow-sm border border-purple-200'
											: 'hover:bg-zinc-100'
									)}
								>
									<div className='relative flex-shrink-0'>
										<Avatar className={cn(
											'size-12 ring-2 transition-all',
											isSelected
												? 'ring-purple-500/50'
												: 'ring-transparent'
										)}>
											<AvatarImage src={user.imageUrl} alt={user.fullName} />
										</Avatar>
										{/* Online Status Indicator */}
										<div className={cn(
											'absolute bottom-0 right-0 size-3.5 rounded-full ring-2 ring-white',
											isOnline
												? 'bg-gradient-to-r from-green-400 to-emerald-500'
												: 'bg-zinc-300'
										)} />
									</div>

									<div className='hidden lg:block flex-1 text-left min-w-0'>
										<p className={cn(
											'font-semibold truncate',
											isSelected ? 'text-purple-700' : 'text-zinc-800'
										)}>
											{user.fullName}
										</p>
										<p className='text-xs truncate'>
											{isOnline ? (
												<span className='text-green-600 font-medium'>● Online</span>
											) : (
												<span className='text-zinc-500'>Offline</span>
											)}
										</p>
									</div>

									{/* Selected Indicator */}
									{isSelected && (
										<div className='hidden lg:block size-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0' />
									)}
								</button>
							);
						})
					)}
				</div>
			</ScrollArea>

			{/* Online Count Footer */}
			<div className='p-3 border-t border-zinc-100 hidden lg:block'>
				<div className='flex items-center justify-center gap-2 text-xs text-zinc-500'>
					<div className='size-2 rounded-full bg-green-500 animate-pulse' />
					<span>{onlineUsers.size} user{onlineUsers.size !== 1 ? 's' : ''} online</span>
				</div>
			</div>
		</div>
	);
};

export default UsersList;