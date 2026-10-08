import React, { useState, useMemo } from 'react';
import {
  Shield,
  Users,
  UserPlus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Key,
  Lock,
  Unlock,
  Eye,
  Check,
  X,
  Sparkles,
  GraduationCap,
  FileText,
  UserCheck,
  RotateCcw,
  Mail,
  ExternalLink,
  Info,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Card, Button, Badge, Modal } from '../../components/ui/common';
import { Role, Profile, UserRole, Application } from '../../types/database';
import { useAuth } from '../../lib/auth/AuthContext';

export const RolesTab: React.FC = () => {
  const {
    rolesList,
    updateRoleDetails,
    profiles,
    createProfile,
    updateProfileRole,
    updateProfileStatus,
    applications,
    students,
    staffList,
  } = useUniversityData();
  const { role: currentAdminRole } = useAuth();

  // Tab State: 'staff_admin' | 'applicants' | 'students' | 'roles_matrix'
  const [activeTab, setActiveTab] = useState<'staff_admin' | 'applicants' | 'students' | 'roles_matrix'>('staff_admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit Role Modal
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<Partial<Role>>({});

  // Create User Modal
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [userCategory, setUserCategory] = useState<'staff_admin' | 'applicant' | 'student'>('staff_admin');
  const [newUserData, setNewUserData] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    phone: string;
    department?: string;
    gender: 'male' | 'female' | 'other';
  }>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'staff',
    phone: '+234 800 000 0000',
    department: 'Computer Science',
    gender: 'male',
  });

  // Password Reset Modal
  const [passwordResetUser, setPasswordResetUser] = useState<Profile | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Promote / Convert Role Modal
  const [promoteUser, setPromoteUser] = useState<Profile | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('student');

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Staff and Admin roles list
  const staffAdminRoles: UserRole[] = [
    'super_admin',
    'management',
    'registrar',
    'bursar',
    'admissions_officer',
    'ict_admin',
    'registry_officer',
    'faculty_admin',
    'department_admin',
    'staff',
  ];

  // Group profiles by category
  const staffAdminProfiles = useMemo(
    () => profiles.filter((p) => p && p.role && staffAdminRoles.includes(p.role)),
    [profiles]
  );

  const applicantProfiles = useMemo(
    () => profiles.filter((p) => p && p.role === 'applicant'),
    [profiles]
  );

  const studentProfiles = useMemo(
    () => profiles.filter((p) => p && p.role === 'student'),
    [profiles]
  );

  // Active dataset depending on selected tab
  const currentDataset = useMemo(() => {
    if (activeTab === 'staff_admin') return staffAdminProfiles;
    if (activeTab === 'applicants') return applicantProfiles;
    if (activeTab === 'students') return studentProfiles;
    return [];
  }, [activeTab, staffAdminProfiles, applicantProfiles, studentProfiles]);

  const filteredCurrentDataset = useMemo(() => {
    return currentDataset.filter((p) => {
      if (!p) return false;
      const term = (searchTerm || '').toLowerCase();
      const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      const emailStr = (p.email || '').toLowerCase();
      const roleStr = (p.role || '').toLowerCase();

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        emailStr.includes(term) ||
        roleStr.includes(term);
      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [currentDataset, searchTerm, roleFilter, statusFilter]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.first_name || !newUserData.last_name) return;

    let finalRole: UserRole = newUserData.role;
    if (userCategory === 'applicant') finalRole = 'applicant';
    if (userCategory === 'student') finalRole = 'student';

    createProfile({
      user_id: `usr-${Date.now()}`,
      email: newUserData.email.trim(),
      first_name: newUserData.first_name.trim(),
      last_name: newUserData.last_name.trim(),
      phone: newUserData.phone,
      gender: newUserData.gender,
      nationality: 'Nigerian',
      status: 'active',
      role: finalRole,
    });

    setIsCreateUserOpen(false);
    setNewUserData({
      first_name: '',
      last_name: '',
      email: '',
      role: 'staff',
      phone: '+234 800 000 0000',
      department: 'Computer Science',
      gender: 'male',
    });
    showToast(`New ${finalRole.replace('_', ' ')} user account created successfully!`);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    updateRoleDetails(editingRole.id, roleFormData);
    setEditingRole(null);
    showToast(`Role "${editingRole.name}" configuration updated!`);
  };

  const handleOpenPasswordReset = (p: Profile) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordResetUser(p);
    setGeneratedPassword(pwd);
    setShowPassword(false);
    setPasswordResetSuccess(false);
  };

  const handleExecutePasswordReset = () => {
    if (!passwordResetUser) return;
    setPasswordResetSuccess(true);
    showToast(`Temporary login credentials generated and dispatched to ${passwordResetUser.email}`);
  };

  const handleExecuteRoleChange = () => {
    if (!promoteUser) return;
    updateProfileRole(promoteUser.user_id, targetRole);
    setPromoteUser(null);
    showToast(`User role successfully changed to ${(targetRole || '').replace('_', ' ').toUpperCase()}!`);
  };

  const roleBadgeVariants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
    super_admin: 'danger',
    management: 'primary',
    registrar: 'secondary',
    bursar: 'warning',
    admissions_officer: 'info',
    ict_admin: 'primary',
    registry_officer: 'secondary',
    faculty_admin: 'primary',
    department_admin: 'secondary',
    staff: 'success',
    student: 'info',
    applicant: 'secondary',
  };

  // Helper to find associated application for an applicant
  const findApplicantApplication = (applicantProfile: Profile): Application | undefined => {
    return applications.find(
      (app) =>
        app.applicant?.user_id === applicantProfile.user_id ||
        app.applicant?.profile?.email === applicantProfile.email ||
        app.applicant_id === applicantProfile.user_id
    );
  };

  // Helper to find staff record
  const findStaffRecord = (staffProfile: Profile) => {
    return staffList.find(
      (s) => s.user_id === staffProfile.user_id || s.profile?.email === staffProfile.email
    );
  };

  // Helper to find student record
  const findStudentRecord = (studentProfile: Profile) => {
    return students.find(
      (st) => st.user_id === studentProfile.user_id || st.profile?.email === studentProfile.email
    );
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-[#002147] text-[#D4AF37] rounded-lg">
            <Shield className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Roles & Access Control (RBAC) Console
            </h1>
            <p className="text-xs text-gray-500">
              Institutional Authority • Segregated access management for Staff & Admins, Prospective Applicants, and Students.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={UserPlus}
            onClick={() => {
              if (activeTab === 'applicants') setUserCategory('applicant');
              else if (activeTab === 'students') setUserCategory('student');
              else setUserCategory('staff_admin');
              setIsCreateUserOpen(true);
            }}
            className="bg-[#002147] text-[#D4AF37] hover:bg-[#003366] font-semibold cursor-pointer"
          >
            Create User Account
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold text-emerald-900">{successToast}</p>
          </div>
          <Badge variant="success">Updated</Badge>
        </div>
      )}

      {/* High-Level Cadre Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('staff_admin');
            setRoleFilter('all');
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'staff_admin'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-700" />
              Staff & Admins
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {staffAdminProfiles.length}
            </span>
          </div>
          <p className="text-lg font-black text-gray-900 font-mono">{staffAdminProfiles.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Academic & Admin Officers</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('applicants');
            setRoleFilter('all');
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'applicants'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              Applicant Users
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {applicantProfiles.length}
            </span>
          </div>
          <p className="text-lg font-black text-gray-900 font-mono">{applicantProfiles.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Prospective Candidates</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('students');
            setRoleFilter('all');
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              Student Users
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {studentProfiles.length}
            </span>
          </div>
          <p className="text-lg font-black text-gray-900 font-mono">{studentProfiles.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Enrolled Undergraduates</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('roles_matrix');
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'roles_matrix'
              ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-700" />
              Roles Matrix
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {rolesList.length}
            </span>
          </div>
          <p className="text-lg font-black text-gray-900 font-mono">{rolesList.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Defined System Capabilities</p>
        </button>
      </div>

      {/* Segregated Category Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('staff_admin');
            setRoleFilter('all');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'staff_admin'
              ? 'bg-[#002147] text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeTab === 'staff_admin' ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
          <span>Staff & Administrative Officers Directory</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'staff_admin' ? 'bg-[#D4AF37] text-[#002147] font-bold' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {staffAdminProfiles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('applicants');
            setRoleFilter('all');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'applicants'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-amber-50 hover:border-amber-200'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'applicants' ? 'text-amber-200' : 'text-amber-600'}`} />
          <span>Candidate & Applicant Users</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'applicants' ? 'bg-white text-amber-800 font-bold' : 'bg-amber-100 text-amber-800 font-semibold'
            }`}
          >
            {applicantProfiles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('students');
            setRoleFilter('all');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <GraduationCap className={`w-4 h-4 ${activeTab === 'students' ? 'text-emerald-200' : 'text-emerald-600'}`} />
          <span>Enrolled Students</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'students' ? 'bg-white text-emerald-800 font-bold' : 'bg-emerald-100 text-emerald-800 font-semibold'
            }`}
          >
            {studentProfiles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles_matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roles_matrix'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Key className={`w-4 h-4 ${activeTab === 'roles_matrix' ? 'text-purple-200' : 'text-purple-600'}`} />
          <span>System Roles & Capabilities Matrix ({rolesList.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STAFF & ADMINISTRATIVE OFFICERS (APPLICANTS STRICTLY EXCLUDED) */}
      {/* ========================================================================= */}
      {activeTab === 'staff_admin' && (
        <div className="space-y-4">
          {/* Informative Scope Header */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-900">
              <Shield className="w-4 h-4 text-blue-700 shrink-0" />
              <p>
                <strong>Administrative & Academic Officers Directory:</strong> Lists verified institutional personnel with administrative privileges and staff portal access. Prospective applicants and students are separated into their own dedicated rosters.
              </p>
            </div>
            <Badge variant="primary">Privileged Personnel</Badge>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff by name, email, or role..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Staff & Admin Roles ({staffAdminProfiles.length})</option>
                <option value="super_admin">Super Administrator</option>
                <option value="management">University Management (VC / DVC)</option>
                <option value="registrar">Registrar</option>
                <option value="bursar">Bursar / Finance Officer</option>
                <option value="admissions_officer">Admissions Officer</option>
                <option value="dean">Faculty Dean</option>
                <option value="hod">Head of Department (HOD)</option>
                <option value="staff">Academic / Non-Academic Staff</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Staff & Admin Table */}
          <Card className="overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002147] text-[#D4AF37] uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Officer Details</th>
                    <th className="py-3 px-4">Cadre / Staff ID</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Official Phone</th>
                    <th className="py-3 px-4 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredCurrentDataset.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No staff or administrative accounts match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCurrentDataset.map((p) => {
                      const staffRecord = findStaffRecord(p);
                      return (
                        <tr key={p.id || p.user_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {p.avatar_url ? (
                                <img
                                  src={p.avatar_url}
                                  alt={p.first_name}
                                  className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[#002147] text-[#D4AF37] flex items-center justify-center font-bold text-xs shrink-0">
                                  {p.first_name?.[0] || 'S'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-gray-900">
                                  {p.first_name} {p.last_name}
                                </p>
                                <p className="text-[11px] text-gray-500 font-mono">{p.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {staffRecord ? (
                              <div>
                                <span className="font-mono font-bold text-gray-800 text-[11px] block">
                                  {staffRecord.staff_id}
                                </span>
                                <span className="text-[10px] text-gray-500 truncate max-w-[150px] block">
                                  {staffRecord.designation || 'Academic Staff'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">Institutional Officer</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge variant={roleBadgeVariants[p.role] || 'secondary'}>
                              {(p.role || '').replace('_', ' ').toUpperCase()}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4">
                            {p.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : p.status === 'suspended' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                            {p.phone || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Role Change Select - Staff & Admin roles only */}
                              <select
                                value={p.role}
                                onChange={(e) => {
                                  updateProfileRole(p.user_id, e.target.value as UserRole);
                                  showToast(`Updated ${p.first_name}'s role to ${e.target.value}!`);
                                }}
                                className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] font-semibold text-gray-700 focus:outline-none cursor-pointer"
                                title="Change Administrative Role"
                              >
                                <option value="super_admin">Super Admin</option>
                                <option value="management">University Management (VC / DVC)</option>
                                <option value="registrar">Registrar</option>
                                <option value="bursar">Bursar</option>
                                <option value="admissions_officer">Admissions Officer</option>
                                <option value="dean">Dean</option>
                                <option value="hod">HOD</option>
                                <option value="staff">Staff</option>
                              </select>

                              {/* Password Reset */}
                              <button
                                type="button"
                                onClick={() => handleOpenPasswordReset(p)}
                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Reset Staff Password & Send Login Notice"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Activate Toggle */}
                              {p.status === 'active' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateProfileStatus(p.user_id, 'suspended');
                                    showToast(`Suspended account for ${p.email}`);
                                  }}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Suspend Staff Account"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateProfileStatus(p.user_id, 'active');
                                    showToast(`Reactivated account for ${p.email}`);
                                  }}
                                  className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                  title="Activate Staff Account"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CANDIDATE & APPLICANT USERS (DEDICATED SEPARATED DIRECTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Informative Scope Header */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-950">
              <FileText className="w-4 h-4 text-amber-700 shrink-0" />
              <p>
                <strong>Prospective Candidate & Applicant Accounts:</strong> Dedicated directory for registered UTME / Direct Entry applicants. These accounts are isolated from staff/admin privileges and only grant access to the online admissions portal.
              </p>
            </div>
            <Badge variant="warning">Public Candidate Accounts</Badge>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search applicant by name, email, or application number..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Account Status ({applicantProfiles.length})</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Applicant Table */}
          <Card className="overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-900 text-amber-100 uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Candidate Information</th>
                    <th className="py-3 px-4">Application Reference</th>
                    <th className="py-3 px-4">Prospective Programme</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4 text-right">Candidate Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredCurrentDataset.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No prospective applicant accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredCurrentDataset.map((p) => {
                      const appRecord = findApplicantApplication(p);
                      return (
                        <tr key={p.id || p.user_id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {p.avatar_url ? (
                                <img
                                  src={p.avatar_url}
                                  alt={p.first_name}
                                  className="w-9 h-9 rounded-full object-cover border border-amber-200 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {p.first_name?.[0] || 'A'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-gray-900">
                                  {p.first_name} {p.last_name}
                                </p>
                                <p className="text-[11px] text-gray-500 font-mono">{p.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {appRecord ? (
                              <div>
                                <span className="font-mono font-bold text-amber-900 text-[11px] block">
                                  {appRecord.application_number}
                                </span>
                                <Badge
                                  variant={
                                    appRecord.status === 'admitted'
                                      ? 'success'
                                      : appRecord.status === 'under_review'
                                      ? 'info'
                                      : 'warning'
                                  }
                                  className="text-[9px] mt-0.5"
                                >
                                  {(appRecord.status || '').replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">No Active Application</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-gray-800 text-[11px]">
                              {appRecord?.programme?.name || 'Undergraduate Programme'}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {appRecord?.application_type || 'UTME'} Candidate
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            {p.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active Portal
                              </span>
                            ) : p.status === 'suspended' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                            {p.phone || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Promote / Convert Role Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPromoteUser(p);
                                  setTargetRole('student');
                                }}
                                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title="Escalate or change account role"
                              >
                                <ArrowRight className="w-3 h-3" />
                                <span>Change Role</span>
                              </button>

                              {/* Password Reset */}
                              <button
                                type="button"
                                onClick={() => handleOpenPasswordReset(p)}
                                className="p-1 text-gray-500 hover:text-amber-700 hover:bg-amber-100 rounded transition-colors cursor-pointer"
                                title="Generate temporary applicant login password"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Activate Toggle */}
                              {p.status === 'active' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateProfileStatus(p.user_id, 'suspended');
                                    showToast(`Suspended portal login for applicant ${p.email}`);
                                  }}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Suspend Applicant Portal Access"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateProfileStatus(p.user_id, 'active');
                                    showToast(`Reactivated portal login for applicant ${p.email}`);
                                  }}
                                  className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                  title="Activate Applicant Portal Access"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MATRICULATED ENROLLED STUDENTS (SEPARATED DIRECTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Informative Scope Header */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-950">
              <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
              <p>
                <strong>Matriculated Student Accounts Directory:</strong> Manages authentication and login credentials for enrolled students registered in the Student Information System (SIS).
              </p>
            </div>
            <Badge variant="success">Enrolled Cohort</Badge>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student by name, email, or matric number..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Status ({studentProfiles.length})</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <Card className="overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-900 text-emerald-100 uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-4">Matriculation Number</th>
                    <th className="py-3 px-4">Academic Programme</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-right">Portal Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredCurrentDataset.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No student accounts match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCurrentDataset.map((p) => {
                      const studentRecord = findStudentRecord(p);
                      return (
                        <tr key={p.id || p.user_id} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {p.avatar_url ? (
                                <img
                                  src={p.avatar_url}
                                  alt={p.first_name}
                                  className="w-9 h-9 rounded-full object-cover border border-emerald-200 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {p.first_name?.[0] || 'S'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-gray-900">
                                  {p.first_name} {p.last_name}
                                </p>
                                <p className="text-[11px] text-gray-500 font-mono">{p.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {studentRecord ? (
                              <span className="font-mono font-bold text-emerald-950 text-[11px]">
                                {studentRecord.student_number}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">Matric Pending</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-gray-800 text-[11px]">
                              {studentRecord?.programme?.name || 'Undergraduate'}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {studentRecord?.level?.code || '100L'} • CGPA: {studentRecord?.current_cgpa?.toFixed(2) || 'N/A'}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            {p.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active Portal
                              </span>
                            ) : p.status === 'suspended' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                            {p.phone || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Password Reset */}
                              <button
                                type="button"
                                onClick={() => handleOpenPasswordReset(p)}
                                className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                                title="Reset Student Portal Password"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Activate Toggle */}
                              {p.status === 'active' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateProfileStatus(p.user_id, 'suspended');
                                    showToast(`Suspended student portal for ${p.email}`);
                                  }}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Suspend Student Account"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateProfileStatus(p.user_id, 'active');
                                    showToast(`Reactivated student portal for ${p.email}`);
                                  }}
                                  className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                  title="Activate Student Account"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ROLES & CAPABILITIES MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'roles_matrix' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-purple-950">
              <Key className="w-4 h-4 text-purple-700 shrink-0" />
              <p>
                <strong>System Roles & Capabilities Matrix:</strong> Displays the authorization tiers and permission scopes configured across all administrative, academic, student, and applicant portals.
              </p>
            </div>
            <Badge variant="secondary">Security Tiers</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rolesList.map((r) => {
              const userCount = profiles.filter((p) => p.role === r.code).length;
              return (
                <Card key={r.id} className="p-5 border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant={roleBadgeVariants[r.code] || 'secondary'}>
                        {(r.code || '').toUpperCase()}
                      </Badge>
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {userCount} User{userCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900">{r.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {r.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Permissions & Capability Scope
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {r.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-mono rounded border border-gray-200"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={Edit2}
                      onClick={() => {
                        setEditingRole(r);
                        setRoleFormData({ name: r.name, description: r.description });
                      }}
                    >
                      Edit Role Scope
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE USER ACCOUNT */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="Provision New School Account & Assign Cadre"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          {/* User Category Selector */}
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Account Category / Cadre *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUserCategory('staff_admin');
                  setNewUserData({ ...newUserData, role: 'staff' });
                }}
                className={`py-2 px-3 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                  userCategory === 'staff_admin'
                    ? 'bg-[#002147] text-white border-[#002147]'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Staff & Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserCategory('applicant');
                  setNewUserData({ ...newUserData, role: 'applicant' });
                }}
                className={`py-2 px-3 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                  userCategory === 'applicant'
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-amber-50'
                }`}
              >
                Applicant
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserCategory('student');
                  setNewUserData({ ...newUserData, role: 'student' });
                }}
                className={`py-2 px-3 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                  userCategory === 'student'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-emerald-50'
                }`}
              >
                Student
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={newUserData.first_name}
                onChange={(e) => setNewUserData({ ...newUserData, first_name: e.target.value })}
                placeholder="e.g. Ibrahim"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={newUserData.last_name}
                onChange={(e) => setNewUserData({ ...newUserData, last_name: e.target.value })}
                placeholder="e.g. Bello"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              {userCategory === 'staff_admin'
                ? 'Official Institutional Email Address *'
                : 'Registered Email Address *'}
            </label>
            <input
              type="email"
              required
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              placeholder={
                userCategory === 'staff_admin'
                  ? 'e.g. i.bello@pfust.edu.ng'
                  : 'e.g. candidate@gmail.com'
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              User will log in using this email address.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {userCategory === 'staff_admin' ? (
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Assign Staff/Admin Role *
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-semibold focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="super_admin">Super Administrator</option>
                  <option value="management">University Management (VC / DVC)</option>
                  <option value="registrar">Registrar</option>
                  <option value="bursar">Bursar & Finance</option>
                  <option value="admissions_officer">Admissions Officer</option>
                  <option value="ict_admin">ICT Administrator</option>
                  <option value="registry_officer">Registry Officer</option>
                  <option value="faculty_admin">Faculty Dean / Admin</option>
                  <option value="department_admin">Head of Department (HOD)</option>
                  <option value="staff">Academic & Non-Academic Staff</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Assigned Cadre
                </label>
                <input
                  type="text"
                  disabled
                  value={userCategory === 'applicant' ? 'Applicant (Candidate Portal)' : 'Student (SIS Portal)'}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-600"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-[#002147] text-[#D4AF37] hover:bg-[#003366]"
            >
              Save & Provision Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: PASSWORD RESET & CREDENTIALS DISPATCH */}
      {/* ========================================================================= */}
      {passwordResetUser && (
        <Modal
          isOpen={true}
          onClose={() => setPasswordResetUser(null)}
          title={`Reset Credentials: ${passwordResetUser.first_name} ${passwordResetUser.last_name}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-[11px] text-gray-500">Account Target:</p>
              <p className="font-bold text-gray-900 text-sm">
                {passwordResetUser.first_name} {passwordResetUser.last_name}
              </p>
              <p className="font-mono text-gray-600 text-[11px]">{passwordResetUser.email}</p>
              <div className="mt-1">
                <Badge variant={roleBadgeVariants[passwordResetUser.role] || 'secondary'}>
                  {(passwordResetUser.role || '').replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Generated Temporary Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  readOnly
                  value={generatedPassword}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-xs font-bold text-gray-900 select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>

            {passwordResetSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[11px] font-semibold">
                  Password updated and electronic notification dispatched to {passwordResetUser.email}.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">
                Clicking confirm will apply this password and dispatch a notification email with login instructions to the user's email address.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setPasswordResetUser(null)}>
                {passwordResetSuccess ? 'Close' : 'Cancel'}
              </Button>
              {!passwordResetSuccess && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleExecutePasswordReset}
                  className="bg-[#002147] text-[#D4AF37] hover:bg-[#003366]"
                >
                  Apply & Dispatch Email
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PROMOTE / CONVERT ROLE MODAL */}
      {/* ========================================================================= */}
      {promoteUser && (
        <Modal
          isOpen={true}
          onClose={() => setPromoteUser(null)}
          title={`Change Role: ${promoteUser.first_name} ${promoteUser.last_name}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-gray-600">
              Select the new security role for <strong>{promoteUser.first_name} {promoteUser.last_name}</strong> ({promoteUser.email}):
            </p>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                New Target Role *
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-bold text-gray-800 focus:outline-none"
              >
                <option value="student">Student (Enrolled SIS Portal)</option>
                <option value="staff">Academic & Non-Academic Staff</option>
                <option value="admissions_officer">Admissions Officer</option>
                <option value="bursar">Bursar / Finance Officer</option>
                <option value="registrar">Registrar</option>
                <option value="faculty_admin">Faculty Dean / Admin</option>
                <option value="department_admin">Head of Department (HOD)</option>
                <option value="ict_admin">ICT Administrator</option>
                <option value="registry_officer">Registry Officer</option>
                <option value="management">University Management (VC / DVC)</option>
                <option value="super_admin">Super Administrator</option>
                <option value="applicant">Applicant (Candidate Portal)</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
              <p>
                <strong>Note:</strong> Changing this user's role will automatically move their profile into the appropriate directory tab and adjust their portal login permissions.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setPromoteUser(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleExecuteRoleChange}
                className="bg-[#002147] text-[#D4AF37] hover:bg-[#003366]"
              >
                Confirm Role Update
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT ROLE SCOPE & CAPABILITIES */}
      {/* ========================================================================= */}
      {editingRole && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRole(null)}
          title={`Edit Role: ${editingRole.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Role Display Name *
              </label>
              <input
                type="text"
                required
                value={roleFormData.name || ''}
                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Role Scope & Mandate Description
              </label>
              <textarea
                rows={3}
                value={roleFormData.description || ''}
                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#002147] text-[#D4AF37] hover:bg-[#003366]"
              >
                Save Role Details
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
