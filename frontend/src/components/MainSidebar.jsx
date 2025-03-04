import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Settings, User, LogOut, X } from 'lucide-react';
import { useAuthStore } from '../store/userAuthStore';

const MainSidebar = ({ onClose }) => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  
  const navItems = [
    { icon: MessageSquare, label: 'Chats', path: '/' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="w-64 h-full bg-base-200 border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="size-5 text-primary" />
          </div>
          <span className="font-bold text-lg">Chat App</span>
        </Link>
        <button onClick={onClose} className="lg:hidden btn btn-ghost btn-circle btn-sm">
          <X className="size-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-base-300 transition-colors
              ${location.pathname === item.path ? 'bg-base-300' : ''}`}
          >
            <item.icon className="size-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      {authUser && (
        <div className="p-4 border-t border-base-300">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-base-300 transition-colors text-error"
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MainSidebar; 