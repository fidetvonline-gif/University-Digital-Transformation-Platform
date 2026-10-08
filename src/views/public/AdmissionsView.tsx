import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  Download,
  Printer,
  Award,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MailCheck,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Button, Card, Badge } from '../../components/ui/common';
import { formatNaira } from '../../lib/utils';
import { Application } from '../../types/database';

export const AdmissionsView: React.FC<{ onNavigate: (view: string, params?: any) => void }> = ({
  onNavigate,
}) => {
  const { settings, programmes } = useUniversityData();

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">{settings.current_academic_session} Admissions</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Undergraduate Admissions & Screening
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Welcome to the official admissions portal of {settings.university_name}.
            Review general entry requirements, application milestones, and proceed with online screening.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-amber-50/60 border border-amber-200 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Step 1</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Start New Application</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Fill out the bio-data, academic records (JAMB & O'Level), and submit application documents online.
              </p>
            </div>
            <Button variant="gold" size="sm" onClick={() => onNavigate('apply')}>
              Apply for 2026/2027 →
            </Button>
          </Card>

          <Card className="p-6 bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 2</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Check Admission Status</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Already applied? Track screening progress or download your official provisional admission offer letter.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate('admission-status')}>
              Check Status Now →
            </Button>
          </Card>

          <Card className="p-6 bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 3</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Accept Offer & Pay Fees</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Admitted candidates can instantly accept admission, pay acceptance & tuition fees, and get a Matric Number.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => onNavigate('admission-status')}>
              Accept Offer →
            </Button>
          </Card>
        </div>

        {/* General Requirements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
          <h2 className="text-xl font-bold text-[#0F2137]">General Entry Guidelines (UTME & DE)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-600">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                UTME Candidates (100 Level Entry)
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Candidate must have scored at least <strong>160</strong> in the 2026 UTME.</li>
                <li>Candidate must possess at least 5 credit passes at SSCE/WAEC/NECO/NABTEB in not more than 2 sittings.</li>
                <li>Compulsory credits: English Language, Mathematics, and three subjects relevant to chosen degree.</li>
                <li>Candidate must have chosen {settings.short_name} as First Choice or processed Change of Institution on JAMB CAPS.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Direct Entry Candidates (200 Level Entry)
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>National Diploma (ND) with minimum of <strong>Upper Credit</strong> in relevant field from an accredited polytechnic.</li>
                <li>Higher National Diploma (HND) with Lower Credit for advanced placement.</li>
                <li>IJMB / JUPEB passes with a minimum of 9 points across 3 relevant subjects.</li>
                <li>Standard 5 O'Level credit passes including English Language and Mathematics.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Screening Schedule & Cut-Off Points */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2137]">2026/2027 Admissions Timetable</h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Admissions Activity</th>
                  <th className="p-3">Target Candidates</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Deadline</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Phase 1 Online Post-UTME Registration</td>
                  <td className="p-3">UTME First Choice Candidates</td>
                  <td className="p-3">1st July 2026</td>
                  <td className="p-3">30th August 2026</td>
                  <td className="p-3"><Badge variant="success">Active</Badge></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Direct Entry Screening & Credential Verification</td>
                  <td className="p-3">ND, HND, IJMB & JUPEB Holders</td>
                  <td className="p-3">15th July 2026</td>
                  <td className="p-3">15th September 2026</td>
                  <td className="p-3"><Badge variant="success">Active</Badge></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">First Batch Provisional Admission List Release</td>
                  <td className="p-3">Qualified Screening Applicants</td>
                  <td className="p-3">5th September 2026</td>
                  <td className="p-3">Continuous</td>
                  <td className="p-3"><Badge variant="warning">Upcoming</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdmissionStatusView: React.FC<{ onNavigate: (view: string, params?: any) => void }> = ({
  onNavigate,
}) => {
  const { applications, settings, admitApplicantAndCreateStudent } = useUniversityData();
  const [searchTerm, setSearchTerm] = useState('');
  const [matchedApp, setMatchedApp] = useState<Application | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [matricSuccess, setMatricSuccess] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = (searchTerm || '').trim().toLowerCase();
    if (!term) return;

    const found = applications.find(
      (a) =>
        a &&
        ((a.application_number && a.application_number.toLowerCase() === term) ||
          (a.jamb_reg_number && a.jamb_reg_number.toLowerCase() === term) ||
          (a.applicant?.email && a.applicant.email.toLowerCase() === term))
    );

    setMatchedApp(found || null);
    setHasSearched(true);
    setMatricSuccess(null);
  };

  const handleAcceptAdmission = () => {
    if (!matchedApp) return;
    const res = admitApplicantAndCreateStudent(matchedApp.id);
    if (res.success && res.student) {
      setMatricSuccess(res.student.student_number);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">Official Verification Portal</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Check Provisional Admission Status
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Enter your JAMB Registration Number (e.g. <code className="text-amber-300">202610293847AB</code>) or
            University Application Number (e.g. <code className="text-amber-300">PFUST/APP/2026/00142</code>) to verify your screening status.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Search Box */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              JAMB Reg Number / Application Number / Registered Email
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. 202610293847AB or PFUST/APP/2026/00142"
                required
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2137] focus:bg-white"
              />
              <Button type="submit" variant="primary" size="md" leftIcon={Search}>
                Verify Status
              </Button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            <strong>Hint for testing:</strong> Try entering <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">202610293847AB</code> (Admitted), <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">202658493021CD</code> (Under Review), or <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">PFUST/APP/2026/00142</code>.
          </div>
        </form>

        {/* Search Result Display */}
        {hasSearched && matchedApp && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg animate-in fade-in duration-200">
            {/* Status Header Banner */}
            <div
              className={`p-6 text-white ${
                matchedApp.status === 'admitted'
                  ? 'bg-emerald-800'
                  : matchedApp.status === 'rejected'
                  ? 'bg-rose-800'
                  : 'bg-[#0F2137]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
                    Screening Status
                  </span>
                  <h2 className="text-2xl font-bold mt-0.5">
                    {matchedApp.status === 'admitted'
                      ? '🎉 CONGRATULATIONS: PROVISIONAL ADMISSION OFFERED'
                      : matchedApp.status === 'under_review'
                      ? 'APPLICATION CURRENTLY UNDER COMMITTEE REVIEW'
                      : matchedApp.status === 'rejected'
                      ? 'ADMISSION APPLICATION UNSUCCESSFUL'
                      : 'APPLICATION SUBMITTED & PENDING SCREENING'}
                  </h2>
                </div>
                <Badge
                  variant={
                    matchedApp.status === 'admitted'
                      ? 'success'
                      : matchedApp.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                  }
                  className="text-xs py-1 px-3"
                >
                  {matchedApp.status.toUpperCase().replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Applicant Details */}
            <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Applicant Name</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {matchedApp.applicant?.first_name} {matchedApp.applicant?.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Application Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{matchedApp.application_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">JAMB Reg Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{matchedApp.jamb_reg_number || 'DE / Direct'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Offered Degree Programme</span>
                  <span className="font-bold text-[#0F2137] text-sm">
                    {matchedApp.programme?.name} ({matchedApp.programme?.degree_type})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Academic Session</span>
                  <span className="font-bold text-slate-900 text-sm">{settings.current_academic_session}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Screening Score</span>
                  <span className="font-bold text-emerald-700 text-sm">{matchedApp.jamb_score ? `${matchedApp.jamb_score} / 400` : 'Evaluated'}</span>
                </div>
              </div>

              {/* Admitted Special Offer Section */}
              {matchedApp.status === 'admitted' && (
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">
                        Provisional Admission Terms & Conditions
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        You have been offered provisional admission into {settings.university_name} for the {settings.current_academic_session} session.
                        Please accept this offer below to generate your official Matriculation Number and access the Student Portal.
                      </p>
                    </div>
                  </div>

                  {matricSuccess ? (
                    <div className="p-5 bg-white rounded-xl border border-emerald-300 text-center space-y-3 shadow-xs">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <div>
                        <h4 className="text-base font-black text-slate-900">Admission Formally Accepted!</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Your official University Matriculation Number has been generated:
                        </p>
                      </div>

                      <div className="text-2xl font-mono font-black text-emerald-800 bg-emerald-50 border-2 border-emerald-300 py-2.5 px-6 rounded-xl inline-block shadow-inner">
                        {matricSuccess}
                      </div>

                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg max-w-md mx-auto flex items-center justify-center gap-2 text-xs text-emerald-900">
                        <MailCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Official matriculation notice & portal credentials sent to:{' '}
                          <strong className="font-mono text-emerald-950">{matchedApp.applicant?.email}</strong>
                        </span>
                      </div>

                      <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
                        <Button
                          variant="gold"
                          size="md"
                          onClick={() => onNavigate('student-portal')}
                        >
                          Access Student Portal Now →
                        </Button>
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => window.print()}
                          leftIcon={Printer}
                        >
                          Print Matriculation Slip
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleAcceptAdmission}
                        leftIcon={CheckCircle2}
                      >
                        Accept Offer & Generate Matric No
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => window.print()}
                        leftIcon={Printer}
                      >
                        Print Admission Slip
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Under Review Notice */}
              {matchedApp.status === 'under_review' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                  <h4 className="font-bold">Credential Verification Ongoing</h4>
                  <p className="leading-relaxed">
                    Your O'Level verification and JAMB score validation are currently being processed by the University Admissions Board.
                    Check back within 48 hours for list updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {hasSearched && !matchedApp && (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Admission Record Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We could not find an application or admission record matching "{searchTerm}". Please verify your registration number or start a fresh application.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={() => onNavigate('apply')}>
                Start Fresh Application
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
