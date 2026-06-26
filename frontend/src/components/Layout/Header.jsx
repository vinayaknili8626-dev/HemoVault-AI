import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, Menu, Check } from 'lucide-react';
import axios from 'axios';

const Header = ({ setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Read theme on mount
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await axios.get('/api/reports'); // reports fetch yields recent notifications indirectly or we call a general API
        // For simplicity, we can fetch notifications from a dedicated route if created, otherwise we retrieve or mock.
        // Let's call /api/patients/dashboard if role is patient, otherwise fetch directly
        let list = [];
        if (user.role === 'patient') {
          const dash = await axios.get('/api/patients/dashboard');
          list = dash.data.recentNotifications || [];
        } else {
          // Doctors/Labs have standard reports notifications
          list = [
            { _id: '1', title: 'System Online', message: 'HemoVault AI is running completely offline.', isRead: false, type: 'info' }
          ];
        }
        setNotifications(list);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, [user]);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const markAsRead = async (notifId) => {
    // Local update
    setNotifications(prev => prev.filter(n => n._id !== notifId));
    // If database connection is active, we would send a patch request here:
    // await axios.patch(`/api/notifications/${notifId}`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(prev => !prev)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs text-slate-500 font-semibold dark:text-slate-400">
            Welcome back,
          </span>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {user?.name}
          </h2>
        </div>
      </div>

      {/* Right: Theme Toggle, Notifications, Profile Capsule */}
      <div className="flex items-center gap-3">
        {/* Dark Mode button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Light/Dark Mode"
        >
          {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
        </button>

        {/* Notifications Icon and Dialog */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-2xs font-bold text-white bg-primary-600 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-600">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</h4>
                        <p className="text-2xs text-slate-500 mt-1">{n.message}</p>
                      </div>
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Dismiss"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Tag */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-full uppercase tracking-wider">
            {user?.role === 'super_admin' ? 'System Admin' : user?.role}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
