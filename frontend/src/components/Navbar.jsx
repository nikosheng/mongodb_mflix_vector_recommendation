import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogIn, LogOut } from 'lucide-react';

const Navbar = ({ user, onLoginClick, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-black bg-opacity-90' : 'bg-gradient-to-b from-black to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-16 py-4">
        <div className="flex items-center space-x-8">
          <h1 className="text-red-600 text-3xl font-bold cursor-pointer">MFLIX</h1>
          <div className="hidden md:flex space-x-6 text-sm text-gray-300">
            <a href="#" className="text-white font-bold">Home</a>
            <a href="#" className="hover:text-gray-400 transition">TV Shows</a>
            <a href="#" className="hover:text-gray-400 transition">Movies</a>
            <a href="#" className="hover:text-gray-400 transition">New & Popular</a>
            <a href="#" className="hover:text-gray-400 transition">My List</a>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-white">
          <Search className="w-5 h-5 cursor-pointer hover:text-gray-300" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300" />
          
          {user ? (
             <div className="flex items-center space-x-4">
                <span className="text-sm font-bold hidden sm:block">Hi, {user.name}</span>
                <div 
                    onClick={onLogout}
                    className="flex items-center space-x-1 cursor-pointer hover:text-red-500 transition"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded cursor-pointer flex items-center justify-center">
                    <User className="w-5 h-5" />
                </div>
             </div>
          ) : (
             <button 
                onClick={onLoginClick}
                className="flex items-center bg-red-600 px-4 py-1 rounded text-sm font-bold hover:bg-red-700 transition"
             >
                <LogIn className="w-4 h-4 mr-2" /> Login
             </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
