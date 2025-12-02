// frontend/src/pages/chat/components/MessageInput.tsx
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

const MessageInput = () => {
	const { user } = useUser();
	const { selectedUser, sendMessage } = useChatStore();
	const [message, setMessage] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [isSending, setIsSending] = useState(false);

	const handleSend = async () => {
		if (!message.trim() || !user || !selectedUser || isSending) return;

		setIsSending(true);
		try {
			await sendMessage(selectedUser.clerkId, user.id, message.trim());
			setMessage("");
		} catch (error) {
			console.error("Failed to send message:", error);
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className='p-4 border-t border-zinc-200 bg-white'>
			<div className={cn(
				'flex items-center gap-2 p-2 rounded-2xl border-2 transition-all duration-200',
				isFocused
					? 'border-purple-500 bg-purple-50/50 shadow-lg shadow-purple-500/10'
					: 'border-zinc-200 bg-zinc-100'
			)}>
				{/* Action Buttons */}
				<div className='flex items-center gap-1 pl-1'>
					<button 
						type="button"
						className='p-2 hover:bg-white rounded-xl transition-colors group'
					>
						<Smile className='size-5 text-zinc-400 group-hover:text-purple-500 transition-colors' />
					</button>
					<button 
						type="button"
						className='p-2 hover:bg-white rounded-xl transition-colors group'
					>
						<Paperclip className='size-5 text-zinc-400 group-hover:text-purple-500 transition-colors' />
					</button>
				</div>

				{/* Input */}
				<input
					type='text'
					placeholder='Type a message...'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					onKeyPress={handleKeyPress}
					disabled={isSending}
					className='flex-1 bg-transparent text-zinc-800 placeholder:text-zinc-400 text-sm focus:outline-none py-2 disabled:opacity-50'
				/>

				{/* Send Button */}
				<button
					onClick={handleSend}
					disabled={!message.trim() || isSending}
					className={cn(
						'p-3 rounded-xl transition-all duration-200',
						message.trim() && !isSending
							? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105'
							: 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
					)}
				>
					{isSending ? (
						<div className='size-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
					) : (
						<Send className='size-5' />
					)}
				</button>
			</div>

			{/* Typing hint */}
			<p className='text-xs text-zinc-400 mt-2 px-2'>
				Press <kbd className='px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono text-xs'>Enter</kbd> to send
			</p>
		</div>
	);
};

export default MessageInput;