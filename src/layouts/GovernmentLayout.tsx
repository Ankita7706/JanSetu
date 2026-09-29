import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Table,
  MapPin,
  Award,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  Edit3,
  BarChart3,
  Globe,
} from 'lucide-react';
import { authService } from '../services/authService';
import { MOCK_NOTIFICATIONS } from '../data/mockData';
import NotificationDrawer from '../components/common/NotificationDrawer';
import GovProfileModal from '../components/common/GovProfileModal';
import type { AppNotification, User } from '../types';

const navItems = [
  {
    to: '/government/overview',
    label: 'Overview',
    icon: <LayoutDashboard size={18} />,
  },
  {
    to: '/government/my-requests',
    label: 'My Requests',
    icon: <UserCheck size={18} />,
  },
  {
    to: '/government/department-requests',
    label: 'Department Requests',
    icon: <Building size={18} />,
  },
  {
    to: '/government/requests',
    label: 'All Requests',
    icon: <Table size={18} />,
  },
  {
    to: '/government/hotspots',
    label: 'Demand Hotspots',
    icon: <MapPin size={18} />,
  },
  {
    to: '/government/recommendations',
    label: 'AI Recommendations',
    icon: <Award size={18} />,
  },
  {
    to: '/government/analytics',
    label: 'Analytics & SLA',
    icon: <BarChart3 size={18} />,
  },
  {
    to: '/government/regions',
    label: 'Region Analysis',
    icon: <Globe size={18} />,
  },
];

