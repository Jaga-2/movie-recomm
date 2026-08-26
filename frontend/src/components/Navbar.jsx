import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, Menu, X, Droplet } from 'lucide-react';

export const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, token } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/70 transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Sidebar toggle + Logo */}
        <div className="flex items-center gap-3">
          {token && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-dark to-brand-primary text-white shadow-md">
              <Droplet size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-dark to-brand-primary bg-clip-text text-transparent dark:from-brand-primary dark:to-cyan-400">
              AquaFlow AI
            </span>
          </Link>
        </div>

        {/* Right Side: Theme Toggle + User Options */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200/50 p-2.5 text-slate-500 hover:bg-slate-50 dark:border-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-900 transition-all"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {token ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/profile" 
                className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/50 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-900 transition-all"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold">{user?.full_name || 'Profile'}</span>
              </Link>
              
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 transition-all"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover shadow-md shadow-brand-primary/10 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
