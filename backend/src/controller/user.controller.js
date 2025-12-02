import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const users = await User.find({ clerkId: { $ne: currentUserId } });
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};


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
		res.status(500).json({ message: "Failed to fetch messages" });
	}
};