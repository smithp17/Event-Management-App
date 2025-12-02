// backend/src/models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: { type: String, required: true },
		receiverId: { type: String, required: true },
		content: { type: String, required: true },
	},
	{ timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1 });

export const Message = mongoose.model("Message", messageSchema);