import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileCheck,
  Award,
  Download,
  AlertCircle,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  ExternalLink,
  BookOpen,
  Sparkles,
  Printer,
  ChevronRight,
  ZoomIn,
  RefreshCw,
  Info,
  Send,
  MailCheck,
  CheckCheck,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { Application, ApplicationStatus, Student, DispatchedEmail } from '../../types/database';
import { formatNaira, formatDate } from '../../lib/utils';

export const ApplicationsTab: React.FC = () => {
  const {
    applications,
    students,
    faculties,
    departments,
    programmes,
    dispatchedEmails,
    updateApplicationStatus,
    admitApplicantAndCreateStudent,
    resendMatriculationEmail,
  } = useUniversityData();

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programmeFilter, setProgrammeFilter] = useState<string>('all');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedMatric, setCopiedMatric] = useState<string | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<'biodata' | 'academics' | 'documents' | 'emails' | 'decision'>('biodata');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewEmail, setPreviewEmail] = useState<DispatchedEmail | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Helper to find matric number for an application
  const getMatricNumber = (app: Application): string | null => {
    if (app.matric_number) return app.matric_number;
    const matchingStudent = students.find(
      (s) =>
        (app.applicant_id && s.applicant_id === app.applicant_id) ||
        (app.applicant?.user_id && s.user_id === app.applicant.user_id) ||
        (app.applicant?.profile_id && s.profile_id === app.applicant.profile_id)
    );
    return matchingStudent ? matchingStudent.student_number : null;
  };

  // Helper to get applicant profile
  const getApplicantProfile = (app: Application) => {
    return (
      app.applicant?.profile ||
      ({
        first_name: (app.applicant as any)?.first_name || 'Applicant',
        last_name: (app.applicant as any)?.last_name || '',
        middle_name: (app.applicant as any)?.middle_name || '',
        email: (app.applicant as any)?.email || '',
        phone: (app.applicant as any)?.phone || '—',
        gender: (app.applicant as any)?.gender || 'female',
        avatar_url: (app.applicant as any)?.avatar_url,
        nationality: (app.applicant as any)?.nationality || 'Nigerian',
        state_of_origin: (app.applicant as any)?.state_of_origin || 'Kaduna',
        lga: (app.applicant as any)?.lga || 'Zaria',
        address: (app.applicant as any)?.address || '14 Crescent Avenue, Barnawa, Kaduna',
        date_of_birth: (app.applicant as any)?.date_of_birth || '2007-03-21',
        marital_status: (app.applicant as any)?.marital_status || 'Single',
        religion: (app.applicant as any)?.religion || 'Islam',
        next_of_kin_name: (app.applicant as any)?.next_of_kin_name || 'Alhaji Danladi Usman',
        next_of_kin_relationship: (app.applicant as any)?.next_of_kin_relationship || 'Father',
        next_of_kin_phone: (app.applicant as any)?.next_of_kin_phone || '+234 802 333 4455',
        next_of_kin_address: (app.applicant as any)?.next_of_kin_address || '14 Crescent Avenue, Barnawa, Kaduna',
      } as any)
    );
  };

  // Helper to get applicant photo URL (from profile or passport document)
  const getApplicantPhoto = (app: Application): string => {
    const passportDoc = app.documents?.find((d) => d.document_type === 'passport');
    if (passportDoc?.file_url) return passportDoc.file_url;
    const profile = getApplicantProfile(app);
    if (profile.avatar_url) return profile.avatar_url;
    // Fallback based on gender
    return profile.gender === 'female'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
  };

  // Filtered applications list
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesProg = programmeFilter === 'all' || app.programme_id === programmeFilter;
    return matchesStatus && matchesProg;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMatric(text);
    setTimeout(() => setCopiedMatric(null), 2500);
  };

  const handleApprove = (appId: string) => {
    const res = admitApplicantAndCreateStudent(appId);
    if (res.success && res.student) {
      const emailNotice = res.emailDispatchedTo
        ? ` Electronic matriculation notice automatically emailed to ${res.emailDispatchedTo}.`
        : '';
      setActionSuccess(`Applicant successfully admitted! Generated Matric No: ${res.student.student_number}.${emailNotice}`);
      // Keep selected app updated with newly generated matric number and admitted status
      setSelectedApp((prev) =>
        prev && prev.id === appId
          ? {
              ...prev,
              status: 'admitted',
              matric_number: res.student?.student_number,
              admitted_at: new Date().toISOString(),
              reviewer_notes: `Admitted as student with Matric Number: ${res.student?.student_number}`,
            }
          : prev
      );
    }
  };

  const handleResendEmail = (appId: string) => {
    setIsResending(true);
    setTimeout(() => {
      const res = resendMatriculationEmail(appId);
      setIsResending(false);
      if (res.success) {
        setActionSuccess(res.message);
        if (res.email) {
          setPreviewEmail(res.email);
        }
      } else {
        setActionSuccess(res.message);
      }
    }, 600);
  };

  const handleStatusChange = (appId: string, status: ApplicationStatus) => {
    updateApplicationStatus(appId, status, reviewerNotes, rejectionReason);
    setActionSuccess(`Application status updated to ${status.toUpperCase().replace('_', ' ')}`);
    setSelectedApp((prev) =>
      prev && prev.id === appId
        ? {
            ...prev,
            status,
            reviewer_notes: reviewerNotes || prev.reviewer_notes,
            rejection_reason: rejectionReason || prev.rejection_reason,
            reviewed_at: new Date().toISOString(),
          }
        : prev
    );
    setReviewerNotes('');
    setRejectionReason('');
  };

  // Metrics
  const totalApps = applications.length;
  const admittedApps = applications.filter((a) => a.status === 'admitted' || Boolean(getMatricNumber(a))).length;
  const underReviewApps = applications.filter((a) => a.status === 'under_review').length;
  const pendingApps = applications.filter((a) => a.status === 'submitted').length;

  const columns: Column<Application>[] = [
    {
      header: 'Applicant & Photo',
      sortable: true,
      cell: (row) => {
        const profile = getApplicantProfile(row);
        const photoUrl = getApplicantPhoto(row);
        const matricNo = getMatricNumber(row);

        return (
          <div className="flex items-center gap-3 py-1">
            <div className="relative shrink-0">
              <img
                src={photoUrl}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shadow-xs"
                referrerPolicy="no-referrer"
              />
              {matricNo && (
                <span
                  title="Matriculated Student"
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 border border-white"
                >
                  <GraduationCap className="w-3 h-3" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-xs">
                  {profile.first_name} {profile.middle_name ? `${profile.middle_name} ` : ''}{profile.last_name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">({profile.gender?.[0]?.toUpperCase() || 'M'})</span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">{profile.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'App Number',
      accessorKey: 'application_number',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-[#0F2137] text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.application_number}
        </span>
      ),
    },
    {
      header: 'Matriculation No.',
      sortable: true,
      cell: (row) => {
        const matricNo = getMatricNumber(row);
        if (matricNo) {
          const isCopied = copiedMatric === matricNo;
          return (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md shadow-2xs group">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-mono font-bold text-xs tracking-tight">{matricNo}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(matricNo);
                }}
                title={isCopied ? 'Copied!' : 'Copy Matric Number'}
                className="text-emerald-600 hover:text-emerald-900 ml-1 p-0.5 rounded hover:bg-emerald-100 transition-colors"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          );
        }
        return (
          <span className="text-slate-400 font-medium italic text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-300" />
            Pending Matric
          </span>
        );
      },
    },
    {
      header: 'Programme & Faculty',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block truncate max-w-xs">
            {row.programme?.name}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {row.application_type} • {row.programme?.faculty?.code || 'FCIT'} ({row.programme?.code || 'DEG'})
          </span>
        </div>
      ),
    },
    {
      header: 'JAMB UTME',
      accessorKey: 'jamb_score',
      sortable: true,
      cell: (row) => {
        const score = row.jamb_score;
        const cutoff = row.programme?.jamb_cutoff_score || 180;
        const isPassing = score ? score >= cutoff : false;
        return (
          <div>
            <span
              className={`font-mono font-bold text-xs ${
                isPassing ? 'text-emerald-700' : score ? 'text-amber-700' : 'text-slate-400'
              }`}
            >
              {score ? `${score} / 400` : 'Direct Entry'}
            </span>
            {score && (
              <span className="block text-[10px] text-slate-400">
                Cutoff: {cutoff}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Screening Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        const matricNo = getMatricNumber(row);
        return (
          <div className="space-y-1">
            <Badge
              variant={
                row.status === 'admitted' || matricNo
                  ? 'success'
                  : row.status === 'under_review'
                  ? 'warning'
                  : row.status === 'correction_required'
                  ? 'warning'
                  : row.status === 'rejected'
                  ? 'danger'
                  : 'neutral'
              }
              className="text-[10px] font-semibold tracking-wider"
            >
              {row.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        );
      },
    },
    {
      header: 'Action',
      cell: (row) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelectedApp(row);
            setActiveReviewTab('biodata');
            setActionSuccess(null);
          }}
          leftIcon={Eye}
          className="text-xs py-1 px-2.5 bg-[#0F2137] hover:bg-[#1a365d] text-white"
        >
          Review & Decision
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
              Admissions & Matriculation Board
            </span>
            <span className="text-xs text-slate-400 font-mono">Session 2026/2027</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
            Applicant Screening & Decision Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review candidate bio-data, inspect O'Level & JAMB credentials, verify profile photos, and issue matriculation numbers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
          >
            <option value="all">All Screening Statuses ({applications.length})</option>
            <option value="submitted">Submitted ({applications.filter((a) => a.status === 'submitted').length})</option>
            <option value="under_review">Under Review ({applications.filter((a) => a.status === 'under_review').length})</option>
            <option value="admitted">Admitted & Matriculated ({applications.filter((a) => a.status === 'admitted').length})</option>
            <option value="correction_required">Correction Required ({applications.filter((a) => a.status === 'correction_required').length})</option>
            <option value="rejected">Rejected ({applications.filter((a) => a.status === 'rejected').length})</option>
          </select>

          {/* Programme Filter */}
          <select
            value={programmeFilter}
            onChange={(e) => setProgrammeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
          >
            <option value="all">All Programmes ({programmes.length})</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Applications
            </span>
            <span className="text-2xl font-black text-[#0F2137]">{totalApps}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">2026/2027 Admissions</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/30">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Admitted & Matriculated
            </span>
            <span className="text-2xl font-black text-emerald-800">{admittedApps}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Matric Numbers Issued</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
              Under Review
            </span>
            <span className="text-2xl font-black text-amber-800">{underReviewApps}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Committee Screening</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
              New Submissions
            </span>
            <span className="text-2xl font-black text-blue-800">{pendingApps}</span>
            <span className="text-[10px] text-blue-600 block mt-0.5">Awaiting Review</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs underline font-normal"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Applications Data Table */}
      <DataTable
        data={filteredApplications}
        columns={columns}
        searchPlaceholder="Search applicant name, matric no, application number, email, or JAMB reg..."
        exportFileName="pfust-applicant-screening-board"
      />

      {/* Comprehensive Application Review & Decision Modal */}
      {selectedApp && (() => {
        const profile = getApplicantProfile(selectedApp);
        const photoUrl = getApplicantPhoto(selectedApp);
        const matricNo = getMatricNumber(selectedApp);
        const isCopied = matricNo && copiedMatric === matricNo;

        // Calculate age
        const birthYear = profile.date_of_birth ? new Date(profile.date_of_birth).getFullYear() : 2006;
        const currentYear = new Date().getFullYear();
        const computedAge = currentYear - birthYear;

        return (
          <Modal
            isOpen={Boolean(selectedApp)}
            onClose={() => setSelectedApp(null)}
            title="Candidate Screening & Admissions Decision"
            subtitle={`Application Ref: ${selectedApp.application_number} • ${selectedApp.programme?.name}`}
            size="2xl"
            footer={
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedApp.status !== 'admitted' && !matricNo ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                        leftIcon={XCircle}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusChange(selectedApp.id, 'correction_required')}
                        leftIcon={AlertCircle}
                      >
                        Require Correction
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(selectedApp.id, 'under_review')}
                        leftIcon={Clock}
                      >
                        Mark Under Review
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(selectedApp.id)}
                        leftIcon={GraduationCap}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                      >
                        Approve & Generate Matric No
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Candidate Formally Admitted & Matriculated
                      </span>
                    </div>
                  )}
                </div>
              </div>
            }
          >
            <div className="space-y-6 text-xs text-slate-700">
              {/* Profile Card & Highlighted Matriculation Status */}
              <div className="p-5 bg-gradient-to-br from-slate-900 via-[#0F2137] to-slate-800 text-white rounded-2xl shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Avatar & Basic Bio */}
                  <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => setPreviewImage(photoUrl)}>
                      <img
                        src={photoUrl}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="w-20 h-20 rounded-2xl object-cover border-3 border-amber-400 shadow-md ring-2 ring-white/20 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Photo OK
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white tracking-tight">
                          {profile.first_name} {profile.middle_name ? `${profile.middle_name} ` : ''}{profile.last_name}
                        </h3>
                        <Badge variant="gold" className="text-[10px] uppercase">
                          {selectedApp.application_type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-slate-300 text-xs mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-amber-400" />
                          {profile.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          {profile.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {profile.state_of_origin}, {profile.nationality}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Programme Applied:</span>
                        <span className="text-xs font-bold text-amber-300">{selectedApp.programme?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Tag */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Screening Decision</span>
                    <Badge
                      variant={
                        selectedApp.status === 'admitted' || matricNo
                          ? 'success'
                          : selectedApp.status === 'under_review'
                          ? 'warning'
                          : selectedApp.status === 'rejected'
                          ? 'danger'
                          : 'neutral'
                      }
                      className="text-xs font-bold px-3 py-1 mt-1"
                    >
                      {selectedApp.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* MATRICULATION NUMBER SPOTLIGHT BANNER */}
                {matricNo ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-950/80 border-2 border-emerald-400/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">
                            Official Matriculation Number (Generated & Verified)
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg sm:text-xl font-mono font-black text-white tracking-wide">
                              {matricNo}
                            </span>
                            <button
                              onClick={() => handleCopy(matricNo)}
                              className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors border border-emerald-600"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-300" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy Matric No
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-emerald-800/80 sm:pl-4">
                        <span className="text-[10px] text-emerald-300 block">Class Cohort</span>
                        <span className="text-xs font-bold text-white font-mono">100L Freshman • 2026/2027</span>
                      </div>
                    </div>

                    {/* Email Notification Status Card */}
                    <div className="p-3.5 bg-white/10 backdrop-blur-xs border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                          <MailCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">
                              Matriculation Email Dispatched
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                              <CheckCheck className="w-3 h-3" /> Sent to Application Email
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Delivered to: <strong className="text-amber-300 font-mono">{profile.email}</strong> (Candidate Application Contact)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            const matchingEmail = dispatchedEmails.find(
                              (e) =>
                                e.recipient_email?.toLowerCase() === profile.email?.toLowerCase() ||
                                (e.metadata?.matric_number && e.metadata.matric_number === matricNo)
                            );
                            if (matchingEmail) {
                              setPreviewEmail(matchingEmail);
                            } else {
                              // Fallback preview
                              setPreviewEmail({
                                id: `preview-${Date.now()}`,
                                recipient_email: profile.email,
                                recipient_name: `${profile.first_name} ${profile.last_name}`,
                                subject: `🎓 PFUST Official Matriculation & Admission Notice - ${matricNo}`,
                                body: `Dear ${profile.first_name} ${profile.last_name},\n\nCongratulations! You have been formally matriculated into Prime Form University of Science and Technology (PFUST).\n\nYour Official Matriculation Number is: ${matricNo}\nProgramme: ${selectedApp.programme?.name}\nFaculty: ${selectedApp.programme?.faculty?.name}\n\nPlease proceed to the student portal to activate your account.`,
                                type: 'matriculation_notification',
                                status: 'sent',
                                created_at: new Date().toISOString(),
                                metadata: {
                                  matric_number: matricNo,
                                  programme: selectedApp.programme?.name,
                                  faculty: selectedApp.programme?.faculty?.name,
                                },
                              });
                            }
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview Sent Email
                        </button>

                        <button
                          onClick={() => handleResendEmail(selectedApp.id)}
                          disabled={isResending}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-400 flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                          {isResending ? 'Resending...' : 'Resend Email'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-slate-300">
                        <strong>Matriculation Status:</strong> Pre-matriculation screening in progress.
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300 font-mono">
                      Expected Format: 2026/{selectedApp.programme?.faculty?.code || 'FAC'}/{selectedApp.programme?.code || 'DEPT'}/XXXX
                    </span>
                  </div>
                )}
              </div>

              {/* Review Navigation Tabs */}
              <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveReviewTab('biodata')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                    activeReviewTab === 'biodata'
                      ? 'border-[#0F2137] text-[#0F2137]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Candidate Bio-Data & Profile
                </button>
                <button
                  onClick={() => setActiveReviewTab('academics')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                    activeReviewTab === 'academics'
                      ? 'border-[#0F2137] text-[#0F2137]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  JAMB & O'Level Qualifications
                </button>
                <button
                  onClick={() => setActiveReviewTab('documents')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                    activeReviewTab === 'documents'
                      ? 'border-[#0F2137] text-[#0F2137]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Uploaded Credentials ({selectedApp.documents?.length || 3})
                </button>
                <button
                  onClick={() => setActiveReviewTab('emails')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                    activeReviewTab === 'emails'
                      ? 'border-[#0F2137] text-[#0F2137]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Dispatched Communications
                  {dispatchedEmails.filter((e) => e.recipient_email?.toLowerCase() === profile.email?.toLowerCase()).length > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                      {dispatchedEmails.filter((e) => e.recipient_email?.toLowerCase() === profile.email?.toLowerCase()).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveReviewTab('decision')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                    activeReviewTab === 'decision'
                      ? 'border-[#0F2137] text-[#0F2137]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Board Decision & Audit Notes
                </button>
              </div>

              {/* Tab 1: Full Candidate Bio-Data */}
              {activeReviewTab === 'biodata' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0F2137]" />
                        Personal Bio-Data & Demographics
                      </h4>
                      <Badge variant="neutral" className="text-[10px]">Verified KYC Record</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[11px] block">First Name</span>
                        <span className="font-bold text-slate-900">{profile.first_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Middle Name</span>
                        <span className="font-bold text-slate-900">{profile.middle_name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Surname / Last Name</span>
                        <span className="font-bold text-slate-900">{profile.last_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Gender</span>
                        <span className="font-bold text-slate-900 capitalize">{profile.gender || 'Female'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block">Date of Birth</span>
                        <span className="font-bold text-slate-900">
                          {profile.date_of_birth ? formatDate(profile.date_of_birth) : '21 Mar 2007'}
                          <span className="text-slate-500 font-normal ml-1">({computedAge} yrs)</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Marital Status</span>
                        <span className="font-bold text-slate-900">{profile.marital_status || 'Single'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Religion</span>
                        <span className="font-bold text-slate-900">{profile.religion || 'Islam / Christianity'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Nationality</span>
                        <span className="font-bold text-slate-900">{profile.nationality || 'Nigerian'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block">State of Origin</span>
                        <span className="font-bold text-slate-900">{profile.state_of_origin || 'Kaduna'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Local Govt. Area (LGA)</span>
                        <span className="font-bold text-slate-900">{profile.lga || 'Zaria'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[11px] block">Residential Address</span>
                        <span className="font-bold text-slate-900 truncate block">
                          {profile.address || '14 Crescent Avenue, Barnawa, Kaduna State'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next of Kin / Emergency Contact */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-700" />
                      Next of Kin / Parent & Guardian Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Next of Kin Full Name</span>
                        <span className="font-bold text-slate-900">{profile.next_of_kin_name || 'Alhaji Danladi Usman'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Relationship</span>
                        <span className="font-bold text-slate-900">{profile.next_of_kin_relationship || 'Father / Guardian'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Emergency Telephone</span>
                        <span className="font-bold text-slate-900 font-mono">{profile.next_of_kin_phone || '+234 802 333 4455'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Choice Programme Summary */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-700" />
                      Academic Programme Placement
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Faculty</span>
                        <span className="font-bold text-slate-900">{selectedApp.programme?.faculty?.name || 'Computing & IT'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Department</span>
                        <span className="font-bold text-slate-900">{selectedApp.programme?.department?.name || 'Software Engineering'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Degree Award</span>
                        <span className="font-bold text-slate-900">{selectedApp.programme?.degree_type || 'B.Sc.'} ({selectedApp.programme?.duration_years || 4} Years)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Tuition / Session</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {formatNaira(selectedApp.programme?.tuition_per_session_ngn || 180000)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Academic Qualifications & JAMB/OLevel */}
              {activeReviewTab === 'academics' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* JAMB UTME Qualification */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          JAMB UTME Qualification
                        </h4>
                        <Badge variant="success" className="text-[10px]">Verified Score</Badge>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">JAMB Reg Number:</span>
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {selectedApp.jamb_reg_number || '202640192849CA'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Aggregate UTME Score:</span>
                          <span className="font-bold text-emerald-700 text-sm font-mono">
                            {selectedApp.jamb_score ? `${selectedApp.jamb_score} / 400` : 'Direct Entry Candidate'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Programme Benchmark:</span>
                          <span className="font-bold text-slate-700 font-mono">
                            {selectedApp.programme?.jamb_cutoff_score || 180} Points
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">UTME Score Status:</span>
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Exceeds Cut-Off by {Math.max(0, (selectedApp.jamb_score || 240) - (selectedApp.programme?.jamb_cutoff_score || 180))} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* O'Level Verified Breakdown */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#0F2137]" />
                          O'Level Examination Breakdown
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">
                          {selectedApp.olevel_results?.[0]?.exam_type || 'WAEC'} {selectedApp.olevel_results?.[0]?.exam_year || 2025}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {selectedApp.olevel_results && selectedApp.olevel_results[0]?.subjects ? (
                          selectedApp.olevel_results[0].subjects.map((sub, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100"
                            >
                              <span className="text-slate-800 font-medium">{sub.subject}</span>
                              <span
                                className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                                  sub.grade.startsWith('A')
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : sub.grade.startsWith('B')
                                    ? 'bg-blue-100 text-blue-800'
                                    : sub.grade.startsWith('C')
                                    ? 'bg-slate-200 text-slate-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {sub.grade}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-slate-400 bg-slate-50 rounded">
                            Five verified credit passages logged (WAEC 2025).
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prior Education / Direct Entry Credentials */}
                  {selectedApp.application_type === 'Direct Entry' && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                      <h4 className="font-bold text-amber-900 uppercase tracking-wider text-xs">
                        Direct Entry Higher Education Credentials
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-amber-200">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Previous Institution</span>
                          <span className="font-bold text-slate-900">{selectedApp.previous_institution || 'Yaba College of Technology'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Qualification</span>
                          <span className="font-bold text-slate-900">{selectedApp.previous_qualification || 'OND Upper Credit'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Graduating CGPA</span>
                          <span className="font-bold text-emerald-700 font-mono">{selectedApp.cgpa?.toFixed(2) || '3.48'} / 4.00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Statement */}
                  {selectedApp.personal_statement && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px] block">
                        Candidate Motivation / Personal Statement
                      </span>
                      <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-slate-200">
                        "{selectedApp.personal_statement}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Uploaded Verified Documents */}
              {activeReviewTab === 'documents' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Passport Photo */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center text-center space-y-2 hover:border-slate-300 transition-colors">
                      <div className="relative group cursor-pointer" onClick={() => setPreviewImage(photoUrl)}>
                        <img
                          src={photoUrl}
                          alt="Passport Photo"
                          className="w-24 h-24 rounded-xl object-cover border-2 border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <ZoomIn className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">Official Passport Photo</span>
                        <span className="text-[10px] text-slate-400">Verified Biometric JPEG</span>
                      </div>
                      <Badge variant="success" className="text-[9px]">Verified & Clear</Badge>
                    </div>

                    {/* WAEC / NECO Result */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center space-y-2 hover:border-slate-300 transition-colors">
                      <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        <FileCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">O'Level Result Statement</span>
                        <span className="text-[10px] text-slate-400">WAEC / NECO Statement of Result</span>
                      </div>
                      <Badge variant="success" className="text-[9px]">Verified 5 Credits</Badge>
                    </div>

                    {/* JAMB Slip */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center space-y-2 hover:border-slate-300 transition-colors">
                      <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Award className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">JAMB UTME Slip</span>
                        <span className="text-[10px] text-slate-400">Score Verification Slip</span>
                      </div>
                      <Badge variant="success" className="text-[9px]">JAMB CAPS Confirmed</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Dispatched Communications & Email Logs */}
              {activeReviewTab === 'emails' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#0F2137]" />
                          Official Dispatched Communications Log
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Target Recipient Email: <strong className="font-mono text-slate-900">{profile.email}</strong> (Candidate Application Contact)
                        </p>
                      </div>
                      {matricNo && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleResendEmail(selectedApp.id)}
                          disabled={isResending}
                          leftIcon={RefreshCw}
                          className="text-xs"
                        >
                          {isResending ? 'Sending...' : 'Resend Matric Email'}
                        </Button>
                      )}
                    </div>

                    {/* Email entries */}
                    {(() => {
                      const candidateEmails = dispatchedEmails.filter(
                        (e) =>
                          e.recipient_email?.toLowerCase() === profile.email?.toLowerCase() ||
                          (e.metadata?.matric_number && e.metadata.matric_number === matricNo)
                      );

                      if (candidateEmails.length === 0) {
                        return (
                          <div className="p-6 text-center bg-white rounded-lg border border-slate-200 space-y-2">
                            <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500 font-medium">
                              No electronic notifications dispatched yet.
                            </p>
                            <p className="text-[11px] text-slate-400">
                              When an applicant is admitted, a matriculation notification email is automatically generated and dispatched to the email provided on the application form.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2.5">
                          {candidateEmails.map((emailItem) => (
                            <div
                              key={emailItem.id}
                              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      emailItem.type === 'matriculation_notification'
                                        ? 'success'
                                        : emailItem.type === 'admission_offer'
                                        ? 'primary'
                                        : 'neutral'
                                    }
                                    className="text-[10px]"
                                  >
                                    {emailItem.type.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {formatDate(emailItem.created_at)}
                                  </span>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                                    <CheckCheck className="w-2.5 h-2.5" /> Delivered
                                  </span>
                                </div>

                                <h5 className="font-bold text-slate-900 text-xs">
                                  {emailItem.subject}
                                </h5>

                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  To: <span className="font-mono text-slate-700">{emailItem.recipient_email}</span> • {emailItem.recipient_name}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPreviewEmail(emailItem)}
                                  leftIcon={Eye}
                                  className="text-xs py-1"
                                >
                                  View Email Notice
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Tab 5: Committee Decision & Audit Notes */}
              {activeReviewTab === 'decision' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Current Status Overview */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-slate-800 text-xs">
                        Admissions Committee Audit Trail
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Last Updated: {formatDate(selectedApp.updated_at || selectedApp.created_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Application Status</span>
                        <span className="font-bold text-slate-900 uppercase">{selectedApp.status.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Payment Confirmation</span>
                        <span className="font-bold text-emerald-700 uppercase">{selectedApp.payment_status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Matric Number</span>
                        <span className="font-mono font-bold text-slate-900">{matricNo || 'Not yet issued'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Reviewed By</span>
                        <span className="font-bold text-slate-900">{selectedApp.reviewed_by || 'Admissions Board'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reviewer Notes Form */}
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-700 text-xs mb-1">
                        Admissions Committee Internal Notes
                      </label>
                      <textarea
                        rows={3}
                        value={reviewerNotes || selectedApp.reviewer_notes || ''}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        placeholder="Enter committee remarks, verified qualifications, or conditional requirements..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                      />
                    </div>

                    {selectedApp.status === 'rejected' && (
                      <div>
                        <label className="block font-bold uppercase tracking-wider text-red-700 text-xs mb-1">
                          Rejection Reason (Transmitted to Candidate Portal)
                        </label>
                        <textarea
                          rows={2}
                          value={rejectionReason || selectedApp.rejection_reason || ''}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="State exact grounds for decline (e.g. UTME cut-off not met, O'Level deficiency in Physics)..."
                          className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* Email Preview Modal */}
      {previewEmail && (
        <Modal
          isOpen={Boolean(previewEmail)}
          onClose={() => setPreviewEmail(null)}
          title="Dispatched Electronic Communication"
          subtitle={`Transmission to: ${previewEmail.recipient_email} (${previewEmail.recipient_name})`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Copy}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Subject: ${previewEmail.subject}\nTo: ${previewEmail.recipient_email}\n\n${previewEmail.body}`
                  );
                  setActionSuccess('Email content copied to clipboard.');
                }}
              >
                Copy Email Text
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={Printer}
                  onClick={() => window.print()}
                >
                  Print Email Notice
                </Button>
                <Button variant="primary" size="sm" onClick={() => setPreviewEmail(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Email Envelope Meta Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">From:</span>
                <span className="text-slate-900 font-semibold">PFUST Office of the Registrar & Admissions &lt;admissions@pfust.edu.ng&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">To (Application Contact):</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {previewEmail.recipient_email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Dispatched:</span>
                <span className="text-slate-800">{formatDate(previewEmail.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Status:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Instant Direct Dispatch (Delivered)
                </span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="text-slate-900 font-bold">{previewEmail.subject}</span>
              </div>
            </div>

            {/* Email Rendered Canvas */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-5 text-slate-800">
              {/* Institution Header */}
              <div className="text-center border-b border-slate-200 pb-4 space-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#0F2137] text-amber-400 font-black text-xl flex items-center justify-center mx-auto shadow-md">
                  P
                </div>
                <h3 className="font-extrabold text-[#0F2137] text-sm tracking-tight uppercase mt-2">
                  Prime Form University of Science and Technology
                </h3>
                <p className="text-[10px] text-slate-500 font-serif uppercase tracking-widest">
                  Office of Admissions & Student Academic Records • PMB 1024, Kaduna State, Nigeria
                </p>
              </div>

              {/* Salutation */}
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Dear {previewEmail.recipient_name},
                </p>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  The Admissions Board and Academic Council are pleased to inform you that your application for undergraduate study at Prime Form University of Science and Technology (PFUST) for the <strong>2026/2027 Academic Session</strong> has been formally approved.
                </p>
              </div>

              {/* Matriculation Spotlight Inside Email */}
              {previewEmail.metadata?.matric_number && (
                <div className="p-4 bg-gradient-to-br from-emerald-900 to-[#0F2137] text-white rounded-xl text-center space-y-1 shadow-md border border-emerald-500/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block">
                    Your Official University Matriculation Number
                  </span>
                  <span className="text-2xl font-black font-mono tracking-wider text-amber-300 block">
                    {previewEmail.metadata.matric_number}
                  </span>
                  <span className="text-[10px] text-slate-300 block">
                    Programme: <strong>{previewEmail.metadata.programme || 'Software Engineering'}</strong> • Faculty of {previewEmail.metadata.faculty || 'Computing & IT'}
                  </span>
                </div>
              )}

              {/* Body Text */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Important Next Steps for Freshman Registration:
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>Visit the <strong>PFUST Student Portal</strong> and select <em>"Activate New Student Account"</em>.</li>
                  <li>Log in using your official Matriculation Number: <strong className="font-mono">{previewEmail.metadata?.matric_number || 'Your Matric No'}</strong> and your application password.</li>
                  <li>Proceed to verify and accept your formal admission letter.</li>
                  <li>Generate your e-Invoice for acceptance and semester registration fees.</li>
                  <li>Complete medical screening and course registration prior to orientation.</li>
                </ol>
              </div>

              {/* Sign-off */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-end text-[11px]">
                <div>
                  <p className="font-bold text-slate-900">Dr. M. A. Bello</p>
                  <p className="text-slate-500">Registrar & Secretary to Council</p>
                  <p className="text-slate-400 text-[10px]">Prime Form University of Science and Technology</p>
                </div>
                <span className="text-slate-400 font-mono text-[9px]">
                  Ref: PFUST/ADM/2026/NOTIF
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-md w-full bg-white p-4 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Enlarged Passport Photo"
              className="w-full h-80 rounded-xl object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">Verified Candidate Passport Photograph</span>
              <Button size="sm" variant="outline" onClick={() => setPreviewImage(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
