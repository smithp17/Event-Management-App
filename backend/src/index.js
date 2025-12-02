import express from "express";
import dotenv from "dotenv";
import { verifyClerkToken } from "./middleware/clerk.middleware.js";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import cron from "node-cron";

import { initializeSocket } from "./lib/socket.js";

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";

dotenv.config();

console.log("🔧 Environment loaded:");
console.log("  - CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "✅" : "❌");
console.log("  - CLERK_PUBLISHABLE_KEY:", process.env.CLERK_PUBLISHABLE_KEY ? "✅" : "❌");
console.log("  - ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
console.log("  - CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "❌ Missing");
console.log("  - CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅" : "❌");
console.log("  - CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅" : "❌");

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initializeSocket(httpServer);

// CORS - Allow both Vite dev server and other origins
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:5173"],
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
		methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
	})
);

// Parse JSON
app.use(express.json());

// File upload - MUST be before routes
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB max file size
		},
	})
);

// CLERK JWT VERIFICATION - Extract userId from Bearer token
console.log("🔐 Initializing Clerk JWT verification...");
app.use(verifyClerkToken);

// Cron jobs - clean up temp files every hour
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

// Error handler
app.use((err, req, res, next) => {
	console.error("❌ Server Error:", err.message);
	console.error("Stack:", err.stack);
	res.status(500).json({ 
		message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message 
	});
});

httpServer.listen(PORT, () => {
	console.log("✅ Server is running on port " + PORT);
	connectDB();
});