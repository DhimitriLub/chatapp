import { useEffect } from "react";
import { useChatStore } from "../features/chat/store/useChatStore";
import { useAuthStore } from "../store/userAuthStore";

import Sidebar from "../features/chat/components/Sidebar";
import NoChatSelected from "../features/chat/components/NoChatSelected";
import ChatContainer from "../features/chat/components/ChatContainer";

const HomePage = () => {
  const { selectedUser, getUsers } = useChatStore();
  const { socket, connectSocket } = useAuthStore();

  // Initialize socket and fetch users
  useEffect(() => {
    if (!socket) {
      connectSocket();
    }
    
    // Initial fetch
    getUsers();

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      getUsers();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [socket]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
