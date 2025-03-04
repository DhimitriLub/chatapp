import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader, Menu } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/userAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import MainSidebar from "./components/MainSidebar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SignUpPage from "./pages/SignUpPage";

const App = () => {
  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore()
  const { theme } = useThemeStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  console.log({onlineUsers});
  
  if(isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  )

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden">
      {/* Main Navigation Sidebar */}
      <nav 
        className={`fixed lg:relative lg:translate-x-0 h-full transition-transform duration-300 ease-in-out z-50 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <MainSidebar onClose={() => setIsSidebarOpen(false)} />
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 btn btn-circle btn-ghost"
        >
          <Menu className="size-6" />
        </button>

        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>

        <Toaster />
      </main>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

