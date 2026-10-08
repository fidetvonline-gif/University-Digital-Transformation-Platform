import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  CreditCard,
  FileText,
  ShieldCheck,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Building2,
  Key,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Badge, Button } from '../../components/ui/common';
import { demoUserAccounts } from '../../lib/supabase/db';

export interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNavigatePublic: (view: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onNavigatePublic,
  children,
}) => {
  const { user, profile, role, logout, loginAsDemoUser, hasPermission } = useAuth();
  const { settings, presets, loadSchoolPreset, notifications, markNotificationRead } = useUniversityData();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard, permission: '*' },
    { id: 'applications', label: 'Admissions Board', icon: GraduationCap, permission: 'view_applications' },
    { id: 'students', label: 'Student Records (SIS)', icon: Users, permission: 'view_students' },
    { id: 'staff', label: 'Staff Directory', icon: Briefcase, permission: '*' },
    { id: 'academics', label: 'Faculties & Curricula', icon: BookOpen, permission: '*' },
    { id: 'finance', label: 'Bursary & Payments', icon: CreditCard, permission: 'view_payments' },
    { id: 'cms', label: 'CMS & University News', icon: FileText, permission: '*' },
    { id: 'roles', label: 'Roles & User Access', icon: Key, permission: 'manage_settings' },
    { id: 'audit-logs', label: 'Security & Audit Logs', icon: ShieldCheck, permission: 'view_audit_logs' },
    { id: 'settings', label: 'School & Template Config', icon: Settings, permission: 'manage_settings' },
  ].filter((item) => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-[#2D3748] flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar - Professional Polish Deep Navy */}
        <aside
          className={`w-64 bg-[#002147] flex flex-col shrink-0 z-30 transition-transform duration-200 ${
            mobileNavOpen ? 'fixed inset-y-0 left-0 shadow-2xl block' : 'hidden lg:flex'
          }`}
        >
          {/* Institution Header Brand */}
          <div className="p-6 border-b border-[#003366] flex items-center justify-between">
            <div
              onClick={() => onNavigatePublic('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.short_name}
                  className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-[#D4AF37]"
                />
              ) : (
                <div
                  style={{ backgroundColor: settings.secondary_color || '#D4AF37', color: settings.primary_color || '#002147' }}
                  className="w-10 h-10 rounded flex items-center justify-center font-bold text-xl shadow-sm"
                >
                  {settings.crest_letter || settings.short_name?.[0] || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <h1 className="text-white text-xs font-bold tracking-tight uppercase leading-tight truncate">
                  {settings.short_name}
                </h1>
                <p className="text-[#D4AF37] text-[10px] font-semibold tracking-widest uppercase truncate">
                  {settings.institution_type || 'Digital Console'}
                </p>
              </div>
            </div>
            {mobileNavOpen && (
              <button
                onClick={() => setMobileNavOpen(false)}
                className="lg:hidden text-[#A0AEC0] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold text-[#A0AEC0] uppercase tracking-widest">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#003366] text-white'
                      : 'text-[#A0AEC0] hover:text-white hover:bg-[#003366]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#D4AF37]' : 'opacity-70'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </button>
              );
            })}
          </nav>

          {/* User Profile Footer in Sidebar */}
          <div className="p-4 border-t border-[#003366] bg-[#001b3a]/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#D4AF37] shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#003366] border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {profile?.first_name ? profile.first_name[0] : 'U'}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold truncate">
                    {role === 'super_admin' ? 'Super Administrator' : role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="text-[#A0AEC0] hover:text-rose-400 p-1.5 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header Bar */}
          <header className="h-16 bg-white border-b border-gray-200 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#002147]">
                  {navItems.find((n) => n.id === currentTab)?.label || 'Institutional Console'}
                </h2>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                  Session {settings.current_academic_session} • Academic Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Quick School Template Preset Switcher */}
              <div className="hidden xl:flex items-center gap-1.5 bg-[#002147]/5 border border-[#002147]/20 px-2 py-1 rounded-md">
                <Building2 className="w-3.5 h-3.5 text-[#002147]" />
                <span className="text-[11px] text-[#002147] font-bold">School:</span>
                <select
                  value={presets.find((p) => p.name === settings.university_name)?.id || ''}
                  onChange={(e) => {
                    if (e.target.value) loadSchoolPreset(e.target.value);
                  }}
                  className="bg-white text-[#002147] text-xs rounded px-2 py-0.5 border border-gray-200 font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="" disabled>Custom / {settings.short_name}</option>
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.settings.short_name} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Persona Switcher for Live Demonstration */}
              <div className="hidden md:flex items-center gap-1.5 bg-[#F4F7F9] border border-gray-200 px-2 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px] text-gray-500 font-medium">Switch Role:</span>
                <select
                  value={profile?.email || ''}
                  onChange={(e) => {
                    const selected = demoUserAccounts.find((acc) => acc.email === e.target.value);
                    if (selected) loginAsDemoUser(selected);
                  }}
                  className="bg-white text-[#002147] text-xs rounded px-2 py-0.5 border border-gray-200 font-bold focus:outline-none cursor-pointer"
                >
                  {demoUserAccounts.map((acc) => (
                    <option key={acc.email} value={acc.email}>
                      {acc.full_name} ({acc.role_display})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="gold"
                size="sm"
                onClick={() => onNavigatePublic('home')}
                rightIcon={ExternalLink}
                className="hidden sm:inline-flex"
              >
                Public Portal
              </Button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center relative text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 text-[#2D3748] animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-[#002147]">System Notifications</span>
                      <Badge variant="info">{notifications.length}</Badge>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                      {notifications.map((n, idx) => (
                        <div
                          key={`${n.id || 'notif'}-${idx}`}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2 text-xs transition-colors cursor-pointer hover:bg-gray-50 ${
                            n.read ? 'opacity-60' : 'bg-blue-50/50'
                          }`}
                        >
                          <span className="font-bold block text-[#002147]">{n.title}</span>
                          <p className="text-[11px] text-gray-500 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Dynamic Tab Body */}
          <div className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
