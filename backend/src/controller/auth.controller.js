// backend/src/controller/auth.controller.js

export const authCallback = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		const userEmail = req.auth?.email;

		console.log("🔐 Auth Callback:", { userId, userEmail });

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		res.status(200).json({ 
			success: true, 
			userId,
			email: userEmail 
		});
	} catch (error) {
		console.log("Error in authCallback", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		const userEmail = req.auth?.email;
		const adminEmail = process.env.ADMIN_EMAIL;

		console.log("\n========================================");
		console.log("🔐 CHECK ADMIN ENDPOINT");
		console.log("========================================");
		console.log("User ID:", userId);
		console.log("User Email:", userEmail);
		console.log("Admin Email (from .env):", adminEmail);
		
		if (!userId) {
			console.log("❌ No userId - unauthorized");
			return res.status(401).json({ 
				isAdmin: false, 
				message: "Unauthorized" 
			});
		}

		const isAdmin = userEmail && adminEmail && 
			userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim();

		console.log("Is Admin:", isAdmin);
		console.log("========================================\n");

		res.status(200).json({ 
			isAdmin,
			userId,
			email: userEmail,
			adminEmail: adminEmail, // Include for debugging
		});
	} catch (error) {
		console.log("Error in checkAdmin", error);
		next(error);
	}
};