import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./userAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    unreadCounts: {}, // {userId: count}

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const { data } = await axiosInstance.get("/messages/users");
            set({ users: data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
            
        }
    },
    
    markMessagesAsSeen: async (userId) => {
        try {
            await axiosInstance.put(`/messages/seen/${userId}`);
            set(state => ({
                messages: state.messages.map(msg => 
                    msg.senderId === userId ? { ...msg, seen: true } : msg
                ),
                // Clear unread count for this user
                unreadCounts: {
                    ...state.unreadCounts,
                    [userId]: 0
                }
            }));
        } catch (error) {
            console.error("Error marking messages as seen:", error);
        }
    },

    getUnreadCounts: async () => {
        try {
            const res = await axiosInstance.get('/messages/unread-counts');
            set({ unreadCounts: res.data });
        } catch (error) {
            console.error("Error fetching unread counts:", error);
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            // If the user is currently viewing the chat with the sender,
            // mark the message as seen immediately
            const { selectedUser } = get();
            if (selectedUser?._id === newMessage.senderId) {
                get().markMessagesAsSeen(newMessage.senderId);
            } else {
                // Otherwise, increment the unread count
                set(state => ({
                    unreadCounts: {
                        ...state.unreadCounts,
                        [newMessage.senderId]: (state.unreadCounts[newMessage.senderId] || 0) + 1
                    }
                }));
            }
            
            set(state => ({
                messages: [...state.messages, newMessage],
            }));
        });

        socket.on("messagesSeen", ({ senderId, receiverId }) => {
            if (senderId === useAuthStore.getState().authUser._id) {
                set(state => ({
                    messages: state.messages.map(msg => 
                        msg.senderId === senderId ? { ...msg, seen: true } : msg
                    )
                }));
            }
        });

        socket.on("messagesRead", ({ senderId }) => {
            set(state => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [senderId]: 0
                }
            }));
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messagesSeen");
        socket.off("messagesRead");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}))
