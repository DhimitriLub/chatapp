export const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
    
        return messageDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    } else if (diffInDays === 1) {
        return 'Yesterday';
    } else if (diffInDays < 7) {
        return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
        return messageDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}; 