export default function GovernmentLayout() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const raw = authService.getCurrentUser();

    return {
      id: raw?.id || 'gov-user',
      name: raw?.name || 'Rashmita Panigrahy',
      email: raw?.email || 'official@demo.com',
      role: raw?.role || 'official',
      department: raw?.department || 'Water Resources & Public Health',
      designation: raw?.designation || 'Assistant Executive Engineer (AEE)',
      organization:
        raw?.organization ||
        `${raw?.designation || 'Assistant Executive Engineer (AEE)'} • ${
          raw?.department || 'Water Resources & Public Health'
        }`,
      location: raw?.location || 'Kalahandi, Odisha',
      district: raw?.district || 'Kalahandi',
      language: raw?.language || 'English',
      employeeId: raw?.employeeId || 'GOV-00-1234',
    };
  });

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 640px)').matches
  );
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  useEffect(() => {
    const unsubscribe = authService.subscribe(updated => {
      if (updated) {
        setCurrentUser({
          id: updated.id || 'gov-user',
          name: updated.name || 'Rashmita Panigrahy',
          email: updated.email || 'official@demo.com',
          role: updated.role || 'official',
          department:
            updated.department || 'Water Resources & Public Health',
          designation:
            updated.designation || 'Assistant Executive Engineer (AEE)',
          organization:
            updated.organization ||
            `${updated.designation || 'Assistant Executive Engineer (AEE)'} • ${
              updated.department || 'Water Resources & Public Health'
            }`,
          location: updated.location || 'Kalahandi, Odisha',
          district: updated.district || 'Kalahandi',
          language: updated.language || 'English',
          employeeId: updated.employeeId || 'GOV-00-1234',
        });
      }
    });

    const handleProfileCustomEvent = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };

    window.addEventListener(
      'jansetu_user_profile_updated',
      handleProfileCustomEvent
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        'jansetu_user_profile_updated',
        handleProfileCustomEvent
      );
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (globalSearch.trim()) {
      navigate(
        `/government/requests?search=${encodeURIComponent(
          globalSearch.trim()
        )}`
      );
    }
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'RP';

    const parts = nameStr.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${
        parts[parts.length - 1].charAt(0)
      }`.toUpperCase();
    }

    return nameStr.slice(0, 2).toUpperCase() || 'RP';
  };

  const initials = getInitials(currentUser.name);

  return (
    <div className="min-h-screen flex font-body bg-gray-100 text-black">
      {/* Neo-Brutalist Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-14 sm:w-64' : 'w-14 sm:w-20'
        } bg-brand-charcoal text-white flex flex-col transition-all duration-300 shrink-0 h-screen sticky top-0 border-r-2 border-black z-30 select-none`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-18 flex items-center justify-center px-1 sm:justify-start sm:px-4 border-b-2 border-black bg-brand-yellow text-black">
          <Link
            to="/"
            className="flex items-center justify-center gap-2.5 cursor-pointer overflow-hidden sm:justify-start"
          >
            <div className="w-9 h-9 bg-black flex items-center justify-center border-2 border-black shrink-0 shadow-brutal-sm">
              <svg
                className="w-5 h-5 fill-brand-yellow"
                viewBox="0 0 24 24"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>

            {sidebarOpen && (
              <div className="hidden flex-col leading-none sm:flex">
                <span className="font-heading font-extrabold text-base tracking-tight text-black">
                  JANSETU
                </span>
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-black/75 mt-0.5">
                  MP Intelligence
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white font-extrabold text-black shadow-brutal-sm transition-colors hover:bg-black hover:text-white sm:flex"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-1 py-4 scrollbar-thin sm:px-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center justify-center gap-3 rounded-xl border-2 px-0 py-2.5 text-xs font-extrabold transition-all sm:justify-start sm:px-3 ${
                  isActive
                    ? 'bg-brand-yellow text-black border-black shadow-brutal-sm'
                    : 'text-brand-sage border-transparent hover:bg-white/10 hover:text-white hover:border-white/20'
                } ${!sidebarOpen ? 'sm:justify-center sm:px-0' : ''}`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="hidden truncate sm:block">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Official User Profile Footer */}
        <div className="border-t-2 border-black/40 p-3 space-y-2 bg-black/40">
          {sidebarOpen ? (
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-brand-yellow text-black border border-black rounded-lg flex items-center justify-center font-heading font-extrabold text-sm shrink-0">
                  {initials}
                </div>

                <div className="overflow-hidden leading-tight flex-1">
                  <p className="text-white font-extrabold text-xs truncate">
                    {currentUser.name}
                  </p>

                  <p className="text-brand-yellow text-[10px] font-bold truncate">
                    {currentUser.designation || 'Officer'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-brand-yellow text-black rounded-lg text-[10px] font-extrabold border border-black shadow-brutal-xs hover:bg-white transition-all cursor-pointer"
              >
                <Edit3 size={11} />
                <span>Edit Official Profile</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setProfileModalOpen(true)}
              className="w-8 h-8 mx-auto bg-brand-yellow text-black border border-black rounded-lg flex items-center justify-center font-heading font-extrabold text-sm cursor-pointer hover:scale-105 transition-transform"
              title="Edit Profile"
            >
              <Edit3 size={14} />
            </button>
          )}

          <button
            onClick={handleLogout}
            title={!sidebarOpen ? 'Sign Out' : undefined}
            className={`flex items-center gap-2.5 w-full px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl border border-red-500 transition-all text-xs font-extrabold cursor-pointer ${
              !sidebarOpen ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut size={14} className="shrink-0" />
            {sidebarOpen && (
              <span className="hidden sm:inline">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Intelligence Header Bar */}
        <header className="h-18 bg-white border-b-2 border-black px-3 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Global Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-md hidden sm:block"
          >
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
            />

            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search citizen complaints, districts, keywords..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black"
            />
          </form>

          {/* Right Intelligence Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Live Telemetry Beacon */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-brand-yellow/30 border-2 border-black rounded-xl text-xs font-extrabold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>GIS Live Telemetry</span>
            </div>

            {/* Notifications Button */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center hover:bg-brand-yellow transition-colors shadow-brutal-sm cursor-pointer"
              title="Official Alerts"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white border-2 border-black rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Official Profile Badge */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2.5 pl-2 border-l-2 border-black/20 hover:opacity-80 transition-opacity cursor-pointer text-left"
              title="Click to edit profile"
            >
              <div className="w-9 h-9 bg-brand-yellow border-2 border-black rounded-xl flex items-center justify-center font-heading font-extrabold text-sm shadow-brutal-sm">
                {initials}
              </div>

              <div className="hidden md:block leading-none text-left">
                <div className="flex items-center gap-1">
                  <p className="font-heading font-extrabold text-xs">
                    {currentUser.name}
                  </p>
                  <Edit3 size={10} className="text-black/60" />
                </div>

                <p className="text-[10px] font-bold text-black/60 uppercase tracking-wider mt-0.5">
                  {currentUser.designation ||
                    currentUser.organization ||
                    'Official Admin'}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Profile Edit Modal */}
        <GovProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onProfileUpdated={updated => setCurrentUser(updated)}
        />

        {/* Notifications Drawer */}
        <NotificationDrawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={() =>
            setNotifications(prev =>
              prev.map(n => ({ ...n, read: true }))
            )
          }
          onNotificationClick={notif => {
            setNotifications(prev =>
              prev.map(n =>
                n.id === notif.id ? { ...n, read: true } : n
              )
            );

            if (notif.link) {
              setNotificationsOpen(false);
              navigate(notif.link);
            }
          }}
        />

        {/* Dashboard Page Route Outlet */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}