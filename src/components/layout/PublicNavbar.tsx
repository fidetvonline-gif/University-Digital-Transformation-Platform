import React, { useState } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  Search,
  LogIn,
  ChevronDown,
  ShieldCheck,
  Building,
  BookOpen,
  Calendar,
  FileText,
  Phone,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../ui/common';

export interface PublicNavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAuthModal,
  onOpenAuth,
}) => {
  const { settings, faculties } = useUniversityData();
  const { user, profile, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [facultiesOpen, setFacultiesOpen] = useState(false);

  const handleOpenAuth = (mode?: 'login' | 'register') => {
    if (onOpenAuthModal) {
      onOpenAuthModal(mode);
    } else if (onOpenAuth) {
      onOpenAuth(mode);
    }
  };

  const getPortalRoute = () => {
    if (!role) return 'login';
    if (role === 'super_admin' || role === 'admissions_officer' || role === 'bursar' || role === 'registrar' || role === 'ict_admin') {
      return 'admin';
    }
    if (role === 'student') return 'student-portal';
    if (role === 'staff') return 'staff-portal';
    return 'applicant-portal';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Institutional Bar */}
      <div className="bg-[#002147] text-slate-200 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 divide-x divide-[#003366]">
            <span className="hidden sm:inline font-medium text-[#D4AF37]">
              {settings.current_academic_session} Academic Session
            </span>
            <span className="hidden md:inline pl-4 text-slate-300">
              Motto: <em className="text-white">"{settings.motto}"</em>
            </span>
            <span className="pl-4 flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Admissions 2026/2027 Open
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors text-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search Portal</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-[#003366]">
                <span className="text-[#D4AF37] font-semibold text-[11px] uppercase tracking-wider">
                  {role?.replace('_', ' ')}
                </span>
                <button
                  onClick={() => onNavigate(getPortalRoute())}
                  className="bg-[#D4AF37] text-[#002147] hover:bg-[#C49F27] px-2.5 py-0.5 rounded font-bold text-xs transition-colors cursor-pointer"
                >
                  My Portal
                </button>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenAuth('login')}
                className="flex items-center gap-1 text-[#D4AF37] hover:text-amber-200 font-semibold text-xs pl-3 border-l border-[#003366] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Logo & University Identity */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.short_name}
              className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-[#D4AF37] shadow-xs group-hover:scale-105 transition-transform"
            />
          ) : (
            <div
              style={{ backgroundColor: settings.primary_color || '#002147', color: settings.secondary_color || '#D4AF37' }}
              className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-xl shadow-xs group-hover:scale-105 transition-transform"
            >
              {settings.crest_letter || settings.short_name?.[0] || 'U'}
            </div>
          )}
          <div>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-[#002147] leading-tight flex items-center gap-1.5">
              <span>{settings.short_name}</span>
              <span className="text-[11px] font-normal text-gray-500 hidden lg:inline border-l border-gray-300 pl-2">
                {settings.institution_type || 'Tertiary Institution'}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 font-medium hidden sm:block max-w-sm truncate">
              {settings.university_name}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#2D3748]">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-[#002147] transition-colors cursor-pointer ${
              currentView === 'home' ? 'text-[#002147] font-bold border-b-2 border-[#002147] pb-1' : ''
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`hover:text-[#002147] transition-colors cursor-pointer ${
              currentView === 'about' ? 'text-[#002147] font-bold border-b-2 border-[#002147] pb-1' : ''
            }`}
          >
            About
          </button>

          <button
            onClick={() => onNavigate('management')}
            className={`hover:text-[#002147] transition-colors cursor-pointer ${
              currentView === 'management' ? 'text-[#002147] font-bold border-b-2 border-[#002147] pb-1' : ''
            }`}
          >
            Management
          </button>

          {/* Faculties Dropdown */}
          <div className="relative group">
            <button
              onClick={() => onNavigate('faculties')}
              className={`flex items-center gap-1 hover:text-[#002147] transition-colors cursor-pointer ${
                currentView === 'faculties' || currentView === 'departments' || currentView === 'programmes'
                  ? 'text-[#002147] font-bold'
                  : ''
              }`}
            >
              <span>Academics</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in normal-case tracking-normal">
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Faculties & Programmes
              </div>
              {faculties.map((fac) => (
                <button
                  key={fac.id}
                  onClick={() => onNavigate('faculties', { facultyId: fac.id })}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-[#F4F7F9] hover:text-[#002147] rounded-md transition-colors flex items-center justify-between"
                >
                  <span className="truncate font-medium">{fac.name}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {fac.code}
                  </span>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => onNavigate('programmes')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#002147] hover:bg-[#F4F7F9] rounded-md"
                >
                  View All 15 Degree Programmes →
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('admissions')}
            className={`hover:text-[#002147] transition-colors cursor-pointer ${
              currentView === 'admissions' ? 'text-[#002147] font-bold border-b-2 border-[#002147] pb-1' : ''
            }`}
          >
            Admissions
          </button>

          <button
            onClick={() => onNavigate('news')}
            className={`hover:text-[#002147] transition-colors cursor-pointer ${
              currentView === 'news' ? 'text-[#002147] font-bold border-b-2 border-[#002147] pb-1' : ''
            }`}
          >
            News & Events
          </button>

          <button
            onClick={() => onNavigate('downloads')}
            className={`hover:text-[#002147] transition-colors cursor-pointer ${
              currentView === 'downloads' ? 'text-[#002147] font-bold border-b-2 border-[#002147] pb-1' : ''
            }`}
          >
            Downloads
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className={`hover:text-[#002147] transition-colors cursor-pointer ${
              currentView === 'contact' ? 'text-[#002147] font-bold border-b-2 border-[#002147] pb-1' : ''
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('admission-status')}
          >
            Check Status
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => onNavigate('apply')}
          >
            Apply for Admission
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#002147]" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('apply');
              }}
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admission-status');
              }}
            >
              Check Status
            </Button>
          </div>

          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('home');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('about');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              About the University
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('management');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Principal Officers & Management
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('faculties');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Faculties & Departments
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('programmes');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Academic Programmes
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admissions');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Admissions Portal
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('news');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              News & Announcements
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('downloads');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Downloads & Forms
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('contact');
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Contact University
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <Button
                variant="gold"
                size="md"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(getPortalRoute());
                }}
              >
                Go to My Portal ({role?.replace('_', ' ')})
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenAuth('login');
                }}
                leftIcon={LogIn}
              >
                Portal Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
