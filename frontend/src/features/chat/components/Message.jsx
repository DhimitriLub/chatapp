import React, { memo } from 'react';
import { formatMessageTime } from "../utils/formatTime";

const Message = memo(({ 
    message, 
    isFromCurrentUser, 
    isLastMessageFromUser,
    authUser,
    selectedUser,
    onImageClick,
    onMessageEdit 
}) => {
    return (
        <div
            key={message._id}
            className={`chat ${isFromCurrentUser ? "chat-end" : "chat-start"}`}
        >
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <img
                        src={isFromCurrentUser ? authUser.profilePic || "/avatar.png" :
                            selectedUser.profilePic || "/avatar.png"
                        }
                        alt="profile pic"
                        onError={(e) => {
                            if (e.target.src !== "/avatar.png") {
                                e.target.src = "/avatar.png";
                            }
                        }}
                        loading="lazy"
                    />
                </div>
            </div>
            <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>
            </div>
            <div 
                className="chat-bubble flex flex-col"
                onDoubleClick={() => {
                    if (isFromCurrentUser) {
                        onMessageEdit(message);
                    }
                }}
            >
                {message.image && (
                    <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => onImageClick(message.image)}
                        loading="lazy"
                    />
                )}
                {message.text && <p>{message.text}</p>}
                {isFromCurrentUser && (
                    <div className="text-[10px] opacity-70 flex items-center gap-1 mt-1">
                        <span className="ml-1">
                            {message.seen ? "✓✓" : "✓"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
});

Message.displayName = 'Message';

export default Message; 