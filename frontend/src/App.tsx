// frontend/src/App.tsx
import { Route, Routes } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./layout/MainLayout";

// Pages
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import ChatPage from "./pages/chat/ChatPage";
import AdminPage from "./pages/admin/AdminPage";
import BrowsePage from "./pages/browse/BrowsePage";
import EventDetailPage from "./pages/event-detail/EventDetailPage";
import MyEventsPage from "./pages/my-events/MyEventsPage";
import EditEventPage from "./pages/my-events/EditEventPage";
import MyTicketsPage from "./pages/my-tickets/MyTicketsPage";
import NotFoundPage from "./pages/404/NotFoundPage";

// Stores
import { useAuthStore } from "./stores/useAuthStore";

function App() {
	const { isAdmin, isLoading } = useAuthStore();

	return (
		<>
			<Routes>
				{/* Auth Routes */}
				<Route
					path="/sso-callback"
					element={
						<AuthenticateWithRedirectCallback
							signUpForceRedirectUrl="/auth-callback"
						/>
					}
				/>
				<Route path="/auth-callback" element={<AuthCallbackPage />} />

				{/* Admin Route - Protected */}
				<Route
					path="/admin"
					element={
						isLoading ? (
							<div className="h-screen flex items-center justify-center bg-zinc-950">
								<div className="size-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
							</div>
						) : isAdmin ? (
							<AdminPage />
						) : (
							<NotFoundPage />
						)
					}
				/>

				{/* Main Layout Routes */}
				<Route element={<MainLayout />}>
					{/* Public Routes */}
					<Route path="/" element={<HomePage />} />
					<Route path="/browse" element={<BrowsePage />} />
					<Route path="/events/:eventId" element={<EventDetailPage />} />

					{/* Protected Routes (components handle auth internally) */}
					<Route path="/chat" element={<ChatPage />} />
					<Route path="/my-events" element={<MyEventsPage />} />
					<Route path="/my-events/:eventId/edit" element={<EditEventPage />} />
					<Route path="/my-tickets" element={<MyTicketsPage />} />

					{/* 404 */}
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Routes>
			<Toaster />
		</>
	);
}

export default App;