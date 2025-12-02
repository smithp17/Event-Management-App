// frontend/src/lib/axios.ts
import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
});

// Add request interceptor to log headers
axiosInstance.interceptors.request.use(
	(config) => {
		const authHeader = config.headers.Authorization;
		console.log("Request Config:", {
			url: config.url,
			method: config.method,
			hasAuthHeader: !!authHeader,
			authHeaderPreview: authHeader ? authHeader.substring(0, 50) + "..." : "none",
		});
		return config;
	},
	(error) => Promise.reject(error)
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			console.warn("401 Unauthorized:", {
				url: error.config?.url,
				hasAuthHeader: !!error.config?.headers.Authorization,
			});
		}
		return Promise.reject(error);
	}
);