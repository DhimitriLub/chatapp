import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

const Navbar = () => {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <div className="navbar bg-base-200/50 px-4">
            <div className="flex-1">
                <h1 className="text-xl font-bold">Chat App</h1>
            </div>
            <div className="flex-none">
                <button
                    className="btn btn-circle btn-ghost"
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? (
                        <Sun className="size-5" />
                    ) : (
                        <Moon className="size-5" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Navbar; 