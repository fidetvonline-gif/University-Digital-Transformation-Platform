import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Building2,
  Users,
  Award,
  ArrowRight,
  Calendar,
  FileText,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Globe,
  Sparkles,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Button, Card, Badge } from '../../components/ui/common';
import { formatNaira } from '../../lib/utils';

export interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { settings, faculties, programmes, news, events, announcements, faqs } = useUniversityData();
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const activeAnnouncements = announcements.filter((a) => a.is_active);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Breaking Announcement Bar */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-[#D4AF37] text-[#002147] px-4 py-2 text-xs font-bold">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="bg-[#002147] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Official Bulletin
              </span>
              <span className="truncate">{activeAnnouncements[0].message}</span>
            </div>
            {activeAnnouncements[0].link_url && (
              <button
                onClick={() => onNavigate('admissions')}
                className="underline hover:text-black shrink-0 cursor-pointer font-bold"
              >
                Read More →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Hero Section: Institutional, Trustworthy, Modern */}
      <section className="relative bg-[#002147] text-white pt-16 pb-20 px-4 sm:px-8 overflow-hidden">
        {/* Subtle geometric background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border-[32px] border-[#D4AF37]" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full border-[24px] border-slate-400" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#003366]/80 border border-[#003366] text-xs text-[#D4AF37]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{settings.accreditation_body || 'NUC Approved Federal Institution'}</span>
                <span className="text-slate-500">•</span>
                <span>{settings.current_academic_session} Admissions {settings.admissions_open !== false ? 'Ongoing' : 'Closed'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {settings.motto ? (
                  <>
                    <span className="text-[#D4AF37]">{settings.motto}</span> — Shaping Global Pioneers.
                  </>
                ) : (
                  <>
                    Pioneering <span className="text-[#D4AF37]">Science & Technology</span> for National Transformation.
                  </>
                )}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Welcome to {settings.university_name} ({settings.short_name}). {settings.meta_description || 'We prepare future engineers, innovators, scholars, and leaders through cutting-edge curricula, industry linkages, and digitalized campus infrastructure.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => onNavigate('apply')}
                  rightIcon={ArrowRight}
                >
                  Apply for Admission
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('admission-status')}
                  className="text-white bg-white/10 hover:bg-white/20 border-white/30"
                >
                  Check Admission Status
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => onNavigate('programmes')}
                  className="text-[#D4AF37] hover:text-white hover:bg-[#003366]"
                >
                  Explore {programmes.length} Programmes →
                </Button>
              </div>

              {/* Institutional Stats Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#003366]">
                <div>
                  <div className="text-2xl font-bold text-[#D4AF37]">{faculties.length}</div>
                  <div className="text-xs text-[#A0AEC0] uppercase tracking-wider font-semibold">Accredited Faculties</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#D4AF37]">{programmes.length}+</div>
                  <div className="text-xs text-[#A0AEC0] uppercase tracking-wider font-semibold">Degree Programmes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">100%</div>
                  <div className="text-xs text-[#A0AEC0] uppercase tracking-wider font-semibold">Digital Automated Campus</div>
                </div>
              </div>
            </div>

            {/* Hero Right: Quick Portal & Admission Action Card */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-lg p-6 sm:p-8 shadow-xl border border-gray-200 relative">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#002147] text-[#D4AF37] flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#002147]">Admissions {settings.current_academic_session}</h2>
                      <p className="text-[11px] text-gray-500">UTME & Direct Entry Portal</p>
                    </div>
                  </div>
                  <Badge variant={settings.admissions_open !== false ? 'success' : 'danger'}>
                    {settings.admissions_open !== false ? 'Open' : 'Closed'}
                  </Badge>
                </div>

                <div className="space-y-4 py-4 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-[#F4F7F9] rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#002147]">Minimum Cut-Off Score:</span>
                      <p className="text-gray-600">JAMB Score of {settings.minimum_cut_off_score || 160} and above for all undergraduate courses.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#F4F7F9] rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#002147]">O'Level Requirements:</span>
                      <p className="text-gray-600">5 Credit passes in WAEC/NECO/NABTEB including English & Maths.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#F4F7F9] rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#002147]">Application Fee:</span>
                      <p className="text-gray-600">{settings.currency_symbol || '₦'}{settings.application_fee_ngn.toLocaleString()} via official automated payment gateway.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full justify-center"
                    onClick={() => onNavigate('apply')}
                  >
                    Start Fresh Application
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center text-xs"
                    onClick={() => onOpenAuthModal?.('login')}
                  >
                    Continue Existing Application / Portal Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Leadership / Vice-Chancellor's Message Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#F4F7F9] rounded-lg border border-gray-200 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              {settings.head_photo_url ? (
                <img
                  src={settings.head_photo_url}
                  alt={settings.head_name || settings.vice_chancellor}
                  className="w-36 h-36 rounded-md object-cover border-2 border-white shadow-sm mb-4"
                />
              ) : (
                <div className="w-36 h-36 rounded-md bg-[#002147] text-[#D4AF37] flex items-center justify-center text-4xl font-bold shadow-sm border-2 border-white mb-4">
                  {settings.crest_letter || 'VC'}
                </div>
              )}
              <h2 className="text-base font-bold text-[#002147]">
                {settings.head_name || settings.vice_chancellor}
              </h2>
              <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
                {settings.head_title || 'Vice-Chancellor'}
              </p>
              <p className="text-[11px] text-gray-500">
                {settings.head_qualification || 'B.Eng, M.Sc, Ph.D, FNSE, FAEng'}
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                Leadership & Vision
              </div>
              <h2 className="text-2xl font-bold text-[#002147] tracking-tight">
                "Building an Institution of Global Academic Eminence and Technological Innovation"
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {settings.head_message ||
                  `On behalf of the Governing Council and Senate, I welcome you to ${settings.university_name}. Our institution was conceived with a clear mandate: to redefine tertiary education by infusing rigorous pedagogy with hands-on technological innovation.`}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                With our modern laboratories, automated cloud ecosystem, accredited faculties, and seasoned faculty, we guarantee our students a learning journey that transforms ideas into tangible solutions.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('management')}
                >
                  Meet Principal Officers →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Faculties & Degree Programmes Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              Academic Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#002147] tracking-tight mt-1">
              Explore Our Accredited Faculties
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-1">
              All undergraduate programmes are fully accredited by the National Universities Commission (NUC)
              and relevant professional bodies (COREN, CPN, ICAN).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('programmes')}
            rightIcon={ArrowRight}
          >
            View All 15 Programmes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {faculties.map((fac) => {
            const facultyProgrammes = programmes.filter((p) => p.faculty_id === fac.id);
            return (
              <div
                key={fac.id}
                onClick={() => onNavigate('faculties', { facultyId: fac.id })}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-[#002147] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-[#002147] bg-blue-50 px-2.5 py-1 rounded border border-blue-200 uppercase">
                      {fac.code}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {facultyProgrammes.length} Programmes
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#002147] group-hover:text-[#D4AF37] transition-colors mb-2">
                    {fac.name}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 mb-4">
                    {fac.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#002147]">
                  <span>Dean: {fac.dean_name.split(' ')[0]} {fac.dean_name.split(' ')[1]}</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Modern Digital Transformation & Microsoft 365 Cloud Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#002147] text-white rounded-lg p-8 lg:p-12 relative overflow-hidden shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#003366] border border-[#003366] text-xs text-[#D4AF37]">
                <Laptop className="w-4 h-4" />
                <span className="font-bold">Enterprise Academic Cloud Integration</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Empowered by Modern Digital Infrastructure & Microsoft 365
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Every admitted student and staff member receives a verified <code className="text-[#D4AF37]">@pfust.edu.ng</code> institutional identity,
                granting free access to Microsoft Teams virtual classrooms, 1TB OneDrive cloud storage, official student email, and digital transcript verification.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Matric Number Issuance</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Automated Bursary Clearance</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Online Course Registration</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-[#001834] p-6 rounded-lg border border-[#003366] text-center space-y-3 w-full max-w-xs">
                <div className="w-10 h-10 rounded bg-[#D4AF37] text-[#002147] mx-auto flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Student Self-Service</h4>
                <p className="text-xs text-slate-300">
                  Access fees receipt, admission letters, course registration and grades.
                </p>
                <Button
                  variant="gold"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => onOpenAuthModal?.('login')}
                >
                  Log In to Student Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. News & University Bulletins */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Campus News & Media
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2137] tracking-tight mt-1">
              Latest University Updates
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('news')}
            rightIcon={ArrowRight}
          >
            Browse News Archive
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.slice(0, 3).map((article) => (
            <div
              key={article.id}
              onClick={() => onNavigate('news', { articleId: article.id })}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col"
            >
              <div className="h-44 bg-slate-800 relative overflow-hidden flex items-center justify-center text-slate-500">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-slate-600" />
                )}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0F2137] text-white px-2.5 py-1 rounded">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#0F2137]">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mt-2">
                    {article.summary}
                  </p>
                </div>

                <span className="text-xs font-semibold text-[#0F2137] flex items-center gap-1">
                  Read Full Gazette →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Upcoming Academic Calendar Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Important Dates
            </span>
            <h2 className="text-2xl font-extrabold text-[#0F2137] tracking-tight mt-1">
              Events & Academic Timetable
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex items-start gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-[#0F2137] text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-xs uppercase font-bold text-amber-400">
                  {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-lg font-extrabold leading-none">
                  {new Date(event.event_date).getDate()}
                </span>
              </div>

              <div className="space-y-1">
                <Badge variant="neutral" className="text-[10px]">
                  {event.category}
                </Badge>
                <h3 className="text-xs font-bold text-slate-900">{event.title}</h3>
                <p className="text-[11px] text-slate-500">{event.location}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2 pt-1">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Admissions & Student Help
          </span>
          <h2 className="text-2xl font-extrabold text-[#0F2137] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Find immediate answers to common questions about admissions, fees, and accommodation.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {faqs.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div key={faq.id} className="p-4">
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-slate-900 hover:text-[#0F2137] cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-90 text-[#0F2137]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-100 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
