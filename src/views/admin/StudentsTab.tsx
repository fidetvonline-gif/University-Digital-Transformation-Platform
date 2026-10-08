import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Download,
  BookOpen,
  Edit3,
  Key,
  Lock,
  Unlock,
  Mail,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
  Calendar,
  Building2,
  Phone,
  MapPin,
  ExternalLink,
  Award,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { Student, Staff, Profile } from '../../types/database';
import { useAuth } from '../../lib/auth/AuthContext';

export const StudentsTab: React.FC = () => {
  const {
    students,
    faculties,
    departments,
    programmes,
    updateStudentStatus,
    updateStudent,
    resetStudentPassword,
    dispatchedEmails,
  } = useUniversityData();

  const { user, profile: currentAdminProfile, role: currentRole } = useAuth();

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentForPasswordReset, setStudentForPasswordReset] = useState<Student | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState<{
    student_number: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    programme_id: string;
    level_code: string;
    current_cgpa: number;
    status: Student['status'];
    admission_date: string;
    nationality: string;
    state_of_origin: string;
    lga: string;
    address: string;
    next_of_kin_name: string;
    next_of_kin_phone: string;
    next_of_kin_relationship: string;
  }>({
    student_number: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone: '',
    gender: 'male',
    programme_id: '',
    level_code: '100L',
    current_cgpa: 3.5,
    status: 'active',
    admission_date: '2026-08-15',
    nationality: 'Nigerian',
    state_of_origin: '',
    lga: '',
    address: '',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    next_of_kin_relationship: '',
  });

  // Password reset modal state
  const [customPassword, setCustomPassword] = useState('');
  const [sendPasswordEmail, setSendPasswordEmail] = useState(true);
  const [showPasswordText, setShowPasswordText] = useState(true);
  const [passwordResetResult, setPasswordResetResult] = useState<{
    newPassword: string;
    email: string;
    studentName: string;
    matricNumber: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Filters
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredStudents = students.filter((s) => {
    const matchesFaculty = facultyFilter === 'all' || s.faculty_id === facultyFilter;
    const matchesLevel =
      levelFilter === 'all' ||
      s.level?.code === levelFilter ||
      (levelFilter === '100L' && !s.level?.code);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesFaculty && matchesLevel && matchesStatus;
  });

  // Open Edit Modal
  const handleOpenEdit = (student: Student) => {
    setStudentToEdit(student);
    setEditFormData({
      student_number: student.student_number || '',
      first_name: student.profile?.first_name || '',
      last_name: student.profile?.last_name || '',
      middle_name: (student.profile as any)?.middle_name || '',
      email: student.profile?.email || '',
      phone: student.profile?.phone || '+234 800 000 0000',
      gender: (student.profile?.gender as any) || 'male',
      programme_id: student.programme_id || programmes[0]?.id || '',
      level_code: student.level?.code || '100L',
      current_cgpa: Number(student.current_cgpa) || 3.5,
      status: student.status || 'active',
      admission_date: student.admission_date || '2026-08-15',
      nationality: student.profile?.nationality || 'Nigerian',
      state_of_origin: (student.profile as any)?.state_of_origin || 'Lagos',
      lga: (student.profile as any)?.lga || 'Ikeja',
      address: (student.profile as any)?.address || '',
      next_of_kin_name: (student.profile as any)?.next_of_kin_name || '',
      next_of_kin_phone: (student.profile as any)?.next_of_kin_phone || '',
      next_of_kin_relationship: (student.profile as any)?.next_of_kin_relationship || 'Parent',
    });
  };

  // Submit Student Edit Form
  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;

    if (!editFormData.student_number.trim()) {
      alert('Matriculation Number is required.');
      return;
    }

    const selectedProg = programmes.find((p) => p.id === editFormData.programme_id);
    const selectedDept = departments.find((d) => d.id === selectedProg?.department_id);
    const selectedFac = faculties.find((f) => f.id === selectedProg?.faculty_id);

    const studentUpdates: Partial<Student> = {
      student_number: editFormData.student_number.trim().toUpperCase(),
      programme_id: editFormData.programme_id,
      department_id: selectedDept?.id || studentToEdit.department_id,
      faculty_id: selectedFac?.id || studentToEdit.faculty_id,
      current_cgpa: Number(editFormData.current_cgpa),
      status: editFormData.status,
      admission_date: editFormData.admission_date,
      level: {
        id: `lvl-${editFormData.level_code.toLowerCase()}`,
        code: editFormData.level_code,
        name: `${editFormData.level_code.replace('L', '00')} Level`,
        description: `${editFormData.level_code} Undergraduate Cohort`,
      },
    };

    const profileUpdates: Partial<Profile> = {
      first_name: editFormData.first_name.trim(),
      last_name: editFormData.last_name.trim(),
      email: editFormData.email.trim().toLowerCase(),
      phone: editFormData.phone.trim(),
      gender: editFormData.gender,
      nationality: editFormData.nationality,
    };

    // Attach extended bio-data to profile
    (profileUpdates as any).middle_name = editFormData.middle_name;
    (profileUpdates as any).state_of_origin = editFormData.state_of_origin;
    (profileUpdates as any).lga = editFormData.lga;
    (profileUpdates as any).address = editFormData.address;
    (profileUpdates as any).next_of_kin_name = editFormData.next_of_kin_name;
    (profileUpdates as any).next_of_kin_phone = editFormData.next_of_kin_phone;
    (profileUpdates as any).next_of_kin_relationship = editFormData.next_of_kin_relationship;

    updateStudent(studentToEdit.id, studentUpdates, profileUpdates);

    // If active in view modal, refresh it
    if (selectedStudent && selectedStudent.id === studentToEdit.id) {
      setSelectedStudent({
        ...selectedStudent,
        ...studentUpdates,
        programme: selectedProg || selectedStudent.programme,
        department: selectedDept || selectedStudent.department,
        faculty: selectedFac || selectedStudent.faculty,
        profile: { ...(selectedStudent.profile || {}), ...profileUpdates } as Profile,
      });
    }

    setStudentToEdit(null);
    showToast(`Student records for ${editFormData.first_name} ${editFormData.last_name} (${studentUpdates.student_number}) updated successfully.`);
  };

  // Open Password Reset Modal
  const handleOpenPasswordReset = (student: Student) => {
    setStudentForPasswordReset(student);
    setPasswordResetResult(null);
    setIsCopied(false);
    // Generate a default strong temporary password
    const autoPass = `PFUST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}!`;
    setCustomPassword(autoPass);
  };

  // Execute Password Reset
  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForPasswordReset) return;

    const result = resetStudentPassword(
      studentForPasswordReset.id,
      customPassword,
      sendPasswordEmail
    );

    if (result.success && result.password) {
      setPasswordResetResult({
        newPassword: result.password,
        email: result.emailRecipient || studentForPasswordReset.profile?.email || 'student@pfust.edu.ng',
        studentName: `${studentForPasswordReset.profile?.first_name || ''} ${studentForPasswordReset.profile?.last_name || ''}`,
        matricNumber: studentForPasswordReset.student_number,
      });
      showToast(result.message);
    } else {
      alert(result.message || 'Failed to reset password.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Compute metric stats
  const activeCount = students.filter((s) => s.status === 'active').length;
  const graduatedCount = students.filter((s) => s.status === 'graduated').length;
  const suspendedCount = students.filter((s) => s.status === 'suspended').length;
  const honorRollCount = students.filter((s) => (s.current_cgpa || 0) >= 4.5).length;

  const columns: Column<Student>[] = [
    {
      header: 'Matric Number',
      accessorKey: 'student_number',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#002147] text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {row.student_number}
          </span>
          <button
            onClick={() => copyToClipboard(row.student_number)}
            title="Copy Matric No"
            className="text-slate-400 hover:text-[#002147] p-1 rounded hover:bg-slate-100 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      ),
    },
    {
      header: 'Student Scholar',
      sortable: true,
      cell: (row) => {
        const initials = `${row.profile?.first_name?.[0] || 'U'}${row.profile?.last_name?.[0] || 'S'}`;
        return (
          <div className="flex items-center gap-2.5">
            {row.profile?.avatar_url ? (
              <img
                src={row.profile.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#002147] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-xs block truncate">
                {row.profile?.first_name} {row.profile?.last_name}
              </span>
              <span className="text-[11px] text-slate-500 truncate block font-mono">
                {row.profile?.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Programme & Department',
      sortable: true,
      cell: (row) => (
        <div className="max-w-xs">
          <span className="font-semibold text-slate-800 text-xs block truncate">
            {row.programme?.name || 'Undergraduate Degree'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {row.department?.code || 'DEPT'} • {row.faculty?.code || 'FAC'}
          </span>
        </div>
      ),
    },
    {
      header: 'Level',
      cell: (row) => (
        <Badge variant="neutral" className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800">
          {row.level?.code || '100L'}
        </Badge>
      ),
    },
    {
      header: 'CGPA',
      accessorKey: 'current_cgpa',
      sortable: true,
      cell: (row) => {
        const cgpa = Number(row.current_cgpa) || 0;
        const isFirstClass = cgpa >= 4.5;
        const isSecondUpper = cgpa >= 3.5 && cgpa < 4.5;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold font-mono text-xs ${
                isFirstClass
                  ? 'text-emerald-700 font-black'
                  : isSecondUpper
                  ? 'text-blue-700'
                  : 'text-slate-700'
              }`}
            >
              {cgpa.toFixed(2)} / 5.00
            </span>
            {isFirstClass && (
              <span title="First Class Honors" className="text-amber-500">
                ★
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge
          variant={
            row.status === 'active'
              ? 'success'
              : row.status === 'graduated'
              ? 'gold'
              : row.status === 'suspended'
              ? 'danger'
              : 'neutral'
          }
          className="text-[10px] uppercase font-bold"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Administrative Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedStudent(row)}
            title="View Full Student Dossier"
            className="text-xs px-2 py-1 h-7 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            View
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            title="Edit Student Information & Academic Records"
            className="text-xs px-2 py-1 h-7 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenPasswordReset(row)}
            title="Reset Student Portal Login Password"
            className="text-xs px-2 py-1 h-7 border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100/70 font-semibold"
          >
            <Key className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Reset Password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-3 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#002147]/10 flex items-center justify-center text-[#002147] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrolled
            </p>
            <p className="text-xl font-extrabold text-[#002147]">{students.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Scholars
            </p>
            <p className="text-xl font-extrabold text-emerald-700">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              First Class Honors
            </p>
            <p className="text-xl font-extrabold text-amber-900">{honorRollCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Suspended / On Leave
            </p>
            <p className="text-xl font-extrabold text-rose-700">{suspendedCount}</p>
          </div>
        </div>
      </div>

      {/* Control Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              SIS Administrative Management
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">• Super Admin Authorized</span>
          </div>
          <h2 className="text-xl font-bold text-[#002147] tracking-tight mt-1">
            Student Information System (SIS) Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student bio-data, academic standing, matriculation IDs, and portal password resets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Faculty Filter */}
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
          >
            <option value="all">All Faculties ({faculties.length})</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="100L">100 Level</option>
            <option value="200L">200 Level</option>
            <option value="300L">300 Level</option>
            <option value="400L">400 Level</option>
            <option value="500L">500 Level</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="graduated">Graduated</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Main Student Records Table */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        searchPlaceholder="Search by student name, matric number, institutional email, or programme..."
        exportFileName="pfust-matriculated-students-registry"
      />

      {/* ========================================================================= */}
      {/* 1. MODAL: EDIT STUDENT INFORMATION & ACADEMIC PLACEMENT                   */}
      {/* ========================================================================= */}
      {studentToEdit && (
        <Modal
          isOpen={Boolean(studentToEdit)}
          onClose={() => setStudentToEdit(null)}
          title={`Edit Student Records: ${studentToEdit.profile?.first_name} ${studentToEdit.profile?.last_name}`}
          subtitle={`Matric No: ${studentToEdit.student_number} • Direct Database Update`}
          size="lg"
        >
          <form onSubmit={handleSaveStudentEdit} className="space-y-5 text-xs text-slate-700">
            {/* Header Badge */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold text-blue-900">Super Administrator Direct Registry Editor</p>
                  <p className="text-[11px] text-blue-700">
                    Modifications will update the student profile, academic records, and institutional audit trail in real-time.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" className="font-mono text-[10px]">
                ID: {studentToEdit.id}
              </Badge>
            </div>

            {/* Section 1: Academic Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#002147] uppercase tracking-wider pb-1 border-b border-slate-200">
                <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                <span>Academic Identity & Placement</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Matriculation Number *
                  </label>
                  <input
                    type="text"
                    value={editFormData.student_number}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, student_number: e.target.value })
                    }
                    placeholder="e.g. PFUST/2026/001"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-[#002147] focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Degree Programme *
                  </label>
                  <select
                    value={editFormData.programme_id}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, programme_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  >
                    {programmes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Academic Level *
                  </label>
                  <select
                    value={editFormData.level_code}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, level_code: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  >
                    <option value="100L">100 Level (Freshman)</option>
                    <option value="200L">200 Level (Sophomore)</option>
                    <option value="300L">300 Level (Junior)</option>
                    <option value="400L">400 Level (Senior)</option>
                    <option value="500L">500 Level (Finalist / Professional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Current CGPA (0.00 - 5.00) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5.0"
                    value={editFormData.current_cgpa}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, current_cgpa: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Admission Date *
                  </label>
                  <input
                    type="date"
                    value={editFormData.admission_date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, admission_date: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Enrolment Status *
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value as Student['status'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  >
                    <option value="active">Active (Good Standing)</option>
                    <option value="suspended">Suspended (Disciplinary / Admin Hold)</option>
                    <option value="graduated">Graduated (Alumnus)</option>
                    <option value="withdrawn">Withdrawn</option>
                    <option value="deferred">Deferred Admission</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Student Bio-Data & Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#002147] uppercase tracking-wider pb-1 border-b border-slate-200">
                <Users className="w-4 h-4 text-[#002147]" />
                <span>Personal Bio-Data & Contact</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={editFormData.first_name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, first_name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={editFormData.middle_name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, middle_name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, last_name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary / Notification Email *
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Used for password reset delivery & notices.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value as 'male' | 'female' | 'other',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={editFormData.nationality}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, nationality: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State of Origin</label>
                  <input
                    type="text"
                    value={editFormData.state_of_origin}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, state_of_origin: e.target.value })
                    }
                    placeholder="e.g. Lagos, Rivers, Kano"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">LGA</label>
                  <input
                    type="text"
                    value={editFormData.lga}
                    onChange={(e) => setEditFormData({ ...editFormData, lga: e.target.value })}
                    placeholder="e.g. Ikeja, Port Harcourt"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStudentToEdit(null)}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStudentToEdit(null);
                    handleOpenPasswordReset(studentToEdit);
                  }}
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  <Key className="w-3.5 h-3.5 mr-1" />
                  Reset Password Instead
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Save Student Records
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL: RESET STUDENT PASSWORD & DISPATCH CREDENTIALS                   */}
      {/* ========================================================================= */}
      {studentForPasswordReset && (
        <Modal
          isOpen={Boolean(studentForPasswordReset)}
          onClose={() => {
            setStudentForPasswordReset(null);
            setPasswordResetResult(null);
          }}
          title={`Reset Student Password: ${studentForPasswordReset.profile?.first_name} ${studentForPasswordReset.profile?.last_name}`}
          subtitle={`Matric No: ${studentForPasswordReset.student_number} • Student Portal Security`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            {/* Student Identification Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#002147] text-[#D4AF37] font-bold text-sm flex items-center justify-center border border-slate-200 shrink-0">
                  {studentForPasswordReset.profile?.first_name?.[0] || 'S'}
                  {studentForPasswordReset.profile?.last_name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {studentForPasswordReset.profile?.first_name}{' '}
                    {studentForPasswordReset.profile?.last_name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-600">
                    Matric: <span className="font-bold text-[#002147]">{studentForPasswordReset.student_number}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Email: {studentForPasswordReset.profile?.email || 'student@pfust.edu.ng'}
                  </p>
                </div>
              </div>
              <Badge variant="neutral" className="text-[10px] font-mono">
                {studentForPasswordReset.level?.code || '100L'}
              </Badge>
            </div>

            {/* Success State */}
            {passwordResetResult ? (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Password Reset Successful!</span>
                  </div>

                  <p className="text-emerald-800 text-xs">
                    The student portal credentials have been updated in the database.
                    {sendPasswordEmail && (
                      <span> An automated credential notification email was dispatched to <strong>{passwordResetResult.email}</strong>.</span>
                    )}
                  </p>

                  <div className="p-3 bg-white rounded-lg border border-emerald-200 font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Matric Number / Username:</span>
                      <span className="font-bold text-[#002147]">{passwordResetResult.matricNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Registered Email:</span>
                      <span className="font-semibold text-slate-800">{passwordResetResult.email}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-bold">New Active Password:</span>
                      <span className="font-extrabold text-emerald-700 text-sm bg-emerald-50 px-2 py-0.5 rounded">
                        {passwordResetResult.newPassword}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const text = `PFUST Student Portal Login Credentials\nMatric No: ${passwordResetResult.matricNumber}\nEmail: ${passwordResetResult.email}\nTemporary Password: ${passwordResetResult.newPassword}\nPortal URL: https://pfust.edu.ng/student-portal`;
                      copyToClipboard(text);
                    }}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-emerald-300" />
                        Credentials Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" />
                        Copy Login Credentials
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStudentForPasswordReset(null);
                      setPasswordResetResult(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              /* Password Reset Form */
              <form onSubmit={handleExecutePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">
                      New Temporary / Initial Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newAuto = `PFUST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}!`;
                        setCustomPassword(newAuto);
                      }}
                      className="text-[11px] font-bold text-[#002147] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      Re-generate Secure Password
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 pr-10 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#002147] focus:ring-2 focus:ring-[#002147] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPasswordText ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    High entropy password automatically formatted for Microsoft 365 & SIS directory authentication.
                  </p>
                </div>

                {/* Email Dispatch Checkbox */}
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendPasswordEmail}
                      onChange={(e) => setSendPasswordEmail(e.target.checked)}
                      className="mt-0.5 rounded text-[#002147] focus:ring-[#002147]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Dispatch Email Notification to Student
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        Send temporary login credentials directly to{' '}
                        <strong className="text-[#002147]">
                          {studentForPasswordReset.profile?.email || 'student@pfust.edu.ng'}
                        </strong>
                      </span>
                    </div>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStudentForPasswordReset(null)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" variant="gold" size="sm">
                    <Key className="w-3.5 h-3.5 mr-1" />
                    Reset Password & Update Credentials
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: FULL STUDENT PROFILE DOSSIER                                     */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title={`Student Dossier: ${selectedStudent.profile?.first_name} ${selectedStudent.profile?.last_name}`}
          subtitle={`Matric No: ${selectedStudent.student_number} • ${selectedStudent.programme?.name}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                Close Dossier
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const st = selectedStudent;
                    setSelectedStudent(null);
                    handleOpenPasswordReset(st);
                  }}
                  className="text-amber-800 border-amber-300 hover:bg-amber-50"
                >
                  <Key className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Reset Password
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const st = selectedStudent;
                    setSelectedStudent(null);
                    handleOpenEdit(st);
                  }}
                  className="text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit Records
                </Button>

                <Button
                  variant={selectedStudent.status === 'active' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => {
                    const newStatus = selectedStudent.status === 'active' ? 'suspended' : 'active';
                    updateStudentStatus(selectedStudent.id, newStatus);
                    setSelectedStudent({ ...selectedStudent, status: newStatus });
                    showToast(`Student status updated to ${newStatus.toUpperCase()}.`);
                  }}
                >
                  {selectedStudent.status === 'active' ? 'Suspend Scholar' : 'Reactivate Scholar'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-slate-700">
            {/* Scholar Identity Header */}
            <div className="p-4 bg-gradient-to-r from-[#002147] to-[#003366] text-white rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                {selectedStudent.profile?.avatar_url ? (
                  <img
                    src={selectedStudent.profile.avatar_url}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-[#D4AF37] text-[#D4AF37] font-bold text-base flex items-center justify-center shadow-sm">
                    {selectedStudent.profile?.first_name?.[0] || 'S'}
                    {selectedStudent.profile?.last_name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedStudent.profile?.first_name} {selectedStudent.profile?.last_name}
                  </h3>
                  <p className="text-xs text-[#D4AF37] font-mono font-semibold">
                    Matric No: {selectedStudent.student_number}
                  </p>
                  <p className="text-[11px] text-slate-200">
                    {selectedStudent.programme?.name} • {selectedStudent.level?.code || '100L'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <Badge
                  variant={selectedStudent.status === 'active' ? 'success' : 'danger'}
                  className="uppercase text-[10px] font-bold"
                >
                  {selectedStudent.status}
                </Badge>
                <p className="text-[10px] text-slate-300 mt-1 font-mono">
                  CGPA: <span className="text-emerald-400 font-bold text-xs">{selectedStudent.current_cgpa.toFixed(2)}</span> / 5.00
                </p>
              </div>
            </div>

            {/* Academic Placement Grid */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Matriculation Number</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{selectedStudent.student_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Cumulative CGPA</span>
                <span className="font-bold font-mono text-emerald-700 text-xs">{selectedStudent.current_cgpa.toFixed(2)} / 5.00</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Admission Date</span>
                <span className="font-bold text-slate-900 text-xs">{selectedStudent.admission_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Faculty</span>
                <span className="font-bold text-slate-900 text-xs">{selectedStudent.faculty?.name || 'Science & Technology'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Department</span>
                <span className="font-bold text-slate-900 text-xs">{selectedStudent.department?.name || 'Computing'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Current Level</span>
                <span className="font-bold text-slate-900 text-xs">{selectedStudent.level?.code || '100L'}</span>
              </div>
            </div>

            {/* Bio-Data & Contact */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Registered Email</span>
                <span className="font-semibold text-slate-900 text-xs font-mono">{selectedStudent.profile?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Phone Number</span>
                <span className="font-semibold text-slate-900 text-xs font-mono">{selectedStudent.profile?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Gender / Nationality</span>
                <span className="font-semibold text-slate-900 text-xs capitalize">
                  {selectedStudent.profile?.gender || 'N/A'} • {selectedStudent.profile?.nationality || 'Nigerian'}
                </span>
              </div>
            </div>

            {/* Microsoft 365 & Identity Provisioning */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Microsoft 365 & Institutional Identity
                </span>
                <Badge variant="success" className="text-[10px]">Azure AD Synced</Badge>
              </div>
              <p className="text-slate-700">
                Institutional Email:{' '}
                <code className="text-blue-800 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                  {selectedStudent.student_number
                    ? selectedStudent.student_number.toLowerCase().replace(/\//g, '.')
                    : 'student'}
                  @pfust.edu.ng
                </code>
              </p>
              <p className="text-slate-500 text-[11px]">
                Student Portal SSO Status: Active • Multi-factor Authentication Ready
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export { StaffTab } from './StaffTab';

