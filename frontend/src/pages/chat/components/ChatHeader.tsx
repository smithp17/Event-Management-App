// frontend/src/pages/chat/components/ChatHeader.tsx
import { useChatStore } from "@/stores/useChatStore";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, MoreVertical, ArrowLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatHeader = () => {
	const { selectedUser, onlineUsers, setSelectedUser } = useChatStore();

	if (!selectedUser) return null;

	const isOnline = onlineUsers.has(selectedUser.clerkId);

	return (
		<div className='p-4 border-b border-zinc-200 bg-white flex items-center justify-between'>
			<div className='flex items-center gap-3'>
				{/* Back button for mobile */}
				<button
					onClick={() => setSelectedUser(null)}
					className='lg:hidden p-2 hover:bg-zinc-100 rounded-xl transition-colors'
				>
					<ArrowLeft className='size-5 text-zinc-600' />
				</button>

				{/* User Info */}
				<div className='relative'>
					<Avatar className='size-11 ring-2 ring-purple-500/20'>
						<AvatarImage src={selectedUser.imageUrl} alt={selectedUser.fullName} />
					</Avatar>
					<div className={cn(
						'absolute bottom-0 right-0 size-3.5 rounded-full ring-2 ring-white',
						isOnline
							? 'bg-gradient-to-r from-green-400 to-emerald-500'
							: 'bg-zinc-300'
					)} />
				</div>

				<div>
					<h3 className='font-bold text-zinc-800'>{selectedUser.fullName}</h3>
					<p className='text-xs font-medium'>
						{isOnline ? (
							<span className='text-green-600'>● Active now</span>
						) : (
							<span className='text-zinc-500'>Offline</span>
						)}
					</p>
				</div>
			</div>

			{/* Action Buttons */}
			<div className='flex items-center gap-1'>
				<button className='p-2.5 hover:bg-purple-50 rounded-xl transition-colors group'>
					<Phone className='size-5 text-zinc-500 group-hover:text-purple-600 transition-colors' />
				</button>
				<button className='p-2.5 hover:bg-purple-50 rounded-xl transition-colors group'>
					<Video className='size-5 text-zinc-500 group-hover:text-purple-600 transition-colors' />
				</button>
				<button className='p-2.5 hover:bg-purple-50 rounded-xl transition-colors group'>
					<Info className='size-5 text-zinc-500 group-hover:text-purple-600 transition-colors' />
				</button>
				<button className='p-2.5 hover:bg-purple-50 rounded-xl transition-colors group'>
					<MoreVertical className='size-5 text-zinc-500 group-hover:text-purple-600 transition-colors' />
				</button>
			</div>
		</div>
	);
};

export default ChatHeader;