import React, { useState } from 'react';
import { useAuthStore } from "../../../store/userAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Users, ChevronRight } from "lucide-react";
import { formatMessageTime } from "../utils/formatTime";

const DEFAULT_AVATAR = "/avatar.png";

const Sidebar = () => {
    const { users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts } = useChatStore();
    const { authUser, onlineUsers } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    const filteredUsers = showOnlineOnly
        ? users.filter(user => onlineUsers.includes(user._id))
        : users;

    const getLastMessagePreview = (lastMessage) => {
        if (!lastMessage?.text && !lastMessage?.image) return "";
        if (lastMessage.image && !lastMessage.text) return "📷 Image";
        return lastMessage.text;
    };

    return (
        <div className="flex flex-col h-full w-80 bg-base-200">
            <div className="p-4 border-b border-base-300">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Messages</h2>
                    <label className="label cursor-pointer gap-2">
                        <span className="label-text">Online</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                        />
                    </label>
                </div>
            </div>

            <div className="overflow-y-auto flex-1">
                {isUsersLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const lastMessage = user.lastMessage;
                        const messagePreview = getLastMessagePreview(lastMessage);
                        const profilePic = user.profilePic || DEFAULT_AVATAR;
                        
                        return (
                            <div
                                key={user._id}
                                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-base-300 transition-colors relative
                                    ${selectedUser?._id === user._id ? 'bg-base-300' : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className={`avatar ${onlineUsers.includes(user._id) ? 'online' : 'offline'}`}>
                                    <div className="w-12 rounded-full">
                                        <img 
                                            src={profilePic}
                                            alt={user.fullName || user.username} 
                                            onError={(e) => {
                                                if (e.target.src !== DEFAULT_AVATAR) {
                                                    console.log('Setting default avatar');
                                                    e.target.src = DEFAULT_AVATAR;
                                                }
                                            }}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold">{user.fullName || user.username}</h3>
                                    {messagePreview && (
                                        <div className="flex items-center gap-2 text-sm opacity-70">
                                            <p className="truncate">{messagePreview}</p>
                                            {lastMessage?.createdAt && (
                                                <span className="whitespace-nowrap">
                                                    · {formatMessageTime(lastMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {unreadCounts[user._id] > 0 && (
                                    <div className="badge badge-error badge-sm absolute top-4 right-4">
                                        {unreadCounts[user._id]}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Sidebar; 