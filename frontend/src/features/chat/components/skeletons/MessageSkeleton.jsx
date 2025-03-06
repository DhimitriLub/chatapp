import React from 'react';

const MessageSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`chat ${i % 2 === 0 ? "chat-end" : "chat-start"}`}>
          <div className="chat-image avatar">
            <div className="w-10 rounded-full bg-base-300 animate-pulse" />
          </div>
          <div className="chat-header mb-1">
            <div className="h-3 w-16 bg-base-300 rounded animate-pulse" />
          </div>
          <div className="chat-bubble min-h-12 min-w-24 bg-base-300 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton; 