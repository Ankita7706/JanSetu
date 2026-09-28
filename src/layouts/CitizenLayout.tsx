import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Mic, ListChecks, User, Bell, LogOut, Menu, X } from 'lucide-react';
import { authService } from '../services/authService';
import { MOCK_NOTIFICATIONS } from '../data/mockData';
import NotificationDrawer from '../components/common/NotificationDrawer';
import CitizenFaqAssistant from '../components/assistant/CitizenFaqAssistant';
import type { AppNotification } from '../types';

const navItems = [
  {
    to: '/citizen/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    to: '/citizen/submit',
    label: 'Submit Request',
    icon: <PlusCircle size={18} />,
  },
  {
    to: '/citizen/voice',
    label: 'Voice Input',
    icon: <Mic size={18} />,
  },
  {
    to: '/citizen/requests',
    label: 'Track & History',
    icon: <ListChecks size={18} />,
  },
  {
    to: '/citizen/profile',
    label: 'My Profile',
    icon: <User size={18} />,
  },
];

export default function CitizenLayout() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, read: true } : n)));
    if (notif.link) {
      setNotificationsOpen(false);
      navigate(notif.link);
    }
  };

  return (
    <div className="min-h-screen bg-brand-yellow/15 flex flex-col font-body text-black">
      {/* Top Navbar */}
      <header className="bg-brand-yellow border-b-2 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-brutal-sm">
              <svg className="w-6 h-6 fill-brand-yellow" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-extrabold text-xl tracking-tight">JANSETU</span>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-black/70 mt-0.5">
                Citizen Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold border-2 transition-all ${
                    isActive
                      ? 'bg-black text-white border-black shadow-brutal-sm'
                      : 'bg-white/40 text-black border-transparent hover:border-black hover:bg-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Notifications Button */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center hover:bg-brand-yellow transition-colors shadow-brutal-sm cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white border-2 border-black rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            {user && (
              <Link
                to="/citizen/profile"
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-white border-2 border-black rounded-xl shadow-brutal-sm hover:bg-brand-yellow/30 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg border border-black object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 bg-black text-brand-yellow rounded-lg flex items-center justify-center font-heading font-extrabold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="text-left leading-none">
                  <p className="font-extrabold text-xs">{user.name}</p>
                  <p className="text-[10px] font-bold text-black/60">{user.location}</p>
                </div>
              </Link>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn-brutal-secondary hidden md:inline-flex px-3.5 py-2 text-xs font-extrabold rounded-xl items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center font-extrabold shadow-brutal-sm cursor-pointer"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {menuOpen && (
        <div className="lg:hidden bg-brand-yellow border-b-2 border-black z-30 fixed top-18 left-0 right-0 shadow-brutal-lg animate-in slide-in-from-top duration-150">
          <div className="p-4 space-y-2">
            {user && (
              <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-xl mb-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl border border-black object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-black text-brand-yellow rounded-xl flex items-center justify-center font-heading font-extrabold text-lg">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-heading font-extrabold text-sm">{user.name}</p>
                  <p className="text-xs font-bold text-black/60">{user.location}</p>
                </div>
              </div>
            )}
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 rounded-xl font-extrabold text-sm border-2 ${
                    isActive ? 'bg-black text-white border-black shadow-brutal-sm' : 'bg-white border-black/30'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="btn-brutal-secondary w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 mt-2"
            >
              <LogOut size={15} />
              Sign Out of Account
            </button>
          </div>
        </div>
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
      />

      {/* Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Citizen Footer */}
      <footer className="border-t-2 border-black bg-white py-6 px-4 md:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-black/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>JanSetu Multilingual Citizen Grievance Redressal Network</span>
          </div>
          <p>© 2026 Government of Odisha / BRICS Infrastructure Policy Hub</p>
        </div>
      </footer>

      <CitizenFaqAssistant initialLanguage={user?.language || 'Odia'} />
    </div>
  );
}
