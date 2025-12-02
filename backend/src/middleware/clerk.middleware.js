// backend/src/middleware/clerk.middleware.js
import { jwtDecode } from 'jwt-decode';

// Simple in-memory cache for user emails
const emailCache = new Map();

export const verifyClerkToken = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		// No auth header = public request (that's OK!)
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			// This is fine for public routes like GET /events
			req.auth = { userId: null, email: null };
			return next();
		}

		const token = authHeader.substring(7); // Remove 'Bearer '
		
		// Decode the JWT token
		const decoded = jwtDecode(token);
		
		// Log the full decoded token for debugging
		console.log("🔓 Decoded JWT claims:", JSON.stringify(decoded, null, 2));
		
		const userId = decoded.sub; // Clerk uses 'sub' for user ID
		
		// Try multiple fields where email might be stored in Clerk token
		let email = decoded.email || 
			decoded.primary_email || 
			decoded.email_address ||
			decoded.emails?.[0]?.email_address ||
			decoded.emails?.[0] ||
			null;

		// If email not in token, fetch from Clerk API
		if (!email && userId) {
			// Check cache first
			if (emailCache.has(userId)) {
				email = emailCache.get(userId);
				console.log("📧 Email from cache:", email);
			} else {
				// Fetch from Clerk API
				console.log("🌐 Fetching email from Clerk API for user:", userId);
				
				if (!process.env.CLERK_SECRET_KEY) {
					console.error("❌ CLERK_SECRET_KEY is not set!");
				} else {
					try {
						const clerkResponse = await fetch(
							`https://api.clerk.com/v1/users/${userId}`,
							{
								headers: {
									Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
									"Content-Type": "application/json",
								},
							}
						);

						console.log("📡 Clerk API response status:", clerkResponse.status);

						if (clerkResponse.ok) {
							const userData = await clerkResponse.json();
							console.log("👤 Clerk user data:", {
								id: userData.id,
								email_addresses: userData.email_addresses?.map(e => e.email_address),
								primary_email_address_id: userData.primary_email_address_id,
							});
							
							// Get primary email or first email
							const primaryEmailId = userData.primary_email_address_id;
							const primaryEmail = userData.email_addresses?.find(e => e.id === primaryEmailId);
							email = primaryEmail?.email_address || userData.email_addresses?.[0]?.email_address || null;
							
							// Cache the email
							if (email) {
								emailCache.set(userId, email);
								console.log("📧 Email fetched and cached:", email);
							}
						} else {
							const errorText = await clerkResponse.text();
							console.error("❌ Clerk API error:", clerkResponse.status, errorText);
						}
					} catch (clerkError) {
						console.error("❌ Could not fetch user from Clerk:", clerkError.message);
					}
				}
			}
		}

		console.log("✅ Auth set:", { userId, email, hasEmail: !!email });

		// Pass both userId and email to the request
		req.auth = { userId, email };
		next();
	} catch (error) {
		console.error("❌ Error verifying token:", error.message);
		req.auth = { userId: null, email: null };
		next();
	}
};