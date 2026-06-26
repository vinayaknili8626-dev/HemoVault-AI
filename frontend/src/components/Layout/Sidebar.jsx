import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Calendar, 
  Activity, 
  UserRound, 
  ShieldAlert, 
  MapPin, 
  LogOut, 
  UploadCloud, 
  Users, 
  Search, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation menus based on role
  const getNavLinks = () => {
    switch (user.role) {
      case 'patient':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Blood Reports', path: '/reports', icon: FileSpreadsheet },
          { name: 'Health Analytics', path: '/analytics', icon: Activity },
          { name: 'Health Timeline', path: '/timeline', icon: Clock },
          { name: 'Hospital Finder', path: '/hospital-finder', icon: MapPin },
          { name: 'FAQ & Support', path: '/faq', icon: HelpCircle },
          { name: 'Profile Profile', path: '/profile', icon: UserRound }
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'Patients Directory', path: '/doctor/patients', icon: Users },
          { name: 'Schedule', path: '/doctor/schedule', icon: Calendar },
          { name: 'FAQ & Support', path: '/faq', icon: HelpCircle }
        ];
      case 'laboratory':
        return [
          { name: 'Dashboard', path: '/lab/dashboard', icon: LayoutDashboard },
          { name: 'Upload Report', path: '/lab/upload', icon: UploadCloud },
          { name: 'Manage Reports', path: '/reports', icon: FileSpreadsheet },
          { name: 'Directories', path: '/lab/doctors', icon: Users }
        ];
      case 'hospital_admin':
      case 'super_admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Manage Users', path: '/admin/users', icon: Users },
          { name: 'Audit Activity Logs', path: '/admin/logs', icon: ShieldAlert },
          { name: 'FAQ & Support', path: '/faq', icon: HelpCircle }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300
      lg:translate-x-0 lg:static lg:h-screen
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between bg-slate-950 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-primary-400 to-teal-400 bg-clip-text text-transparent flex items-center">
              HemoVault AI
            </span>
          </Link>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* User Info Capsule */}
        <div className="px-4 py-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600/30 border border-primary-500/20 flex items-center justify-center font-bold text-primary-400">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{user.name}</h4>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={index}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'text-white bg-primary-600 shadow-md shadow-primary-900/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                `}
              >
                <Icon size={18} />
                <span>{link.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-850">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
