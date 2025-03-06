import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, User, X } from 'lucide-react';
import { useAuthStore } from '../../store/userAuthStore';

const MainSidebar = ({ onClose }) => {
    const location = useLocation();
    const { authUser, logout } = useAuthStore();

    const navItems = [
        {
            path: '/',
            icon: <Home className="size-5" />,
            label: 'Home'
        },
        {
            path: '/profile',
            icon: <User className="size-5" />,
            label: 'Profile'
        },
        {
            path: '/settings',
            icon: <Settings className="size-5" />,
            label: 'Settings'
        }
    ];

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <div className="h-full w-64 bg-base-200 flex flex-col">
            {/* Close Button (Mobile Only) */}
            <button 
                onClick={onClose}
                className="lg:hidden absolute right-2 top-2 btn btn-ghost btn-circle"
            >
                <X className="size-6" />
            </button>

            {/* User Profile */}
            <div className="p-4 text-center border-b border-base-300">
                <div className="avatar mb-4">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={authUser?.profilePic} alt={authUser?.username} />
                    </div>
                </div>
                <h2 className="text-xl font-bold">{authUser?.username}</h2>
                <p className="text-sm opacity-70">{authUser?.email}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                onClick={onClose}
                                className={`btn btn-ghost justify-start w-full ${
                                    location.pathname === item.path ? 'btn-active' : ''
                                }`}
                            >
                                {item.icon}
                                <span className="ml-2">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-base-300">
                <button
                    onClick={handleLogout}
                    className="btn btn-error w-full"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default MainSidebar; 