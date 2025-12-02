// backend/src/middleware/auth.middleware.js

export const protectRoute = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;

		console.log("🔍 protectRoute Check:", {
			hasAuthHeader: !!req.headers.authorization,
			clerkUserId: userId,
		});

		if (!userId) {
			console.log("❌ No userId in req.auth");
			return res.status(401).json({ message: "Unauthorized - you must be logged in" });
		}

		console.log("✅ User authenticated:", userId);
		next();
	} catch (error) {
		console.log("❌ Error in protectRoute:", error.message);
		res.status(401).json({ message: "Unauthorized" });
	}
};

export const requireAdmin = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		const userEmail = req.auth?.email;

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized - you must be logged in" });
		}

		// Compare the logged-in user's email with ADMIN_EMAIL from .env
		const adminEmail = process.env.ADMIN_EMAIL;
		const isAdmin = userEmail && adminEmail && 
			userEmail.toLowerCase() === adminEmail.toLowerCase();
		
		console.log("🔍 Admin Check:", {
			userId,
			userEmail,
			adminEmail,
			isAdmin,
		});

		if (!isAdmin) {
			return res.status(403).json({ message: "Unauthorized - admin access required" });
		}

		req.isAdmin = true;
		next();
	} catch (error) {
		console.log("❌ Error in requireAdmin:", error.message);
		res.status(401).json({ message: "Unauthorized" });
	}
};

export const requireRSO = async (req, res, next) => {
	try {
		if (!req.auth?.userId) {
			return res.status(401).json({ message: "Unauthorized - you must be logged in" });
		}

		// For RSO checking, you'd need to store RSO status somewhere
		req.isRSO = false;
		next();
	} catch (error) {
		console.log("Error in requireRSO:", error);
		res.status(401).json({ message: "Unauthorized" });
	}
};

export const requireAdminOrRSO = async (req, res, next) => {
	try {
		if (!req.auth?.userId) {
			return res.status(401).json({ message: "Unauthorized - you must be logged in" });
		}

		const userEmail = req.auth?.email;
		const adminEmail = process.env.ADMIN_EMAIL;
		const isAdmin = userEmail && adminEmail && 
			userEmail.toLowerCase() === adminEmail.toLowerCase();

		if (!isAdmin) {
			return res.status(403).json({ 
				message: "Unauthorized - admin or RSO access required" 
			});
		}

		req.isAdmin = isAdmin;
		req.isRSO = false;
		next();
	} catch (error) {
		console.log("Error in requireAdminOrRSO:", error);
		res.status(401).json({ message: "Unauthorized" });
	}
};

export const attachUserRole = async (req, res, next) => {
	try {
		if (!req.auth?.userId) {
			next();
			return;
		}

		const userEmail = req.auth?.email;
		const adminEmail = process.env.ADMIN_EMAIL;
		const isAdmin = userEmail && adminEmail && 
			userEmail.toLowerCase() === adminEmail.toLowerCase();

		req.userRole = isAdmin ? "admin" : "user";
		req.isAdmin = isAdmin;
		req.isRSO = false;
		
		console.log("👤 User Role Attached:", {
			email: userEmail,
			role: req.userRole,
			isAdmin,
		});
		
		next();
	} catch (error) {
		console.log("Error in attachUserRole:", error);
		next();
	}
};