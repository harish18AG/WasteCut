import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import {
  LayoutDashboard,
  User,
  Users,
  LogOut,
  Bell,
  Settings,
  PlusCircle,
  History,
  MapPin,
  MessageSquare,
  ClipboardList,
  Menu,
  X,
  Camera,
  FileText,
  HeartHandshake
} from 'lucide-react';

import api from '../services/api';

export const DashboardLayout: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Profile edit states
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync edits on user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setEditAvatar(user.avatarUrl || '');
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert('Name is required');
      return;
    }
    if (editPhone && editPhone.replace(/\D/g, '').length !== 10) {
      alert('Phone number must be exactly 10 digits');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: editName,
        phone: editPhone,
        avatarUrl: editAvatar
      });
      updateUser(res.data);
      setProfileOpen(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Load and poll notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  // Sidebar items config depending on User Role
  const roleMenus = {
    ADMIN: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Manage Users', path: '/admin/users', icon: Users },
      { name: 'System Feedback', path: '/admin/feedback', icon: MessageSquare },
      { name: 'Reports & Analytics', path: '/admin/reports', icon: FileText },
    ],
    DONOR: [
      { name: 'Dashboard', path: '/donor', icon: LayoutDashboard },
      { name: 'Create Donation', path: '/donor/donate', icon: PlusCircle },
      { name: 'Donation History', path: '/donor/history', icon: History },
    ],
    NGO: [
      { name: 'Dashboard', path: '/ngo', icon: LayoutDashboard },
      { name: 'Find Food Nearby', path: '/ngo/nearby', icon: MapPin },
      { name: 'Pickup Schedules', path: '/ngo/pickups', icon: ClipboardList },
    ],
    RECIPIENT: [
      { name: 'Dashboard', path: '/recipient', icon: LayoutDashboard },
      { name: 'Browse Food', path: '/recipient/browse', icon: HeartHandshake },
      { name: 'My Requests', path: '/recipient/requests', icon: ClipboardList },
    ],
  };

  const menuItems = roleMenus[user.role] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-45 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 px-6 border-b border-gray-50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              🌱 WasteCut
            </span>
          </Link>
          <button
            className="lg:hidden p-1 text-gray-500 hover:text-gray-900 rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-gray-50">
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover border border-gray-100 shadow-sm" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-gray-800 truncate">{user.name}</h4>
              <span className="inline-block text-[10px] font-bold text-primary-dark px-2 py-0.5 bg-primary/10 rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-md"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {user.role.toLowerCase()} Dashboard
            </h2>
          </div>

          {/* Right Header Operations */}
          <div className="flex items-center gap-4">
            {/* Notifications Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotiOpen(!notiOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full relative transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-accent text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Popover */}
              {notiOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotiOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-premium border border-gray-100 z-50 py-2">
                    <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-800">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              setNotiOpen(false);
                            }}
                            className={`p-3 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 ${
                              !n.isRead ? 'bg-primary-light/40 border-l-2 border-l-primary' : ''
                            }`}
                          >
                            <h5 className="font-semibold text-xs text-gray-800">{n.title}</h5>
                            <p className="text-[11px] text-gray-500 mt-1">{n.message}</p>
                            <span className="text-[9px] text-gray-400 block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar Widget */}
            <div
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full object-cover border border-gray-100 shadow-sm" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Page Content viewport */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Edit Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-premium border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">Edit Profile Settings</h3>
              <button onClick={() => setProfileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                {editAvatar ? (
                  <img src={editAvatar} alt="Profile" className="h-20 w-20 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-extrabold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark shadow-md transition-all">
                  <Camera size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Change Profile Photo</span>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Name / Organization Name
                </label>
                <input
                  id="editName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label htmlFor="editPhone" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Phone Number
                </label>
                <input
                  id="editPhone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  placeholder="10 digit number"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50">
              <button
                onClick={() => setProfileOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all flex items-center justify-center"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardLayout;
