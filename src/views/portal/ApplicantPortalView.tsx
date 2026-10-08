import React, { useState } from 'react';
import {
  GraduationCap,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Button, Card, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { formatNaira } from '../../lib/utils';
import { Application } from '../../types/database';

export interface ApplicantPortalViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ApplicantPortalView: React.FC<ApplicantPortalViewProps> = ({ onNavigate }) => {
  const { user, profile, role } = useAuth();
  const {
    applications,
    invoices,
    payments,
    settings,
    createInvoice,
    processPayment,
    admitApplicantAndCreateStudent,
  } = useUniversityData();

  // Find applicant's application or fallback to first one for demo
  const applicantApp =
    applications.find(
      (a) => a.applicant?.email === profile?.email || a.applicant_id === profile?.id
    ) || applications[0];

  const [activeTab, setActiveTab] = useState<'status' | 'letter' | 'acceptance' | 'biodata'>('status');
  const [isPayingAcceptance, setIsPayingAcceptance] = useState(false);
  const [acceptancePaid, setAcceptancePaid] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'paystack' | 'remita'>('paystack');

  const isAdmitted = applicantApp?.status === 'admitted';

  const handlePayAcceptanceFee = async () => {
    if (!applicantApp) return;
    setIsPayingAcceptance(true);

    try {
      const inv = createInvoice({
        title: `2026/2027 Provisional Admission Acceptance Fee (${applicantApp.application_number})`,
        fee_type: 'acceptance_fee',
        amount_ngn: 20000,
        currency: 'NGN',
        academic_session: '2026/2027',
        application_id: applicantApp.id,
        payer_id: applicantApp.applicant_id,
        payer_name: `${applicantApp.applicant?.first_name} ${applicantApp.applicant?.last_name}`,
        payer_email: applicantApp.applicant?.email || 'applicant@gmail.com',
      });

      processPayment(inv.id, paymentProvider, {
        name: `${applicantApp.applicant?.first_name} ${applicantApp.applicant?.last_name}`,
        email: applicantApp.applicant?.email || 'applicant@gmail.com',
        channel: 'card',
      });

      setAcceptancePaid(true);
    } finally {
      setIsPayingAcceptance(false);
    }
  };

  if (!applicantApp) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0F2137]">No Active Application Found</h2>
        <p className="text-xs text-slate-500">
          You have not submitted a Post-UTME screening application for the {settings.current_academic_session} academic session.
        </p>
        <Button variant="primary" size="md" onClick={() => onNavigate('application-form')}>
          Start New Application
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 space-y-8">
      {/* Header Banner */}
      <div className="max-w-5xl mx-auto bg-[#0F2137] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold">Post-UTME Candidate Desk</Badge>
              <span className="text-xs text-slate-400 font-mono">App No: {applicantApp.application_number}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {applicantApp.applicant?.first_name} {applicantApp.applicant?.last_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Programme Choice: <strong className="text-white">{applicantApp.programme?.name}</strong> ({applicantApp.programme?.degree_type})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Screening Decision</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isAdmitted ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs font-extrabold uppercase text-white">
                  {applicantApp.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {isAdmitted && (
              <Button
                variant="gold"
                size="md"
                onClick={() => onNavigate('student-portal')}
                rightIcon={ArrowRight}
              >
                Proceed to Student Portal
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: 'status', label: 'Screening Progress & Timeline' },
            { id: 'letter', label: 'Provisional Admission Letter' },
            { id: 'acceptance', label: 'Acceptance Fee (₦20,000)' },
            { id: 'biodata', label: 'Submitted Bio-Data & Documents' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#0F2137] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-5xl mx-auto">
        {/* Tab 1: Status & Timeline */}
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#0F2137]">Official Admissions Milestone Timeline</h3>
                <p className="text-xs text-slate-500">Track your Post-UTME screening validation steps in real time.</p>
              </div>

              {/* Milestones */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {/* Step 1 */}
                <div className="flex items-start gap-4 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Post-UTME Application Form Lodged</span>
                    <p className="text-xs text-slate-500 mt-0.5">Bio-data, JAMB slip, and O'Level results submitted successfully.</p>
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono">Completed</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Screening Fee Reconciled</span>
                    <p className="text-xs text-slate-500 mt-0.5">₦2,000 application processing fee verified via automated gateway.</p>
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono">Paid & Verified</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 relative">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                    applicantApp.status !== 'draft' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {applicantApp.status !== 'draft' ? '✓' : '3'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Central Admissions Board Verification</span>
                    <p className="text-xs text-slate-500 mt-0.5">Cross-referenced against JAMB CAPS and WAEC National Repository.</p>
                    <span className="text-[10px] text-slate-600 font-semibold font-mono">
                      {applicantApp.status === 'admitted' ? 'Verified & Approved' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-4 relative">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                    isAdmitted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isAdmitted ? '✓' : '4'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Provisional Admission Offer Issued</span>
                    <p className="text-xs text-slate-500 mt-0.5">Formal offer issued for {applicantApp.programme?.name}.</p>
                    {isAdmitted ? (
                      <span className="text-[10px] text-emerald-700 font-bold uppercase font-mono">
                        Offer Ready • Action Required
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Awaiting Decision</span>
                    )}
                  </div>
                </div>
              </div>

              {isAdmitted && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-900 block">Congratulations! You Have Been Admitted</span>
                    <p className="text-[11px] text-emerald-700">Please view your official admission letter and pay the acceptance fee.</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => setActiveTab('letter')}>
                    View Admission Letter
                  </Button>
                </div>
              )}
            </div>

            {/* Right Summary Card */}
            <div className="md:col-span-4 space-y-4">
              <Card className="p-6 space-y-4">
                <h4 className="text-xs font-bold text-[#0F2137] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Academic Credentials
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">JAMB Reg No:</span>
                    <span className="font-mono font-bold text-slate-900">{applicantApp.jamb_reg_number || '2026102948AB'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">JAMB Score:</span>
                    <span className="font-bold text-emerald-700">{applicantApp.jamb_score || 248} / 400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry Level:</span>
                    <span className="font-bold text-slate-900">{applicantApp.application_type === 'UTME' ? '100 Level' : '200 Level (DE)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session:</span>
                    <span className="font-bold text-slate-900">{settings.current_academic_session}</span>
                  </div>
                </div>
              </Card>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-900 block">Admissions Desk Notice</span>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  All admitted candidates must accept their admission offer within 14 days of publication to secure their matriculation slot.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Provisional Admission Letter */}
        {activeTab === 'letter' && (
          <div className="space-y-6">
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-xl max-w-3xl mx-auto space-y-8 print:border-0 print:shadow-none">
              {/* University Letterhead */}
              <div className="text-center space-y-2 border-b-2 border-[#0F2137] pb-6">
                <div className="w-14 h-14 bg-[#0F2137] text-amber-400 rounded-2xl mx-auto flex items-center justify-center font-bold">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F2137] tracking-tight uppercase">
                  {settings.university_name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Office of the Registrar • Directorate of Academic Affairs & Admissions
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {settings.address}, {settings.state_country} • admissions@pfust.edu.ng
                </p>
              </div>

              {/* Reference Details */}
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-slate-400 block font-normal">Our Ref:</span>
                  <span className="font-mono font-bold text-[#0F2137]">PFUST/ADM/{applicantApp.application_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-normal">Date:</span>
                  <span className="font-bold text-slate-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Addressee */}
              <div className="text-xs space-y-1 text-slate-800">
                <p className="font-bold uppercase text-slate-900">
                  {applicantApp.applicant?.first_name} {applicantApp.applicant?.last_name}
                </p>
                <p className="font-mono text-slate-600">JAMB Reg No: {applicantApp.jamb_reg_number}</p>
                <p className="text-slate-600">Application No: {applicantApp.application_number}</p>
              </div>

              {/* Salutation & Body */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
                <p className="font-bold">Dear Candidate,</p>
                <h3 className="text-sm sm:text-base font-extrabold text-[#0F2137] uppercase text-center py-2 bg-slate-50 rounded-lg border border-slate-200">
                  OFFER OF PROVISIONAL ADMISSION FOR {settings.current_academic_session} ACADEMIC SESSION
                </h3>

                <p>
                  I am pleased to inform you that the University Admissions Board has offered you <strong>Provisional Admission</strong> into
                  the <strong>{applicantApp.programme?.name}</strong> degree programme ({applicantApp.programme?.degree_type}) in the{' '}
                  <strong>Faculty of Computing & Information Technology</strong> for the {settings.current_academic_session} academic session.
                </p>

                <p>
                  This offer is subject to the verification of your qualifications (JAMB score of {applicantApp.jamb_score || 248}, and 5 relevant O'Level Credit passes including English Language and Mathematics).
                </p>

                <p>
                  To accept this provisional offer, you are required to pay the non-refundable Acceptance Fee of{' '}
                  <strong>₦20,000.00 (Twenty Thousand Naira only)</strong> through the university online portal within 14 days.
                </p>

                <div className="pt-8 flex justify-between items-end border-t border-slate-200">
                  <div className="space-y-1">
                    <div className="font-signature text-xl text-[#0F2137] font-serif italic">B. A. Mohammed</div>
                    <span className="font-bold text-xs text-slate-900 block">Barr. Bello A. Mohammed</span>
                    <span className="text-[11px] text-slate-500 block">Registrar & Secretary to Council</span>
                  </div>

                  <div className="w-20 h-20 border-2 border-dashed border-amber-600/60 rounded-full flex items-center justify-center text-center p-1 text-[9px] font-bold text-amber-800 uppercase leading-tight">
                    Official Registry Seal
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="primary" size="md" onClick={() => window.print()} leftIcon={Printer}>
                Print Official Admission Letter
              </Button>
              <Button variant="gold" size="md" onClick={() => setActiveTab('acceptance')} rightIcon={ArrowRight}>
                Proceed to Pay Acceptance Fee
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Acceptance Fee Payment */}
        {activeTab === 'acceptance' && (
          <Card className="max-w-xl mx-auto p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#0F2137]">Provisional Acceptance Fee Payment</h3>
              <p className="text-xs text-slate-500">
                Payment of ₦20,000 confirms your enrollment slot and generates your official Student Matriculation Number.
              </p>
            </div>

            {acceptancePaid ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Acceptance Fee Paid Successfully!</h4>
                <p className="text-xs text-slate-600">
                  Your seat in {applicantApp.programme?.name} is fully confirmed. You can now access your full Student Portal.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate('student-portal')}
                  rightIcon={ArrowRight}
                  className="w-full"
                >
                  Proceed to Student Portal (Course Reg & Bursary)
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Applicant:</span>
                    <span className="font-bold text-slate-900">
                      {applicantApp.applicant?.first_name} {applicantApp.applicant?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Degree Programme:</span>
                    <span className="font-bold text-[#0F2137]">{applicantApp.programme?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Session:</span>
                    <span className="font-bold text-slate-900">{settings.current_academic_session}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-700">
                    Select Automated Channel
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('paystack')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        paymentProvider === 'paystack'
                          ? 'border-[#0F2137] bg-blue-50 font-bold text-[#0F2137]'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>Paystack Gateway</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('remita')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        paymentProvider === 'remita'
                          ? 'border-[#0F2137] bg-amber-50 font-bold text-[#0F2137]'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>Remita RRR TSA</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Total Acceptance Fee</span>
                    <span className="text-[11px] text-emerald-700">Official Non-Refundable Fee</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">₦20,000.00</div>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  onClick={handlePayAcceptanceFee}
                  isLoading={isPayingAcceptance}
                  leftIcon={CreditCard}
                  className="w-full"
                >
                  Pay ₦20,000 & Complete Acceptance
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Tab 4: Submitted Bio-Data */}
        {activeTab === 'biodata' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-[#0F2137]">Submitted Candidate Bio-Data & Credentials</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider">Personal Records</h4>
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between"><span className="text-slate-400">Full Name:</span><span className="font-bold">{applicantApp.applicant?.first_name} {applicantApp.applicant?.last_name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Email:</span><span className="font-bold">{applicantApp.applicant?.email}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Phone:</span><span className="font-bold">{applicantApp.applicant?.phone || '08023456789'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">State / LGA:</span><span className="font-bold">{applicantApp.applicant?.state_of_origin || 'Kaduna'}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider">Screening Credentials</h4>
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between"><span className="text-slate-400">JAMB Reg No:</span><span className="font-mono font-bold">{applicantApp.jamb_reg_number}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">JAMB Score:</span><span className="font-bold text-emerald-700">{applicantApp.jamb_score} / 400</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Screening Fee:</span><span className="font-bold text-emerald-700">₦2,000 Paid</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Verified WAEC:</span><span className="font-bold text-slate-900">5 Credits Certified</span></div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
