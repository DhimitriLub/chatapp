import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../../../store/userAuthStore";
import Message from "./Message";
import ImageModal from "./ImageModal";
import { axiosInstance } from "../../../lib/axios";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { selectedUser, updateUnreadCount, updateUserLastMessage, handleNewMessage } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [messageToEdit, setMessageToEdit] = useState(null);

  // Memoize the last message from current user
  const lastMessageFromUser = useMemo(() => {
    const userMessages = messages.filter(msg => msg.senderId === authUser._id);
    return userMessages[userMessages.length - 1];
  }, [messages, authUser._id]);

  const getMessages = useCallback(async () => {
    if (!selectedUser?._id) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/messages/${selectedUser._id}`);
      setMessages(res.data.data || []);
      markMessagesAsSeen();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser?._id]);

  const markMessagesAsSeen = async () => {
    if (!selectedUser?._id) return;
    try {
      await axiosInstance.put(`/messages/${selectedUser._id}`, { action: 'markSeen' });
      setMessages(prev => prev.map(msg => 
        msg.senderId === selectedUser._id ? { ...msg, seen: true } : msg
      ));
      updateUnreadCount(selectedUser._id, false);
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  const handleNewMessageReceived = useCallback((newMessage) => {
    if (!socket?.connected || !newMessage?._id || 
        !newMessage?.senderId || !newMessage?.receiverId) return;
    
    const messageExists = messages.some(msg => msg._id === newMessage._id);
    if (messageExists) return;

    const isRelevantToCurrentChat = (
      (selectedUser?._id === newMessage.senderId && authUser._id === newMessage.receiverId) || 
      (selectedUser?._id === newMessage.receiverId && authUser._id === newMessage.senderId)
    );

    if (isRelevantToCurrentChat) {
      setMessages(prev => [...prev, newMessage].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      ));

      if (selectedUser._id === newMessage.senderId) {
        markMessagesAsSeen();
      }
    }

    // Update store with new message
    handleNewMessage(newMessage, authUser._id);
  }, [socket, selectedUser, authUser._id, messages, handleNewMessage]);

  const handleMessageEdit = async (messageId, newText) => {
    if (!messageId || !newText?.trim()) return;
    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, {
        action: 'edit',
        text: newText.trim()
      });
      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? res.data.data : msg
      ));
      toast.success("Message updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating message");
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handlers = {
      newMessage: handleNewMessageReceived,
      messageEdited: (editedMessage) => {
        setMessages(prev => prev.map(msg =>
          msg._id === editedMessage._id ? editedMessage : msg
        ));
      },
      messagesSeen: ({ senderId, receiverId }) => {
        if (selectedUser?._id === receiverId) {
          setMessages(prev => prev.map(msg => 
            msg.senderId === authUser._id ? { ...msg, seen: true } : msg
          ));
        }
      }
    };

    // Register handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      // Cleanup handlers
      Object.keys(handlers).forEach(event => {
        socket.off(event);
      });
    };
  }, [socket, handleNewMessageReceived, selectedUser, authUser]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages();
    }
    return () => setMessages([]);
  }, [selectedUser?._id, getMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput 
        messageToEdit={messageToEdit} 
        setMessageToEdit={setMessageToEdit}
        onMessageSent={getMessages}
      />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isFromCurrentUser = message.senderId === authUser._id;
          const isLastMessageFromUser = isFromCurrentUser && message === lastMessageFromUser;

          return (
            <Message
              key={message._id}
              message={message}
              isFromCurrentUser={isFromCurrentUser}
              isLastMessageFromUser={isLastMessageFromUser}
              authUser={authUser}
              selectedUser={selectedUser}
              onImageClick={setSelectedImage}
              onMessageEdit={setMessageToEdit}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        messageToEdit={messageToEdit} 
        setMessageToEdit={setMessageToEdit} 
        onMessageSent={getMessages}
      />

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
