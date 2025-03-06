import React, { useEffect, useState } from 'react'
import { useChatStore } from '../features/chat/store/useChatStore';
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/userAuthStore';

const Sidebar = () => {
  const { getUsers, users, isUsersLoading, setSelectedUser, selectedUser, unreadCounts } = useChatStore();
  const { onlineUsers = [], authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Convert online user IDs to strings for comparison
  const onlineUserIds = onlineUsers.map(id => String(id));
  
  // Filter out the current user and apply online filter if needed
  const filteredUsers = users
    .filter(user => user._id !== authUser?._id)
    .filter(user => !showOnlineOnly || onlineUserIds.includes(String(user._id)));

  // Count online users (excluding current user)
  const onlineCount = onlineUsers.filter(id => id !== authUser?._id).length;

  if (isUsersLoading) return <SidebarSkeleton />;
  
  return (
    <aside className={`h-full border-r border-base-300 flex flex-col transition-all duration-300
      ${isExpanded ? 'w-72' : 'w-20'}`}
    >
      {/* Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="border-b border-base-300 w-full p-5 flex items-center gap-2 hover:bg-base-200 transition-colors"
      >
        <Users className="size-6" />
        <span className={`font-medium transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          Contacts ({users.length - 1})
        </span>
        <ChevronRight className={`ml-auto size-5 transition-transform duration-300 
          ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
        />
      </button>

      {/* Online Filter */}
      {isExpanded && (
        <div className="px-5 py-3 border-b border-base-300">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
            <span className="text-xs text-base-content/60 ml-auto">
              ({onlineCount} online)
            </span>
          </label>
        </div>
      )}

      {/* Users List */}
      <div className="overflow-y-auto flex-1">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-200 transition-colors relative
              ${selectedUser?._id === user._id ? "bg-base-300" : ""}`}
          >
            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.username}
                className="size-12 object-cover rounded-full"
              />
              {onlineUserIds.includes(String(user._id)) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
              )}
              {/* Unread Message Badge */}
              {unreadCounts[user._id] > 0 && (
                <div className="absolute -top-2 -right-2 bg-error text-error-content text-xs font-medium rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                  {unreadCounts[user._id]}
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName || user.username}</div>
                <div className="text-sm text-base-content/60">
                  {onlineUserIds.includes(String(user._id)) ? "Online" : "Offline"}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;