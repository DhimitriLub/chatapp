import React from 'react';

const MessageSkeleton = () => {
    return (
        <div className="flex items-start gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-base-300"></div>
            <div className="flex-1">
                <div className="h-4 w-24 bg-base-300 rounded mb-2"></div>
                <div className="h-16 w-3/4 bg-base-300 rounded"></div>
            </div>
        </div>
    );
};

export default MessageSkeleton;