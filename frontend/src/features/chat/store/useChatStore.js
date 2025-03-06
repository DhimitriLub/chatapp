import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../../../lib/axios";

export const useChatStore = create((set, get) => ({
    users: [],
    selectedUser: null,
    unreadCounts: {}, // {userId: count}

    getUsers: async () => {
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data.data || [] });
            // Get unread counts
            await get().getUnreadCounts();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching users");
            // Reset users to empty array on error
            set({ users: [] });
        }
    },

    updateUserLastMessage: (userId, message) => {
        try {
            if (!userId || !message) {
                throw new Error("Invalid parameters for updateUserLastMessage");
            }
            set(state => ({
                users: state.users.map(user => 
                    user._id === userId 
                        ? { ...user, lastMessage: message }
                        : user
                )
            }));
        } catch (error) {
            console.error("Error updating last message:", error);
            toast.error("Failed to update last message");
        }
    },

    getUnreadCounts: async () => {
        try {
            const res = await axiosInstance.get('/messages/unread/counts');
            set({ unreadCounts: res.data.data || {} });
        } catch (error) {
            console.error("Error fetching unread counts:", error);
            // Reset unread counts on error
            set({ unreadCounts: {} });
        }
    },

    setSelectedUser: (selectedUser) => {
        if (!selectedUser) {
            set({ selectedUser: null });
            return;
        }

        set({ selectedUser });
        // Clear unread count when selecting a user
        set(state => ({
            unreadCounts: {
                ...state.unreadCounts,
                [selectedUser._id]: 0
            }
        }));
    },

    updateUnreadCount: (userId, increment = true) => {
        if (!userId) return;
        
        set(state => {
            const currentCount = state.unreadCounts[userId] || 0;
            const newCount = increment ? currentCount + 1 : 0;
            
            // Only update if the count actually changes
            if (currentCount !== newCount) {
                return {
                    unreadCounts: {
                        ...state.unreadCounts,
                        [userId]: newCount
                    }
                };
            }
            return state;
        });
    },

    // Method to handle incoming messages
    handleNewMessage: (message, currentUserId) => {
        const { selectedUser, updateUnreadCount, updateUserLastMessage } = get();
        
        // Update last message in the users list
        const otherUserId = message.senderId === currentUserId 
            ? message.receiverId 
            : message.senderId;
        
        // Update the last message
        updateUserLastMessage(otherUserId, message);

        // Only update unread count if:
        // 1. The message is received (not sent)
        // 2. Either no chat is selected or a different chat is selected
        if (message.receiverId === currentUserId && 
            (!selectedUser || selectedUser._id !== message.senderId)) {
            updateUnreadCount(message.senderId, true);
        }
    }
}));
