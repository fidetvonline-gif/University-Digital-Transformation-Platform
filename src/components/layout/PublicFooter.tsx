import React from 'react';
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Globe,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';

export interface PublicFooterProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { settings, faculties } = useUniversityData();

  return (
    <footer className="bg-[#002147] text-slate-300 border-t border-[#003366]">
      {/* Upper Footer: Institutional Info & Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: University Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.short_name}
                  className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-[#D4AF37] shadow-xs"
                />
              ) : (
                <div
                  style={{ backgroundColor: settings.secondary_color || '#D4AF37', color: settings.primary_color || '#002147' }}
                  className="w-10 h-10 rounded flex items-center justify-center font-bold text-xl shadow-xs"
                >
                  {settings.crest_letter || settings.short_name?.[0] || 'U'}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{settings.short_name}</h3>
                <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">{settings.university_name}</p>
              </div>
            </div>

            <p className="text-xs text-[#A0AEC0] leading-relaxed pr-4">
              {settings.meta_description}
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.state_country}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{settings.contact_email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{settings.contact_phone}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#003366]/60 border border-[#003366] text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>{settings.accreditation_body || 'Accredited by National Regulatory Body'}</span>
            </div>
          </div>

          {/* Col 2: Academics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Academics</h4>
            <ul className="space-y-2 text-xs">
              {faculties.slice(0, 5).map((fac) => (
                <li key={fac.id}>
                  <button
                    onClick={() => onNavigate('faculties', { facultyId: fac.id })}
                    className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                    <span className="truncate">{fac.name}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('programmes')}
                  className="text-[#D4AF37] hover:underline transition-colors font-semibold cursor-pointer"
                >
                  All Academic Programmes →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Admissions & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Portals & Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('application-form')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>Fresh Admissions Application</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('check-status')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>Check Admission Status</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('student-portal')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>Student Portal Login</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('staff-portal')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>Staff & Registry Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('downloads')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>Academic Calendar & Forms</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: University Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Governance</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>History & Vision</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('management')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>Vice-Chancellor's Office</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>Official Gazette & Bulletins</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 group text-[#A0AEC0] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#003366] group-hover:text-[#D4AF37]" />
                  <span>Admissions & Registry Helpdesk</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lower Footer: Copyright & Legal */}
      <div className="border-t border-[#003366] bg-[#001834] py-4 px-4 sm:px-8 text-[11px] text-[#A0AEC0]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} {settings.university_name} ({settings.short_name}). All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">ICT Directorate</span>
            <span>•</span>
            <span className="text-[#D4AF37] font-semibold">NUC System Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
