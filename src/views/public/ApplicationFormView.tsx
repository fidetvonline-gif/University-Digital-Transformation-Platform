import React, { useState } from 'react';
import {
  GraduationCap,
  User,
  BookOpen,
  FileText,
  UploadCloud,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button, Card, Badge } from '../../components/ui/common';
import { FileUploader } from '../../components/ui/FileUploader';
import { formatNaira, generateApplicationNumber } from '../../lib/utils';
import { OLevelSubjectGrade, ApplicationDocument } from '../../types/database';

export interface ApplicationFormViewProps {
  onNavigate: (view: string, params?: any) => void;
  preSelectedProgrammeId?: string;
}

export const ApplicationFormView: React.FC<ApplicationFormViewProps> = ({
  onNavigate,
  preSelectedProgrammeId,
}) => {
  const { programmes, faculties, createOrUpdateApplication, createInvoice, processPayment, settings } =
    useUniversityData();
  const { user, profile, registerApplicant } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppNumber, setCreatedAppNumber] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [bioData, setBioData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    gender: (profile?.gender as 'male' | 'female' | 'other') || 'male',
    date_of_birth: '2005-04-12',
    state_of_origin: 'Kaduna',
    lga_of_origin: 'Zaria',
    address: 'Plot 44 Ahmadu Bello Way, Kaduna',
    next_of_kin_name: 'Alhaji Ibrahim Balogun',
    next_of_kin_phone: '08023456789',
  });

  const [programmeChoice, setProgrammeChoice] = useState({
    application_type: 'UTME' as 'UTME' | 'Direct_Entry',
    faculty_id:
      programmes.find((p) => p.id === preSelectedProgrammeId)?.faculty_id || faculties[0]?.id || '',
    programme_id: preSelectedProgrammeId || programmes[0]?.id || '',
  });

  // Synchronize when preSelectedProgrammeId or programmes load
  React.useEffect(() => {
    if (preSelectedProgrammeId) {
      const prog = programmes.find((p) => p.id === preSelectedProgrammeId);
      if (prog) {
        setProgrammeChoice((prev) => ({
          ...prev,
          programme_id: prog.id,
          faculty_id: prog.faculty_id,
        }));
      }
    } else if (!programmeChoice.programme_id && programmes.length > 0) {
      setProgrammeChoice((prev) => ({
        ...prev,
        programme_id: programmes[0].id,
        faculty_id: programmes[0].faculty_id,
      }));
    }
  }, [preSelectedProgrammeId, programmes]);

  const [academicData, setAcademicData] = useState({
    jamb_reg_number: '2026' + Math.floor(10000000 + Math.random() * 90000000) + 'AB',
    jamb_score: 248,
    olevel_exam_type: 'WAEC',
    olevel_exam_year: 2025,
    olevel_exam_number: '4291829301',
    olevel_results: [
      { subject: 'English Language', grade: 'A1' },
      { subject: 'Mathematics', grade: 'B2' },
      { subject: 'Physics', grade: 'A1' },
      { subject: 'Chemistry', grade: 'B3' },
      { subject: 'Biology', grade: 'B2' },
    ] as OLevelSubjectGrade[],
  });

  const [uploadedDocs, setUploadedDocs] = useState<
    Array<{ document_type: ApplicationDocument['document_type']; file_name: string; file_url: string }>
  >([]);

  const [paymentChannel, setPaymentChannel] = useState<'card' | 'bank_transfer' | 'ussd'>('card');
  const [paymentProvider, setPaymentProvider] = useState<'paystack' | 'remita'>('paystack');

  const selectedProg = programmes.find((p) => p.id === programmeChoice.programme_id) || programmes[0];

  const handleDocUpload = (
    docType: ApplicationDocument['document_type'],
    data: { name: string; url: string }
  ) => {
    setUploadedDocs((prev) => [
      ...prev.filter((d) => d.document_type !== docType),
      { document_type: docType, file_name: data.name, file_url: data.url },
    ]);
  };

  const handleAutoFillSample = () => {
    setBioData({
      first_name: 'Fatima',
      last_name: 'Danjuma',
      email: `fatima.danjuma.${Math.floor(100 + Math.random() * 900)}@example.com`,
      phone: '08031234567',
      gender: 'female',
      date_of_birth: '2005-08-19',
      state_of_origin: 'Kano',
      lga_of_origin: 'Nasarawa',
      address: 'No. 18 Bompai Road, Kano',
      next_of_kin_name: 'Dr. Usman Danjuma',
      next_of_kin_phone: '08029876543',
    });
    setValidationError(null);
  };

  const handleProceedFromStep1 = () => {
    if (!bioData.first_name.trim() || !bioData.last_name.trim()) {
      setValidationError('Please enter both your legal First Name and Last Name.');
      return;
    }
    if (!bioData.email.trim() || !bioData.email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!bioData.phone.trim()) {
      setValidationError('Please enter a valid phone number.');
      return;
    }
    setValidationError(null);
    setCurrentStep(2);
  };

  const handleProceedFromStep2 = () => {
    if (!selectedProg) {
      setValidationError('Please select a valid academic programme.');
      return;
    }
    setValidationError(null);
    setCurrentStep(3);
  };

  const handleProceedFromStep3 = () => {
    if (!academicData.jamb_reg_number.trim()) {
      setValidationError('Please enter your JAMB Registration Number.');
      return;
    }
    if (!academicData.jamb_score || academicData.jamb_score < 100 || academicData.jamb_score > 400) {
      setValidationError('Please enter a valid JAMB Score between 100 and 400.');
      return;
    }
    setValidationError(null);
    setCurrentStep(4);
  };

  const handleFinalSubmitAndPay = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const chosenProgramme = programmes.find((p) => p.id === programmeChoice.programme_id) || programmes[0];
      if (!chosenProgramme) {
        throw new Error('No academic programme available. Please select a valid degree programme.');
      }

      // 1. Ensure applicant account exists
      let currentUserId = user?.id;
      let currentProfileId = profile?.id;

      if (!user) {
        const regRes = await registerApplicant({
          email: bioData.email.trim(),
          first_name: bioData.first_name.trim(),
          last_name: bioData.last_name.trim(),
          phone: bioData.phone.trim(),
          gender: bioData.gender,
        });
        if (regRes && regRes.user && regRes.profile) {
          currentUserId = regRes.user.id;
          currentProfileId = regRes.profile.id;
        }
      }

      // 2. Create Application in Data Store
      const newApp = createOrUpdateApplication({
        applicant_id: currentProfileId || profile?.id || `appl-${Date.now()}`,
        academic_session_id: 'sess-2026',
        programme_id: chosenProgramme.id,
        application_type: programmeChoice.application_type,
        status: 'submitted',
        payment_status: 'successful',
        jamb_score: Number(academicData.jamb_score) || 200,
        jamb_reg_number: academicData.jamb_reg_number.trim(),
        olevel_results: academicData.olevel_results,
        applicant: {
          id: `appl-${Date.now()}`,
          user_id: currentUserId || user?.id || `usr-${Date.now()}`,
          profile_id: currentProfileId || profile?.id || `prof-${Date.now()}`,
          first_name: bioData.first_name.trim(),
          last_name: bioData.last_name.trim(),
          email: bioData.email.trim(),
          phone: bioData.phone.trim(),
          gender: bioData.gender,
          date_of_birth: bioData.date_of_birth,
          state_of_origin: bioData.state_of_origin,
          lga_of_origin: bioData.lga_of_origin,
          address: bioData.address,
        },
      });

      // 3. Create and Process ₦2,000 Application Invoice
      const invoice = createInvoice({
        title: `Post-UTME Application Screening Fee (${newApp.application_number})`,
        fee_type: 'application_fee',
        amount_ngn: 2000,
        currency: 'NGN',
        academic_session: '2026/2027',
        application_id: newApp.id,
        payer_id: newApp.applicant_id,
        payer_email: bioData.email.trim(),
        payer_name: `${bioData.first_name.trim()} ${bioData.last_name.trim()}`,
      });

      processPayment(invoice.id, paymentProvider, {
        name: `${bioData.first_name.trim()} ${bioData.last_name.trim()}`,
        email: bioData.email.trim(),
        channel: paymentChannel,
      });

      setCreatedAppNumber(newApp.application_number);
      setCurrentStep(6); // Success Step
    } catch (err: any) {
      console.error("Application submission failed:", err);
      setSubmitError(err?.message || "An error occurred while submitting your application. Please verify your entries and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge variant="gold">Official Application Form</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {settings.current_academic_session} Undergraduate Application
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Complete all screening sections below. All entries are validated against National
            JAMB and WAEC/NECO databases.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Step Progress Indicator */}
        {currentStep < 6 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
              {[
                { step: 1, label: 'Bio Data' },
                { step: 2, label: 'Programme' },
                { step: 3, label: 'Academic' },
                { step: 4, label: 'Documents' },
                { step: 5, label: 'Fee & Submit' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`p-2 rounded-lg transition-all ${
                    currentStep === s.step
                      ? 'bg-[#0F2137] text-white'
                      : currentStep > s.step
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <span className="block text-[10px] uppercase font-bold opacity-75">
                    Step 0{s.step}
                  </span>
                  <span className="truncate block">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Personal & Contact Bio-Data */}
        {currentStep === 1 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0F2137]">Step 1: Personal Bio-Data & Contact Information</h2>
                <p className="text-xs text-slate-500">Provide legal name as it appears on your JAMB and WAEC result slips.</p>
              </div>
              <Button
                variant="outline"
                size="xs"
                type="button"
                onClick={handleAutoFillSample}
                className="self-start sm:self-auto text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                ⚡ Auto-Fill Sample Data
              </Button>
            </div>

            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={bioData.first_name}
                  onChange={(e) => setBioData({ ...bioData, first_name: e.target.value })}
                  placeholder="e.g. Ibrahim"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Last Name / Surname *</label>
                <input
                  type="text"
                  value={bioData.last_name}
                  onChange={(e) => setBioData({ ...bioData, last_name: e.target.value })}
                  placeholder="e.g. Balogun"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={bioData.email}
                  onChange={(e) => setBioData({ ...bioData, email: e.target.value })}
                  placeholder="applicant@gmail.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  value={bioData.phone}
                  onChange={(e) => setBioData({ ...bioData, phone: e.target.value })}
                  placeholder="08012345678"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Gender *</label>
                <select
                  value={bioData.gender}
                  onChange={(e) => setBioData({ ...bioData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={bioData.date_of_birth}
                  onChange={(e) => setBioData({ ...bioData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">State of Origin *</label>
                <input
                  type="text"
                  value={bioData.state_of_origin}
                  onChange={(e) => setBioData({ ...bioData, state_of_origin: e.target.value })}
                  placeholder="e.g. Kaduna, Lagos, Kano, Enugu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Local Government Area (LGA) *</label>
                <input
                  type="text"
                  value={bioData.lga_of_origin}
                  onChange={(e) => setBioData({ ...bioData, lga_of_origin: e.target.value })}
                  placeholder="e.g. Zaria, Ikeja, Fagge"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button
                variant="primary"
                size="md"
                onClick={handleProceedFromStep1}
                rightIcon={ArrowRight}
              >
                Proceed to Programme Selection
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Programme Selection */}
        {currentStep === 2 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-[#0F2137]">Step 2: Choose Mode of Entry & Programme</h2>
              <p className="text-xs text-slate-500">Select whether you are applying via UTME (100 Level) or Direct Entry (200 Level).</p>
            </div>

            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Application Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProgrammeChoice({ ...programmeChoice, application_type: 'UTME' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      programmeChoice.application_type === 'UTME'
                        ? 'border-[#0F2137] bg-slate-50 text-[#0F2137] font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm">UTME Candidate (100 Level)</span>
                    <span className="text-[11px] font-normal text-slate-500">For secondary school leavers with 2026 JAMB score.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProgrammeChoice({ ...programmeChoice, application_type: 'Direct_Entry' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      programmeChoice.application_type === 'Direct_Entry'
                        ? 'border-[#0F2137] bg-slate-50 text-[#0F2137] font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm">Direct Entry (200 Level)</span>
                    <span className="text-[11px] font-normal text-slate-500">For ND, HND, IJMB or JUPEB certificate holders.</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Target Degree Programme *</label>
                <select
                  value={programmeChoice.programme_id}
                  onChange={(e) => {
                    const prog = programmes.find((p) => p.id === e.target.value);
                    setProgrammeChoice({
                      ...programmeChoice,
                      programme_id: e.target.value,
                      faculty_id: prog?.faculty_id || programmeChoice.faculty_id,
                    });
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.degree_type}) — Min JAMB: {p.jamb_cutoff_score} — {p.duration_years} Years
                    </option>
                  ))}
                </select>
              </div>

              {selectedProg && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{selectedProg.name}</span>
                    <Badge variant="neutral">{selectedProg.degree_type}</Badge>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{selectedProg.description}</p>
                  <div className="text-[11px] font-medium text-emerald-700 pt-1">
                    Standard Tuition: {formatNaira(selectedProg.tuition_fee_ngn)} per academic session
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" size="md" onClick={() => { setValidationError(null); setCurrentStep(1); }} leftIcon={ArrowLeft}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={handleProceedFromStep2} rightIcon={ArrowRight}>
                Proceed to Academic Records
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Academic Qualifications */}
        {currentStep === 3 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-[#0F2137]">Step 3: JAMB & O'Level Results</h2>
              <p className="text-xs text-slate-500">Enter your official examination registration numbers and verified grades.</p>
            </div>

            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">JAMB Registration Number *</label>
                  <input
                    type="text"
                    value={academicData.jamb_reg_number}
                    onChange={(e) => setAcademicData({ ...academicData, jamb_reg_number: e.target.value })}
                    placeholder="e.g. 202610293847AB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">JAMB UTME Aggregate Score *</label>
                  <input
                    type="number"
                    value={academicData.jamb_score}
                    onChange={(e) => setAcademicData({ ...academicData, jamb_score: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 250"
                    min="160"
                    max="400"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                  />
                </div>
              </div>

              {/* O'Level Grade Inputs */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                  O'Level Senior Secondary School Grades (5 Core Subjects)
                </h4>
                <div className="space-y-2">
                  {academicData.olevel_results.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800">{item.subject}</span>
                      <select
                        value={item.grade}
                        onChange={(e) => {
                          const updated = [...academicData.olevel_results];
                          updated[idx].grade = e.target.value as any;
                          setAcademicData({ ...academicData, olevel_results: updated });
                        }}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-[#0F2137]"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>
                            {g} ({g.startsWith('A') || g.startsWith('B') || g.startsWith('C') ? 'Credit Pass' : 'Pass/Fail'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" size="md" onClick={() => { setValidationError(null); setCurrentStep(2); }} leftIcon={ArrowLeft}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={handleProceedFromStep3} rightIcon={ArrowRight}>
                Proceed to Document Uploads
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Document Uploads */}
        {currentStep === 4 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-[#0F2137]">Step 4: Upload Required Credentials</h2>
              <p className="text-xs text-slate-500">Upload scanned copies in PDF or image format (max 5MB each).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FileUploader
                label="1. Official JAMB Result Slip *"
                onUploadComplete={(res) => handleDocUpload('jamb_result', res)}
                helperText="Must show aggregate score and photograph"
              />
              <FileUploader
                label="2. O'Level Statement of Result / Certificate *"
                onUploadComplete={(res) => handleDocUpload('o_level', res)}
                helperText="WAEC / NECO / NABTEB result certificate"
              />
              <FileUploader
                label="3. Birth Certificate / LGA Indigene Attestation *"
                onUploadComplete={(res) => handleDocUpload('birth_certificate', res)}
                helperText="National Population Commission or LGA issued"
              />
              <FileUploader
                label="4. Recent Passport Photograph *"
                accept=".jpg,.jpeg,.png"
                onUploadComplete={(res) => handleDocUpload('passport', res)}
                helperText="Clear front-facing passport on red or white background"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" size="md" onClick={() => { setValidationError(null); setCurrentStep(3); }} leftIcon={ArrowLeft}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => { setValidationError(null); setCurrentStep(5); }} rightIcon={ArrowRight}>
                Proceed to Payment & Final Review
              </Button>
            </div>
          </Card>
        )}

        {/* Step 5: Application Fee & Submit */}
        {currentStep === 5 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-[#0F2137]">Step 5: Screening Fee Payment (₦2,000)</h2>
              <p className="text-xs text-slate-500">Review your application summary and complete the online Post-UTME screening payment.</p>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Application Submission Encountered an Issue</span>
                  <span className="text-rose-700 leading-relaxed block">{submitError}</span>
                </div>
              </div>
            )}

            {/* Application Summary Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">Application Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block">Candidate Name</span>
                  <span className="font-bold text-slate-900">{bioData.first_name || 'N/A'} {bioData.last_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Chosen Programme</span>
                  <span className="font-bold text-[#0F2137]">{selectedProg?.name || 'Selected Programme'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">JAMB Score</span>
                  <span className="font-bold text-emerald-700">{academicData.jamb_score} / 400</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Automated Payment Gateway
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentProvider('paystack')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentProvider === 'paystack'
                      ? 'border-[#0F2137] bg-blue-50/50 font-bold text-[#0F2137]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Paystack Gateway</span>
                    <Badge variant="info">Cards & Transfer</Badge>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentProvider('remita')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentProvider === 'remita'
                      ? 'border-[#0F2137] bg-amber-50/50 font-bold text-[#0F2137]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Remita RRR Service</span>
                    <Badge variant="gold">Federal TSA</Badge>
                  </div>
                </button>
              </div>

              {/* Amount Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Total Payable Fee</span>
                  <span className="text-[11px] text-emerald-700">Post-UTME Application & Processing</span>
                </div>
                <div className="text-2xl font-bold text-emerald-900">₦2,000.00</div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" size="md" onClick={() => { setSubmitError(null); setCurrentStep(4); }} leftIcon={ArrowLeft}>
                Back
              </Button>
              <Button
                variant="gold"
                size="lg"
                onClick={handleFinalSubmitAndPay}
                isLoading={isSubmitting}
                leftIcon={CreditCard}
              >
                Pay ₦2,000 & Submit Application
              </Button>
            </div>
          </Card>
        )}

        {/* Step 6: Final Confirmation & Application Slip */}
        {currentStep === 6 && createdAppNumber && (
          <Card className="p-8 text-center space-y-6 bg-white border-2 border-emerald-500 shadow-xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <Badge variant="success" className="text-xs px-3 py-1">Payment Successful • Application Submitted</Badge>
              <h2 className="text-2xl font-bold text-[#0F2137]">Application Successfully Lodged!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your Post-UTME screening application has been registered with the University Admissions Board.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-2">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Your Official Application Number</span>
              <div className="text-2xl font-mono font-extrabold text-[#0F2137] select-all tracking-wider">
                {createdAppNumber}
              </div>
              <p className="text-[11px] text-slate-400">
                Please write down or save this application number to track your screening and admission offer.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('applicant-portal')}
                rightIcon={ArrowRight}
              >
                Go to Applicant Portal
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate('check-status')}
              >
                Check Admission Status
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => window.print()}
              >
                Print Screening Slip
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => onNavigate('home')}
              >
                Back to Home
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
