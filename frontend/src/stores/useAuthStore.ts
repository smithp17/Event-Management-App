// frontend/src/stores/useAuthStore.ts
import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

interface AuthStore {
	isAdmin: boolean;
	isLoading: boolean;
	error: string | null;
	checkAdminStatus: () => Promise<void>;
	resetAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	isLoading: true,
	error: null,

	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });
		try {
			console.log("🔐 Checking admin status...");
			const response = await axiosInstance.get("/auth/check-admin");
			
			console.log("🔐 Admin check response:", response.data);
			console.log("   - isAdmin:", response.data.isAdmin);
			console.log("   - email:", response.data.email);
			console.log("   - adminEmail:", response.data.adminEmail);
			
			set({ 
				isAdmin: response.data.isAdmin === true, 
				isLoading: false 
			});
		} catch (error: any) {
			console.error("🔐 Admin check error:", error?.response?.data || error.message);
			set({ isAdmin: false, isLoading: false, error: error.message });
		}
	},

	resetAuth: () => {
		console.log("🔐 Resetting auth state");
		set({ isAdmin: false, isLoading: false, error: null });
	},
}));