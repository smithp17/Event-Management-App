// frontend/src/providers/AuthProvider.tsx

import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const { checkAdminStatus, resetAuth } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  // 🔥 Prevent Clerk hydration flicker from resetting state
  const isTrulyLoggedOut = isLoaded && isSignedIn === false && user === null;

  // --------------------------------------------------------
  // 1️⃣ Login flow: Token → Admin Check → Socket
  // --------------------------------------------------------
  useEffect(() => {
    const initAuthFlow = async () => {
      if (!isSignedIn || !user) return;

      console.log("🔐 User is signed in:", user.id);

      // 1) Get token
      const token = await getToken();
      if (!token) {
        console.log("❌ No token received");
        return;
      }

      // 2) Set axios token
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("✅ Authorization header set");

      // 3) Check admin status AFTER token is ready
      console.log("🔍 Checking admin status...");
      await checkAdminStatus();

      // 4) Init socket connection
      console.log("🔌 Initializing socket for:", user.id);
      initSocket(user.id);
    };

    initAuthFlow();
  }, [isSignedIn, user, getToken, checkAdminStatus, initSocket]);

  // --------------------------------------------------------
  // 2️⃣ Logout flow
  // --------------------------------------------------------
  useEffect(() => {
    if (isTrulyLoggedOut) {
      console.log("🔓 User really signed out — cleaning up");
      resetAuth();
      disconnectSocket();
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  }, [isTrulyLoggedOut, resetAuth, disconnectSocket]);

  return <>{children}</>;
};

export default AuthProvider;
