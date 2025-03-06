import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../../store/userAuthStore";
import { useChatStore } from "../../store/useChatStore";

const ChatContainer = () => {
    const { selectedUser } = useChatStore();
    const { messages, isMessagesLoading } = useChatStore();
    const lastMessageRef = useRef(null);
    const [messageToEdit, setMessageToEdit] = useState(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleMessageEdit = (message) => {
        if (message.senderId === useAuthStore.getState().authUser._id) {
            setMessageToEdit(message);
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-200/50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Welcome to the Chat App! 👋</h2>
                    <p className="text-base-content/70">Select a user to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-4">
                    <div className="avatar online">
                        <div className="w-12 rounded-full">
                            <img src={selectedUser.profilePic} alt={selectedUser.username} />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold">{selectedUser.username}</h3>
                        <p className="text-sm opacity-70">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isMessagesLoading ? (
                    Array(3).fill(0).map((_, i) => <MessageSkeleton key={i} />)
                ) : messages.length === 0 ? (
                    <div className="text-center text-base-content/70 mt-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message, idx) => (
                        <div
                            key={message._id}
                            ref={idx === messages.length - 1 ? lastMessageRef : null}
                            onDoubleClick={() => handleMessageEdit(message)}
                        >
                            <Message message={message} />
                        </div>
                    ))
                )}
            </div>

            {/* Message Input */}
            <MessageInput messageToEdit={messageToEdit} setMessageToEdit={setMessageToEdit} />
        </div>
    );
};

export default ChatContainer; 