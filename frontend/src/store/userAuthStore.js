import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

const SOCKET_RECONNECTION_CONFIG = {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 50
};

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

export const useAuthStore = create((set, get) => ({
    authUser: null,
    onlineUsers: [],
    socket: null,
    isCheckingAuth: true,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data.data });
            get().connectSocket();
        } catch (error) {
            console.error("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data.data });
            toast.success("Account created successfully");
            get().connectSocket();
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
            return { success: false, error };
        }
    },

    login: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data.data });
            toast.success("Logged in successfully");
            get().connectSocket();
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            return { success: false, error };
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            get().disconnectSocket();
            set({ authUser: null, onlineUsers: [] });
            toast.success("Logged out successfully");
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
            return { success: false, error };
        }
    },

    updateProfile: async (data) => {
        try {
            // Handle image upload
            if (data.profilePic) {
                // Check if it's a base64 image
                if (data.profilePic.startsWith('data:image')) {
                    // Check image size
                    const base64Size = (data.profilePic.length * 3) / 4;
                    if (base64Size > MAX_IMAGE_SIZE) {
                        throw new Error("Image size should be less than 1MB");
                    }

                    // Convert base64 to blob
                    const response = await fetch(data.profilePic);
                    const blob = await response.blob();
                    
                    // Create form data
                    const formData = new FormData();
                    formData.append('profilePic', blob, 'profile.jpg');
                    
                    // Update with form data
                    const res = await axiosInstance.put("/auth/update-profile", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    set({ authUser: res.data.data });
                    toast.success("Profile picture updated successfully");
                    return { success: true };
                }
            }

            // Handle other profile updates
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data.data });
            toast.success("Profile updated successfully");
            return { success: true };
        } catch (error) {
            console.error("Error in update profile:", error);
            const errorMessage = error.response?.data?.error || error.message || "Profile update failed";
            toast.error(errorMessage);
            return { success: false, error };
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser) return;

        // Disconnect existing socket if any
        get().disconnectSocket();

        try {
            const socket = io(BASE_URL, {
                query: { userId: authUser._id },
                ...SOCKET_RECONNECTION_CONFIG
            });

            // Setup event handlers
            const eventHandlers = {
                connect: () => {
                    console.log("Socket connected successfully!");
                    set({ socket });
                },
                getOnlineUsers: (userIds) => {
                    console.log("Received online users:", userIds);
                    set({ onlineUsers: userIds });
                },
                connect_error: (error) => {
                    console.error("Socket connection error:", error);
                    toast.error("Connection error. Trying to reconnect...");
                },
                disconnect: (reason) => {
                    console.log("Socket disconnected:", reason);
                    if (reason === "io server disconnect") {
                        socket.connect();
                    }
                }
            };

            // Register all event handlers
            Object.entries(eventHandlers).forEach(([event, handler]) => {
                socket.on(event, handler);
            });

            socket.connect();
        } catch (error) {
            console.error("Error setting up socket:", error);
            toast.error("Failed to connect to chat server");
        }
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            const events = ["connect", "disconnect", "getOnlineUsers", "connect_error"];
            events.forEach(event => socket.off(event));
            socket.disconnect();
            set({ socket: null });
        }
    }
}));