import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

let io;
const userSockets = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("user_connected", (uid) => {
      userSockets.set(uid, socket.id);
      io.emit("users_online", Array.from(userSockets.keys()));
    });

    socket.on("send_message", async (data) => {
      const msg = await Message.create(data);
      const rSocket = userSockets.get(data.receiverId);
      if (rSocket) io.to(rSocket).emit("receive_message", msg);
      const sSocket = userSockets.get(data.senderId);
      if (sSocket) io.to(sSocket).emit("message_sent", msg);
    });

    socket.on("disconnect", () => {
      for (const [uid, sid] of userSockets.entries()) {
        if (sid === socket.id) {
          userSockets.delete(uid);
          io.emit("users_online", Array.from(userSockets.keys()));
          io.emit("user_disconnected", uid);
          break;
        }
      }
    });
  });

  console.log("🔌 Socket.io initialized");
};

export const getIO = () => io;
export const getSocketId = (uid) => userSockets.get(uid);
export const getOnlineUsers = () => Array.from(userSockets.keys());