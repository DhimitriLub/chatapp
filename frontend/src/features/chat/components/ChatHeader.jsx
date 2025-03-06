import React from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../../../store/userAuthStore";
import { useChatStore } from "../store/useChatStore";

const DEFAULT_AVATAR = "/avatar.png";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const profilePic = selectedUser.profilePic || DEFAULT_AVATAR;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`avatar ${onlineUsers.includes(selectedUser._id) ? 'online' : 'offline'}`}>
            <div className="w-10 rounded-full relative">
              <img 
                src={profilePic}
                alt={selectedUser.fullName || selectedUser.username} 
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  if (e.target.src !== DEFAULT_AVATAR) {
                    console.log('Setting default avatar');
                    e.target.src = DEFAULT_AVATAR;
                  }
                }}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName || selectedUser.username}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-circle btn-sm">
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;  