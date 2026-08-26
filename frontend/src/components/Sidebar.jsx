import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TestTube2, 
  BarChart3, 
  History, 
  Activity, 
  User, 
  ShieldAlert, 
  BookOpen, 
  Home,
  MessageSquareShare
} from 'lucide-react';

export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Water Analysis', to: '/analysis', icon: TestTube2 },
    { name: 'Visualizations', to: '/visualization', icon: BarChart3 },
    { name: 'Prediction History', to: '/history', icon: History },
    { name: 'Live Monitoring', to: '/monitoring', icon: Activity },
    { name: 'AI Chat Assistant', to: '/chat', icon: MessageSquareShare },
    { name: 'Developer API', to: '/docs', icon: BookOpen },
    { name: 'User Profile', to: '/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Admin Dashboard', to: '/admin', icon: ShieldAlert }
  ];

  const linkClasses = ({ isActive }) => 
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
      isActive 
        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
    }`;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-6">
      <div className="space-y-6 px-4">
        {/* Navigation Section */}
        <div>
          <span className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Water Quality Portal
          </span>
          <nav className="mt-3 space-y-1">
            <NavLink to="/" end className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white transition-all">
              <Home size={18} />
              <span>Back to Home</span>
            </NavLink>
            {navigation.map((item) => (
              <NavLink key={item.name} to={item.to} className={linkClasses} onClick={() => setSidebarOpen(false)}>
                <item.icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin Navigation Section */}
        {user?.role === 'admin' && (
          <div>
            <span className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              System Management
            </span>
            <nav className="mt-3 space-y-1">
              {adminNav.map((item) => (
                <NavLink key={item.name} to={item.to} className={linkClasses} onClick={() => setSidebarOpen(false)}>
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* User profile brief */}
      <div className="border-t border-slate-200/50 px-6 pt-4 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white font-bold text-sm">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{user?.full_name || 'Aqua User'}</h4>
            <p className="truncate text-[10px] text-slate-400">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Off-canvas sidebar for mobile */}
      <div className={`fixed inset-0 z-40 flex lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop overlay */}
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        
        {/* Sidebar panel */}
        <div className={`relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-950 border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarContent}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-16 lg:z-30 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50">
        {sidebarContent}
      </div>
    </>
  );
};
