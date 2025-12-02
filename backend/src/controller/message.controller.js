// backend/src/controllers/message.controller.js
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { getIO, getSocketId } from "../lib/socket.js";

// Get messages between two users
export const getMessages = async (req, res) => {
	try {
		const currentUserId = req.auth?.userId;
		const { userId: otherUserId } = req.params;

		if (!currentUserId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const messages = await Message.find({
			$or: [
				{ senderId: currentUserId, receiverId: otherUserId },
				{ senderId: otherUserId, receiverId: currentUserId },
			],
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		console.error("❌ Error fetching messages:", error);
		res.status(500).json({ message: "Failed to fetch messages" });
	}
};

// Send a message
export const sendMessage = async (req, res) => {
	try {
		const senderId = req.auth?.userId;
		const { receiverId, content } = req.body;

		if (!senderId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (!receiverId || !content) {
			return res.status(400).json({ message: "Receiver ID and content are required" });
		}

		const message = await Message.create({
			senderId,
			receiverId,
			content: content.trim(),
		});

		// Send real-time notification
		try {
			const io = getIO();
			const receiverSocketId = getSocketId(receiverId);
			if (receiverSocketId) {
				io.to(receiverSocketId).emit("receive_message", message);
			}
		} catch (socketError) {
			console.log("⚠️ Socket not available");
		}

		res.status(201).json(message);
	} catch (error) {
		console.error("❌ Error sending message:", error);
		res.status(500).json({ message: "Failed to send message" });
	}
};

// Get conversations
export const getConversations = async (req, res) => {
	try {
		const currentUserId = req.auth?.userId;
		if (!currentUserId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const sentMessages = await Message.distinct("receiverId", { senderId: currentUserId });
		const receivedMessages = await Message.distinct("senderId", { receiverId: currentUserId });
		const uniqueUserIds = [...new Set([...sentMessages, ...receivedMessages])];

		const users = await User.find({ clerkId: { $in: uniqueUserIds } });
		res.status(200).json(users);
	} catch (error) {
		console.error("❌ Error fetching conversations:", error);
		res.status(500).json({ message: "Failed to fetch conversations" });
	}
};