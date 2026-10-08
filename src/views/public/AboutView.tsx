import React from 'react';
import {
  GraduationCap,
  Award,
  Target,
  Eye,
  ShieldCheck,
  Building,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Button, Card, Badge } from '../../components/ui/common';

export const AboutView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { settings } = useUniversityData();

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">Institutional Profile</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About {settings.short_name}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {settings.university_name} is a premier Federal institution dedicated to academic
            rigor, research innovation, and producing graduates who can lead Nigeria's technological
            and socio-economic evolution.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Mission, Vision & Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-4 border-t-amber-500 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F2137]">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To be an internationally recognized center of excellence in science, technology, and applied
              sciences, producing visionary leaders and innovative solutions for sustainable national development.
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-t-[#0F2137] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#0F2137] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F2137]">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To provide high-quality, student-centered education through innovative teaching, cutting-edge
              applied research, and strategic industry partnerships that foster entrepreneurship and societal progress.
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-t-emerald-600 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F2137]">Core Values (PRIDE)</h3>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li>• <strong>P</strong>rofessional Integrity & Discipline</li>
              <li>• <strong>R</strong>esearch & Technological Innovation</li>
              <li>• <strong>I</strong>nclusivity & Global Competitiveness</li>
              <li>• <strong>D</strong>iligence & Academic Rigor</li>
              <li>• <strong>E</strong>xcellence in Community Impact</li>
            </ul>
          </Card>
        </div>

        {/* History & Establishment */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-[#0F2137]">Establishment & Statutory Foundation</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {settings.university_name} was established by the Federal Government of Nigeria under the
            Federal Universities Act to address the critical deficit in high-caliber STEM human capital.
            Situated in {settings.state_country}, our purpose-built campus features state-of-the-art
            laboratories, digital libraries, specialized computing hubs, and modern lecture theaters.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The University operates in full compliance with National Universities Commission (NUC) benchmarks
            and Core Curriculum Minimum Academic Standards (CCMAS), ensuring all graduates are equipped for
            both global graduate research and competitive corporate careers.
          </p>
        </div>

        {/* Campus Facilities */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#0F2137]">Campus Infrastructure & Facilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'High-Tech Computing Hub',
                desc: 'Over 500 high-performance workstations with gigabit fiber backbone for AI, coding, and simulations.',
              },
              {
                title: 'University E-Library',
                desc: 'Access to over 150,000 physical volumes and 50+ million e-journals through IEEE, ScienceDirect, and JSTOR.',
              },
              {
                title: 'Engineering Workshops',
                desc: 'Equipped with CNC machinery, 3D additive manufacturing stations, and automation testbeds.',
              },
              {
                title: 'Smart Classrooms',
                desc: 'Every lecture hall is equipped with digital interactive podiums and hybrid streaming capabilities.',
              },
            ].map((fac, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#0F2137] flex items-center justify-center font-bold text-xs">
                  0{i + 1}
                </div>
                <h4 className="text-xs font-bold text-slate-900">{fac.title}</h4>
                <p className="text-[11px] text-slate-500">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 bg-[#0F2137] text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold">Ready to Join Our Academic Community?</h3>
            <p className="text-xs text-slate-300">
              Applications are currently open for the 2026/2027 Academic Session.
            </p>
          </div>
          <Button variant="gold" size="sm" onClick={() => onNavigate('apply')}>
            Apply for Admission Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ManagementView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const principalOfficers = [
    {
      title: 'Pro-Chancellor & Chairman of Council',
      name: 'Sen. (Dr.) Aliyu Mohammed Kabir, CON',
      qualifications: 'B.Sc, M.Sc, Ph.D, mni',
      office: 'Office of the Governing Council',
      desc: 'Leads the highest policy-making organ of the University, ensuring sound governance, fiscal integrity, and strategic expansion.',
    },
    {
      title: 'Vice-Chancellor',
      name: 'Prof. Abubakar S. Dikko',
      qualifications: 'B.Eng, M.Sc, Ph.D, FNSE, FAEng',
      office: 'Office of the Vice-Chancellor',
      desc: 'Chief Executive and Academic Officer responsible for the day-to-day administration, academic standards, and external relations.',
    },
    {
      title: 'Deputy Vice-Chancellor (Academic)',
      name: 'Prof. Florence O. Adeleke',
      qualifications: 'B.Sc, M.Sc, Ph.D, FCPN',
      office: 'Academic Affairs Directorate',
      desc: 'Oversees curricula innovation, accreditation, examinations, research grants, and admissions governance.',
    },
    {
      title: 'Deputy Vice-Chancellor (Administration)',
      name: 'Prof. Mustapha Bello',
      qualifications: 'B.Sc, MPA, Ph.D, FCIA',
      office: 'Administrative Affairs',
      desc: 'Manages physical infrastructure, estate development, campus security, and general administrative services.',
    },
    {
      title: 'Registrar & Secretary to Council',
      name: 'Barr. Aisha Mohammed Sani',
      qualifications: 'LL.B, B.L, LL.M, FCIS',
      office: 'University Registry',
      desc: 'Chief Administrative Officer in charge of student records, Council and Senate secretariats, admissions issuance, and legal affairs.',
    },
    {
      title: 'Bursar & Chief Financial Officer',
      name: 'Dr. Chinedu Ezeh, FCA',
      qualifications: 'B.Sc, M.Sc, Ph.D, FCA, FCTI',
      office: 'University Bursary',
      desc: 'Responsible for university financial operations, treasury management, automated fees collection, and statutory audits.',
    },
    {
      title: 'University Librarian',
      name: 'Dr. (Mrs.) Halima Umar',
      qualifications: 'B.A. (LS), MLS, Ph.D, CLN',
      office: 'University Library System',
      desc: 'Oversees digital resource subscriptions, institutional repository, physical libraries, and open-access research archives.',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">University Governance</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Principal Officers & Executive Management
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Meet the experienced academic and administrative leaders steering the university towards
            technological brilliance, ethical scholarship, and global reputation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principalOfficers.map((officer, idx) => (
            <Card key={idx} className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#0F2137] text-amber-400 font-serif font-bold text-xl flex items-center justify-center border-2 border-amber-400/20">
                  {officer.name.split(' ')[1]?.[0] || 'O'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {officer.title}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{officer.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{officer.qualifications}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{officer.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                {officer.office}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
