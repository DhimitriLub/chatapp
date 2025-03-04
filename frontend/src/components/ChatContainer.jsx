import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/userAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useRef } from "react";
import ImageModal from "./ImageModal";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages, markMessagesAsSeen } = useChatStore()
  const { authUser } = useAuthStore();

  const messagesEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      markMessagesAsSeen(selectedUser._id);
    }

    subscribeToMessages();
    return () => {unsubscribeFromMessages(); }
  },[selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if(messagesEndRef.current && messages) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add seen indicator to the last message
  const lastMessageFromUser = messages
    .filter(message => message.senderId === authUser._id)
    .slice(-1)[0];

  if(isMessagesLoading) return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput />
    </div>
  )


  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
          key={message._id}
          className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          ref={messagesEndRef}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img 
                src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : 
                  selectedUser.profilePic || "avatar.png"
                }
                
                alt="profile pic"
              />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img 
                src={message.image}
                alt="Attachment"
                className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(message.image)}
                />
              )}
              {message.text && <p>{message.text}</p>}
              <div className="text-[10px] opacity-70 flex items-center gap-1 mt-1">
                {formatMessageTime(message.createdAt)}
                {message.senderId === authUser._id && message === lastMessageFromUser && (
                  <span className="ml-1">
                    {message.seen ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
          </div>

      <MessageInput />

      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}

    </div>
  );
};

export default ChatContainer;
