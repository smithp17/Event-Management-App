// frontend/src/pages/chat/ChatPage.tsx

import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";
import { MessageSquare, Sparkles, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

const formatTime = (date: string) => {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const ChatPage = () => {
	const { user } = useUser();
	const { messages, selectedUser, fetchUsers, fetchMessages, isConnected } =
		useChatStore();

	useEffect(() => {
		if (user) fetchUsers();
	}, [user]);

	useEffect(() => {
		if (selectedUser) fetchMessages(selectedUser.clerkId);
	}, [selectedUser]);

	return (
		<main className="h-[calc(100vh-100px)] rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-sm flex">
			{/* Left: Users List */}
			<div className="hidden lg:block w-[300px] border-r border-zinc-200">
				<UsersList />
			</div>

			<div className="block lg:hidden w-[80px] border-r border-zinc-200">
				<UsersList />
			</div>

			{/* Right: Chat Section */}
			<div className="flex flex-col flex-1 bg-zinc-50">

				{/* Connection Status */}
				<div
					className={cn(
						"px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium",
						isConnected ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
					)}
				>
					{isConnected ? (
						<>
							<Wifi className="size-4" /> Connected
						</>
					) : (
						<>
							<WifiOff className="size-4" /> Connecting...
						</>
					)}
				</div>

				{/* If NO USER SELECTED */}
				{!selectedUser && <NoConversationPlaceholder />}

				{/* If USER SELECTED */}
				{selectedUser && (
					<>
						<ChatHeader />

						{/* MESSAGES AREA */}
						<div className="flex-1 overflow-y-auto px-4 py-4">
							{messages.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-full text-center">
									<div className="size-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
										<MessageSquare className="size-8 text-purple-500" />
									</div>
									<p className="text-zinc-500 font-medium">No messages yet</p>
									<p className="text-zinc-400 text-sm">
										Send a message to start the conversation
									</p>
								</div>
							) : (
								messages.map((message) => (
									<div
										key={message._id}
										className={cn(
											"flex items-end gap-3 mb-4",
											message.senderId === user?.id
												? "flex-row-reverse"
												: ""
										)}
									>
										<Avatar className="size-8 ring-2 ring-white shadow-md flex-shrink-0">
											<AvatarImage
												src={
													message.senderId === user?.id
														? user.imageUrl
														: selectedUser.imageUrl
												}
											/>
										</Avatar>

										<div
											className={cn(
												"rounded-2xl p-4 max-w-[70%] shadow-sm",
												message.senderId === user?.id
													? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
													: "bg-white border border-zinc-200 text-zinc-800 rounded-bl-md"
											)}
										>
											<p className="text-sm leading-relaxed">{message.content}</p>
											<span
												className={cn(
													"text-xs mt-2 block",
													message.senderId === user?.id
														? "text-white/70"
														: "text-zinc-400"
												)}
											>
												{formatTime(message.createdAt)}
											</span>
										</div>
									</div>
								))
							)}
						</div>

						{/* FIXED INPUT BAR */}
						<div className="border-t border-zinc-200 bg-white px-4 py-3">
							<MessageInput />
						</div>
					</>
				)}
			</div>
		</main>
	);
};

export default ChatPage;

/* --------------------- PLACEHOLDER WHEN NO USER SELECTED --------------------- */

const NoConversationPlaceholder = () => (
	<div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
		<div className="relative">
			<div className="size-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-xl animate-bounce">
				<Sparkles className="size-12 text-white" />
			</div>
		</div>

		<h3 className="text-zinc-800 text-xl font-bold mt-6">
			No conversation selected
		</h3>
		<p className="text-zinc-500 text-sm max-w-xs mt-2">
			Choose a friend from the list to start chatting.
		</p>
	</div>
);
