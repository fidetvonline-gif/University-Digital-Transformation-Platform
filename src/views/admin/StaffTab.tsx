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
  Briefcase,
  Layers,
  FileText,
  Printer,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { Staff, Profile } from '../../types/database';
import { useAuth } from '../../lib/auth/AuthContext';

export const StaffTab: React.FC = () => {
  const {
    staffList,
    faculties,
    departments,
    addStaff,
    updateStaff,
    updateStaffStatus,
    resetStaffPassword,
    dispatchedEmails,
  } = useUniversityData();

  const { profile: currentAdminProfile } = useAuth();

  // Modals state
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
  const [staffForPasswordReset, setStaffForPasswordReset] = useState<Staff | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState<{
    staff_id: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    title_prefix: string;
    designation: string;
    staff_category: Staff['staff_category'];
    department_id: string;
    faculty_id: string;
    status: Staff['status'];
    highest_qualification: string;
    specialization: string;
    office_room: string;
    nationality: string;
    state_of_origin: string;
    lga: string;
    address: string;
    next_of_kin_name: string;
    next_of_kin_phone: string;
    next_of_kin_relationship: string;
  }>({
    staff_id: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone: '',
    gender: 'male',
    title_prefix: 'Dr.',
    designation: 'Senior Lecturer',
    staff_category: 'academic',
    department_id: '',
    faculty_id: '',
    status: 'active',
    highest_qualification: 'Ph.D. in Computer Science',
    specialization: 'Artificial Intelligence & Distributed Systems',
    office_room: 'Block B, Faculty of Computing, Room 204',
    nationality: 'Nigerian',
    state_of_origin: 'Lagos',
    lga: 'Ikeja',
    address: 'PFUST Senior Staff Quarters, Block 4, Campus',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    next_of_kin_relationship: 'Spouse',
  });

  // Password reset modal state
  const [customPassword, setCustomPassword] = useState('');
  const [sendPasswordEmail, setSendPasswordEmail] = useState(true);
  const [showPasswordText, setShowPasswordText] = useState(true);
  const [passwordResetResult, setPasswordResetResult] = useState<{
    newPassword: string;
    email: string;
    staffName: string;
    staffId: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Register New Staff State
  const [newStaffData, setNewStaffData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone: '',
    gender: 'male' as 'male' | 'female' | 'other',
    staff_id: `PFUST/ACAD/${new Date().getFullYear()}/0${staffList.length + 10}`,
    designation: 'Lecturer I',
    staff_category: 'academic' as Staff['staff_category'],
    department_id: departments[0]?.id || '',
    faculty_id: faculties[0]?.id || '',
    highest_qualification: 'Ph.D.',
    specialization: 'Computer Science & Software Engineering',
    office_room: 'Faculty Building, Room 102',
    status: 'active' as Staff['status'],
  });

  // Filters
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [cadreFilter, setCadreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Metrics
  const totalStaffCount = staffList.length;
  const academicStaffCount = staffList.filter((s) => s.staff_category === 'academic').length;
  const adminStaffCount = staffList.filter(
    (s) => s.staff_category === 'administrative' || s.staff_category === 'non_academic'
  ).length;
  const executiveStaffCount = staffList.filter((s) => s.staff_category === 'executive').length;
  const activeStaffCount = staffList.filter((s) => s.status === 'active').length;

  const filteredStaffList = staffList.filter((s) => {
    const matchesFaculty = facultyFilter === 'all' || s.faculty_id === facultyFilter;
    const matchesCadre = cadreFilter === 'all' || s.staff_category === cadreFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesFaculty && matchesCadre && matchesStatus;
  });

  // Open Edit Modal
  const handleOpenEdit = (staff: Staff) => {
    setStaffToEdit(staff);
    const prof = (staff.profile || {}) as any;
    setEditFormData({
      staff_id: staff.staff_id || '',
      first_name: staff.profile?.first_name || '',
      last_name: staff.profile?.last_name || '',
      middle_name: prof.middle_name || '',
      email: staff.profile?.email || '',
      phone: staff.profile?.phone || '+234 800 000 0000',
      gender: (staff.profile?.gender as any) || 'male',
      title_prefix: prof.title_prefix || (staff.designation?.toLowerCase().includes('prof') ? 'Prof.' : 'Dr.'),
      designation: staff.designation || 'Lecturer II',
      staff_category: staff.staff_category || 'academic',
      department_id: staff.department_id || departments[0]?.id || '',
      faculty_id: staff.faculty_id || faculties[0]?.id || '',
      status: staff.status || 'active',
      highest_qualification: prof.highest_qualification || 'Ph.D. / M.Sc.',
      specialization: prof.specialization || 'Academic Teaching & Research',
      office_room: prof.office_room || 'Main Campus Faculty Complex',
      nationality: staff.profile?.nationality || 'Nigerian',
      state_of_origin: prof.state_of_origin || 'Rivers',
      lga: prof.lga || 'Port Harcourt',
      address: prof.address || 'PFUST Campus Quarters',
      next_of_kin_name: prof.next_of_kin_name || '',
      next_of_kin_phone: prof.next_of_kin_phone || '',
      next_of_kin_relationship: prof.next_of_kin_relationship || 'Spouse',
    });
  };

  // Save Staff Edits
  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToEdit) return;

    if (!editFormData.staff_id.trim()) {
      alert('Staff ID is required.');
      return;
    }

    const selectedDept = departments.find((d) => d.id === editFormData.department_id);
    const selectedFac = faculties.find((f) => f.id === (editFormData.faculty_id || selectedDept?.faculty_id));

    const staffUpdates: Partial<Staff> = {
      staff_id: editFormData.staff_id.trim().toUpperCase(),
      designation: editFormData.designation.trim(),
      staff_category: editFormData.staff_category,
      department_id: editFormData.department_id,
      faculty_id: selectedFac?.id || editFormData.faculty_id,
      status: editFormData.status,
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
    (profileUpdates as any).title_prefix = editFormData.title_prefix;
    (profileUpdates as any).highest_qualification = editFormData.highest_qualification;
    (profileUpdates as any).specialization = editFormData.specialization;
    (profileUpdates as any).office_room = editFormData.office_room;
    (profileUpdates as any).state_of_origin = editFormData.state_of_origin;
    (profileUpdates as any).lga = editFormData.lga;
    (profileUpdates as any).address = editFormData.address;
    (profileUpdates as any).next_of_kin_name = editFormData.next_of_kin_name;
    (profileUpdates as any).next_of_kin_phone = editFormData.next_of_kin_phone;
    (profileUpdates as any).next_of_kin_relationship = editFormData.next_of_kin_relationship;

    updateStaff(staffToEdit.id, staffUpdates, profileUpdates);

    // Refresh modal if active
    if (selectedStaff && selectedStaff.id === staffToEdit.id) {
      setSelectedStaff({
        ...selectedStaff,
        ...staffUpdates,
        department: selectedDept || selectedStaff.department,
        faculty: selectedFac || selectedStaff.faculty,
        profile: { ...(selectedStaff.profile || {}), ...profileUpdates } as Profile,
      });
    }

    setStaffToEdit(null);
    showToast(
      `Staff records for ${editFormData.first_name} ${editFormData.last_name} (${staffUpdates.staff_id}) updated successfully.`
    );
  };

  // Open Password Reset Modal
  const handleOpenPasswordReset = (staff: Staff) => {
    setStaffForPasswordReset(staff);
    setPasswordResetResult(null);
    setIsCopied(false);
    const autoPass = `PFUST-STF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}!`;
    setCustomPassword(autoPass);
  };

  // Execute Password Reset
  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForPasswordReset) return;

    const res = resetStaffPassword(staffForPasswordReset.id, customPassword, sendPasswordEmail);

    if (res.success && res.password) {
      setPasswordResetResult({
        newPassword: res.password,
        email: res.emailRecipient || staffForPasswordReset.profile?.email || 'staff@pfust.edu.ng',
        staffName: staffForPasswordReset.profile
          ? `${staffForPasswordReset.profile.first_name} ${staffForPasswordReset.profile.last_name}`
          : 'Staff Member',
        staffId: staffForPasswordReset.staff_id,
      });
      showToast(`Password for ${staffForPasswordReset.staff_id} successfully reset!`);
    } else {
      alert(res.message || 'Failed to reset staff password.');
    }
  };

  // Copy password to clipboard
  const handleCopyCredentials = () => {
    if (!passwordResetResult) return;
    const textToCopy = `PFUST Staff Portal Credentials\nStaff Member: ${passwordResetResult.staffName}\nStaff ID: ${passwordResetResult.staffId}\nEmail: ${passwordResetResult.email}\nTemporary Password: ${passwordResetResult.newPassword}\nPortal Login URL: https://pfust.edu.ng/staff-portal`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Handle Quick Status Change
  const handleStatusChange = (staffId: string, newStatus: Staff['status']) => {
    updateStaffStatus(staffId, newStatus);
    const target = staffList.find((s) => s.id === staffId);
    showToast(`Employment status for ${target?.staff_id || 'Staff member'} updated to: ${newStatus.toUpperCase()}`);
  };

  // Handle Register New Staff Form Submit
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffData.first_name.trim() || !newStaffData.last_name.trim() || !newStaffData.email.trim()) {
      alert('Please fill in required staff name and official email.');
      return;
    }

    const selectedDept = departments.find((d) => d.id === newStaffData.department_id);
    const selectedFac = faculties.find((f) => f.id === (newStaffData.faculty_id || selectedDept?.faculty_id));

    const time = Date.now();
    const newProfileId = `prof-stf-${time}`;
    const newUserId = `usr-stf-${time}`;

    const newProfile: Profile = {
      id: newProfileId,
      user_id: newUserId,
      first_name: newStaffData.first_name.trim(),
      last_name: newStaffData.last_name.trim(),
      email: newStaffData.email.trim().toLowerCase(),
      phone: newStaffData.phone.trim() || '+234 800 000 0000',
      gender: newStaffData.gender,
      status: newStaffData.status === 'active' ? 'active' : 'suspended',
      role: 'staff',
      nationality: 'Nigerian',
      avatar_url:
        newStaffData.gender === 'female'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (newProfile as any).middle_name = newStaffData.middle_name;
    (newProfile as any).highest_qualification = newStaffData.highest_qualification;
    (newProfile as any).specialization = newStaffData.specialization;
    (newProfile as any).office_room = newStaffData.office_room;

    addStaff({
      user_id: newUserId,
      profile_id: newProfileId,
      staff_id: newStaffData.staff_id.trim().toUpperCase(),
      department_id: newStaffData.department_id,
      faculty_id: selectedFac?.id || faculties[0]?.id || '',
      designation: newStaffData.designation.trim(),
      staff_category: newStaffData.staff_category,
      status: newStaffData.status,
      profile: newProfile,
      department: selectedDept,
      faculty: selectedFac,
    });

    setIsAddModalOpen(false);
    showToast(`Staff member ${newStaffData.first_name} ${newStaffData.last_name} (${newStaffData.staff_id}) registered successfully.`);

    // Reset Form
    setNewStaffData({
      first_name: '',
      last_name: '',
      middle_name: '',
      email: '',
      phone: '',
      gender: 'male',
      staff_id: `PFUST/ACAD/${new Date().getFullYear()}/0${staffList.length + 11}`,
      designation: 'Lecturer I',
      staff_category: 'academic',
      department_id: departments[0]?.id || '',
      faculty_id: faculties[0]?.id || '',
      highest_qualification: 'Ph.D.',
      specialization: 'Computer Science & Software Engineering',
      office_room: 'Faculty Building, Room 102',
      status: 'active',
    });
  };

  const getCadreBadge = (category: Staff['staff_category']) => {
    switch (category) {
      case 'academic':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Academic Faculty
          </span>
        );
      case 'administrative':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Administrative
          </span>
        );
      case 'executive':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            Executive Leadership
          </span>
        );
      case 'non_academic':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Technical & Lab
          </span>
        );
    }
  };

  const getStatusBadge = (status: Staff['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
            Active
          </Badge>
        );
      case 'on_leave':
        return (
          <Badge variant="warning" className="text-[10px] uppercase font-bold tracking-wider">
            On Leave
          </Badge>
        );
      case 'retired':
        return (
          <Badge variant="neutral" className="text-[10px] uppercase font-bold tracking-wider">
            Retired
          </Badge>
        );
      case 'resigned':
        return (
          <Badge variant="danger" className="text-[10px] uppercase font-bold tracking-wider">
            Resigned
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="text-[10px] uppercase font-bold">
            {status}
          </Badge>
        );
    }
  };

  // Columns definition
  const columns: Column<Staff>[] = [
    {
      header: 'Staff ID',
      accessorKey: 'staff_id',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#002147] text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">
            {row.staff_id}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(row.staff_id);
              showToast(`Staff ID ${row.staff_id} copied!`);
            }}
            title="Copy Staff ID"
            className="text-slate-400 hover:text-[#002147] p-1 rounded transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      header: 'Staff Member',
      sortable: true,
      cell: (row) => {
        const prof = (row.profile || {}) as any;
        const initial = row.profile?.first_name?.charAt(0) || 'S';
        return (
          <div className="flex items-center gap-3">
            {row.profile?.avatar_url ? (
              <img
                src={row.profile.avatar_url}
                alt={row.profile.first_name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-[#002147] to-[#1e3a8a] text-[#D4AF37] font-bold text-xs flex items-center justify-center border border-[#D4AF37]/30 shadow-2xs">
                {initial}
              </div>
            )}
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                {prof.title_prefix ? `${prof.title_prefix} ` : ''}
                {row.profile?.first_name} {prof.middle_name ? `${prof.middle_name} ` : ''}
                {row.profile?.last_name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono block">{row.profile?.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Cadre & Rank',
      accessorKey: 'designation',
      sortable: true,
      cell: (row) => (
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 text-xs block">{row.designation}</span>
          <div>{getCadreBadge(row.staff_category)}</div>
        </div>
      ),
    },
    {
      header: 'Department / Faculty',
      cell: (row) => (
        <div>
          <span className="font-medium text-slate-800 text-xs block truncate max-w-xs">
            {row.department?.name || 'Central Administration'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" />
            {row.faculty?.code || 'REGISTRY / BUR'} • {row.faculty?.name || 'Administrative Unit'}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {getStatusBadge(row.status)}
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value as Staff['status'])}
            aria-label={`Change employment status for ${row.staff_id}`}
            className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="retired">Retired</option>
            <option value="resigned">Resigned</option>
          </select>
        </div>
      ),
    },
    {
      header: 'Admin Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedStaff(row)}
            className="h-8 px-2.5 text-xs text-[#002147] border-slate-200 hover:bg-blue-50/50 hover:border-blue-200 flex items-center gap-1"
            title="View Official Staff Dossier & Identity Card"
          >
            <Eye className="w-3.5 h-3.5 text-[#002147]" />
            <span>Dossier</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-8 px-2.5 text-xs text-amber-700 border-slate-200 hover:bg-amber-50 hover:border-amber-200 flex items-center gap-1"
            title="Edit Staff Bio-Data & Academic Placement"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenPasswordReset(row)}
            className="h-8 px-2.5 text-xs text-purple-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200 flex items-center gap-1"
            title="Reset Portal Password & Dispatch Credentials"
          >
            <Key className="w-3.5 h-3.5 text-purple-600" />
            <span>Reset Pass</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" id="admin-staff-directory-container">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-lg animate-fade-in border border-emerald-500/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white text-xs font-bold px-2 py-0.5 ml-4 rounded hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Metric Ribbon */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              Human Resources & Faculty Directorate
            </span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Full Administrative Controls Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#002147] tracking-tight">
            Academic & Non-Academic Staff Directory ({totalStaffCount})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage professorial faculty, researchers, administrative personnel, and dispatch staff portal credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['Staff ID,Name,Designation,Cadre,Department,Faculty,Email,Phone,Status'].join(',') +
                '\n' +
                staffList
                  .map(
                    (s) =>
                      `"${s.staff_id}","${s.profile?.first_name} ${s.profile?.last_name}","${s.designation}","${s.staff_category}","${s.department?.name || ''}","${s.faculty?.name || ''}","${s.profile?.email || ''}","${s.profile?.phone || ''}","${s.status}"`
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `pfust_staff_directory_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast('Staff directory exported to CSV.');
            }}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Register New Staff</span>
          </Button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Staff Registry
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalStaffCount}</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Full institutional headcount</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Academic Faculty
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-blue-900">{academicStaffCount}</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Teaching & Research cadre</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            Administrative
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-900">{adminStaffCount}</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Registry, Bursary & Labs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
            Executive Leadership
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-purple-900">{executiveStaffCount}</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Deans, Directors, Principal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Active Deployments
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-900">{activeStaffCount}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {totalStaffCount > 0 ? Math.round((activeStaffCount / totalStaffCount) * 100) : 100}% Active Duty
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Staff:</span>
          </div>

          {/* Faculty Filter */}
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
          >
            <option value="all">All Faculties</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>

          {/* Cadre Filter */}
          <select
            value={cadreFilter}
            onChange={(e) => setCadreFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
          >
            <option value="all">All Cadres</option>
            <option value="academic">Academic Faculty</option>
            <option value="administrative">Administrative</option>
            <option value="non_academic">Technical / Lab</option>
            <option value="executive">Executive Leadership</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="retired">Retired</option>
            <option value="resigned">Resigned</option>
          </select>

          {(facultyFilter !== 'all' || cadreFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setFacultyFilter('all');
                setCadreFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline px-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredStaffList.length}</span> of {totalStaffCount}{' '}
          staff records
        </div>
      </div>

      {/* Main Staff DataTable */}
      <DataTable
        data={filteredStaffList}
        columns={columns}
        searchPlaceholder="Search staff by name, staff ID, designation, official email, department, or faculty..."
        exportFileName="pfust-staff-directory"
      />

      {/* 1. VIEW OFFICIAL STAFF DOSSIER & ID CARD MODAL */}
      {selectedStaff && (
        <Modal
          isOpen={!!selectedStaff}
          onClose={() => setSelectedStaff(null)}
          title="University Staff Dossier & Identity Record"
          subtitle={`Official Human Resources Record • Staff ID: ${selectedStaff.staff_id}`}
        >
          <div className="space-y-6 text-xs" id="staff-dossier-print-view">
            {/* Visual Staff ID Card Banner */}
            <div className="bg-linear-to-r from-[#002147] via-[#002b5c] to-[#0a3a75] p-5 rounded-2xl border-2 border-[#D4AF37]/50 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  {selectedStaff.profile?.avatar_url ? (
                    <img
                      src={selectedStaff.profile.avatar_url}
                      alt={selectedStaff.profile.first_name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#D4AF37] shadow-md shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-[#D4AF37] flex items-center justify-center font-bold text-xl text-[#D4AF37] shrink-0">
                      {selectedStaff.profile?.first_name?.charAt(0) || 'S'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                        PRIME FORM UNIVERSITY OF SCIENCE & TECH
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {(selectedStaff.profile as any)?.title_prefix ? `${(selectedStaff.profile as any).title_prefix} ` : ''}
                      {selectedStaff.profile?.first_name}{' '}
                      {(selectedStaff.profile as any)?.middle_name ? `${(selectedStaff.profile as any).middle_name} ` : ''}
                      {selectedStaff.profile?.last_name}
                    </h3>
                    <p className="text-xs text-blue-200 font-medium mt-0.5">
                      {selectedStaff.designation}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono bg-white/15 px-2 py-0.5 rounded text-[11px] text-[#D4AF37] font-bold border border-white/10">
                        {selectedStaff.staff_id}
                      </span>
                      {getCadreBadge(selectedStaff.staff_category)}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                  <span className="text-[10px] text-blue-200 uppercase tracking-wider block font-semibold">
                    Staff Identity Status
                  </span>
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider block mt-0.5">
                    {selectedStaff.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-blue-300 font-mono block mt-1">
                    Issued: {new Date(selectedStaff.created_at || '2026-01-01').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Structured Dossier Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section 1: Bio-Data & Personal Contact */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Users className="w-3.5 h-3.5 text-[#002147]" />
                  <span>Personal Bio-Data & Contact</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                    <span className="font-medium text-slate-800 capitalize">
                      {selectedStaff.profile?.gender || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Nationality</span>
                    <span className="font-medium text-slate-800">
                      {selectedStaff.profile?.nationality || 'Nigerian'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Email</span>
                    <span className="font-mono text-slate-800 font-semibold break-all">
                      {selectedStaff.profile?.email || 'staff@pfust.edu.ng'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Telephone Contact</span>
                    <span className="font-medium text-slate-800">
                      {selectedStaff.profile?.phone || '+234 800 000 0000'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">State / LGA of Origin</span>
                    <span className="font-medium text-slate-800">
                      {(selectedStaff.profile as any)?.state_of_origin || 'Lagos'} /{' '}
                      {(selectedStaff.profile as any)?.lga || 'Ikeja'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Campus / Residence</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {(selectedStaff.profile as any)?.address || 'Senior Staff Quarters, Campus'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Academic & Administrative Placement */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#002147]" />
                  <span>Institutional Deployment</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty</span>
                    <span className="font-semibold text-slate-900 block truncate">
                      {selectedStaff.faculty?.name || 'Faculty of Computing'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Code: {selectedStaff.faculty?.code || 'FCS'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Department</span>
                    <span className="font-semibold text-slate-900 block truncate">
                      {selectedStaff.department?.name || 'Department of Computer Science'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Code: {selectedStaff.department?.code || 'CSC'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cadre & Category</span>
                    <span className="font-medium text-slate-800 capitalize">
                      {selectedStaff.staff_category?.replace('_', ' ')} Cadre
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Office Location</span>
                    <span className="font-medium text-slate-800">
                      {(selectedStaff.profile as any)?.office_room || 'Main Faculty Block, Room 204'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Specialization / Academic Focus
                    </span>
                    <span className="font-semibold text-[#002147]">
                      {(selectedStaff.profile as any)?.specialization ||
                        'Computer Networks, Software Architecture, and Distributed Information Systems'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Qualifications & Professional Profile */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Award className="w-3.5 h-3.5 text-[#002147]" />
                  <span>Qualifications & Professional Credentials</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Highest Qualification</span>
                    <span className="font-bold text-slate-800">
                      {(selectedStaff.profile as any)?.highest_qualification ||
                        'Ph.D. in Computer Science & Engineering'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation & Rank</span>
                    <span className="font-medium text-slate-800">{selectedStaff.designation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Appointment Date</span>
                    <span className="font-medium text-slate-800">
                      {new Date(selectedStaff.created_at || '2020-01-01').toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Emergency Contact & Next of Kin */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#002147]" />
                  <span>Emergency & Next of Kin</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Next of Kin Name</span>
                    <span className="font-bold text-slate-800">
                      {(selectedStaff.profile as any)?.next_of_kin_name || 'Dr. (Mrs.) B. Adeyemi'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Relationship</span>
                    <span className="font-medium text-slate-800">
                      {(selectedStaff.profile as any)?.next_of_kin_relationship || 'Spouse'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergency Phone</span>
                    <span className="font-medium text-slate-800">
                      {(selectedStaff.profile as any)?.next_of_kin_phone || '+234 803 999 1100'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Credentials & Security Overview */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                  Staff Portal SSO Status: Active • Multi-factor Authentication Ready
                </span>
                <p className="text-xs text-blue-800 mt-0.5">
                  Staff ID: <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">{selectedStaff.staff_id}</code> • Official Email:{' '}
                  <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">{selectedStaff.profile?.email}</code>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStaff(null);
                    handleOpenPasswordReset(selectedStaff);
                  }}
                  className="bg-white text-purple-800 border-purple-300 hover:bg-purple-50 text-xs flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Reset Portal Password</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const printContent = document.getElementById('staff-dossier-print-view');
                    if (printContent) {
                      window.print();
                    }
                  }}
                  className="text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Print Dossier</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStaff(null);
                  handleOpenEdit(selectedStaff);
                }}
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                Edit Staff Records
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedStaff(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. EDIT STAFF RECORDS MODAL */}
      {staffToEdit && (
        <Modal
          isOpen={!!staffToEdit}
          onClose={() => setStaffToEdit(null)}
          title="Edit University Staff Records"
          subtitle={`Update bio-data, academic rank, department, and employment placement for ${staffToEdit.staff_id}`}
        >
          <form onSubmit={handleSaveStaffEdit} className="space-y-4 text-xs">
            {/* Section 1: Basic Bio-Data */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block border-b border-slate-200 pb-1">
                1. Personal Bio-Data & Identity
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Title</label>
                  <select
                    value={editFormData.title_prefix}
                    onChange={(e) => setEditFormData({ ...editFormData, title_prefix: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  >
                    <option value="Prof.">Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Engr.">Engr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Barr.">Barr.</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={editFormData.middle_name}
                    onChange={(e) => setEditFormData({ ...editFormData, middle_name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, gender: e.target.value as 'male' | 'female' | 'other' })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Institutional Deployment & Cadre */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block border-b border-slate-200 pb-1">
                2. Academic / Administrative Placement
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff ID *</label>
                  <input
                    type="text"
                    value={editFormData.staff_id}
                    onChange={(e) => setEditFormData({ ...editFormData, staff_id: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / Rank *</label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    required
                    placeholder="e.g. Professor, Senior Lecturer, HOD"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff Cadre *</label>
                  <select
                    value={editFormData.staff_category}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        staff_category: e.target.value as Staff['staff_category'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  >
                    <option value="academic">Academic Faculty</option>
                    <option value="administrative">Administrative</option>
                    <option value="non_academic">Technical / Lab Staff</option>
                    <option value="executive">Executive Leadership (Dean/Director/Bursar)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty *</label>
                  <select
                    value={editFormData.faculty_id}
                    onChange={(e) => {
                      const facId = e.target.value;
                      const relatedDepts = departments.filter((d) => d.faculty_id === facId);
                      setEditFormData({
                        ...editFormData,
                        faculty_id: facId,
                        department_id: relatedDepts[0]?.id || editFormData.department_id,
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  >
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Department *</label>
                  <select
                    value={editFormData.department_id}
                    onChange={(e) => {
                      const dept = departments.find((d) => d.id === e.target.value);
                      setEditFormData({
                        ...editFormData,
                        department_id: e.target.value,
                        faculty_id: dept?.faculty_id || editFormData.faculty_id,
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Status *</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value as Staff['status'] })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  >
                    <option value="active">Active Duty</option>
                    <option value="on_leave">On Sabbatical / Leave</option>
                    <option value="retired">Retired</option>
                    <option value="resigned">Resigned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={editFormData.highest_qualification}
                    onChange={(e) => setEditFormData({ ...editFormData, highest_qualification: e.target.value })}
                    placeholder="e.g. Ph.D. in Computer Science"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office / Room Location</label>
                  <input
                    type="text"
                    value={editFormData.office_room}
                    onChange={(e) => setEditFormData({ ...editFormData, office_room: e.target.value })}
                    placeholder="e.g. Block B, Room 204"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialization / Academic Focus</label>
                <input
                  type="text"
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  placeholder="e.g. Machine Learning, Cybersecurity & Cloud Infrastructure"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                />
              </div>
            </div>

            {/* Section 3: Next of Kin */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block border-b border-slate-200 pb-1">
                3. Next of Kin & Emergency
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next of Kin Name</label>
                  <input
                    type="text"
                    value={editFormData.next_of_kin_name}
                    onChange={(e) => setEditFormData({ ...editFormData, next_of_kin_name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={editFormData.next_of_kin_relationship}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, next_of_kin_relationship: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={editFormData.next_of_kin_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, next_of_kin_phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002147]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setStaffToEdit(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Staff Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. RESET STAFF PORTAL PASSWORD MODAL */}
      {staffForPasswordReset && (
        <Modal
          isOpen={!!staffForPasswordReset}
          onClose={() => {
            setStaffForPasswordReset(null);
            setPasswordResetResult(null);
          }}
          title="Reset Staff Portal Credentials"
          subtitle={`Generate secure temporary password for ${staffForPasswordReset.staff_id}`}
        >
          <div className="space-y-4 text-xs">
            {!passwordResetResult ? (
              <form onSubmit={handleExecutePasswordReset} className="space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Target Staff Member:</span>
                    <span className="font-bold text-slate-900">
                      {staffForPasswordReset.profile?.first_name} {staffForPasswordReset.profile?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Institutional Staff ID:</span>
                    <span className="font-mono font-bold text-[#002147]">{staffForPasswordReset.staff_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Designation:</span>
                    <span className="font-semibold text-slate-800">{staffForPasswordReset.designation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Registered Official Email:</span>
                    <span className="font-mono text-slate-800">{staffForPasswordReset.profile?.email}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Temporary Security Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const autoPass = `PFUST-STF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}!`;
                        setCustomPassword(autoPass);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordText ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Staff member will be prompted to change this temporary password upon first login.
                  </p>
                </div>

                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="send_staff_email"
                    checked={sendPasswordEmail}
                    onChange={(e) => setSendPasswordEmail(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <label htmlFor="send_staff_email" className="font-bold text-purple-950 block">
                      Dispatch official credentials notice to staff email
                    </label>
                    <span className="text-[11px] text-purple-800">
                      An official encrypted email with login instructions and portal URL will be delivered to{' '}
                      <strong>{staffForPasswordReset.profile?.email}</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setStaffForPasswordReset(null);
                      setPasswordResetResult(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Execute Password Reset</span>
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-sm">Credentials Reset Complete!</h4>
                  <p className="text-emerald-700 text-xs">
                    The portal login password for <strong>{passwordResetResult.staffName}</strong> has been updated.
                  </p>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 text-xs">STAFF CREDENTIALS</span>
                    <Badge variant="success" className="text-[10px]">
                      LIVE
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Staff ID</span>
                    <span className="text-[#D4AF37] font-bold text-sm">{passwordResetResult.staffId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Email</span>
                    <span className="text-white text-xs">{passwordResetResult.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Temporary Password</span>
                    <span className="text-emerald-400 font-bold text-base bg-slate-800 px-2 py-1 rounded block mt-0.5">
                      {passwordResetResult.newPassword}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Staff Portal URL</span>
                    <span className="text-blue-300 text-xs">https://pfust.edu.ng/staff-portal</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCredentials}
                    className="flex items-center gap-1.5 flex-1"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setStaffForPasswordReset(null);
                      setPasswordResetResult(null);
                    }}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 4. REGISTER NEW STAFF MEMBER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register University Staff Member"
        subtitle="Onboard new academic faculty member, researcher, or administrative staff"
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={newStaffData.first_name}
                onChange={(e) => setNewStaffData({ ...newStaffData, first_name: e.target.value })}
                required
                placeholder="e.g. Samuel"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                value={newStaffData.middle_name}
                onChange={(e) => setNewStaffData({ ...newStaffData, middle_name: e.target.value })}
                placeholder="e.g. Chukwuma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={newStaffData.last_name}
                onChange={(e) => setNewStaffData({ ...newStaffData, last_name: e.target.value })}
                required
                placeholder="e.g. Eze"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Official Email *
              </label>
              <input
                type="email"
                value={newStaffData.email}
                onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                placeholder="s.eze@pfust.edu.ng"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Staff ID *
              </label>
              <input
                type="text"
                value={newStaffData.staff_id}
                onChange={(e) => setNewStaffData({ ...newStaffData, staff_id: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={newStaffData.phone}
                onChange={(e) => setNewStaffData({ ...newStaffData, phone: e.target.value })}
                placeholder="+234 803 000 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Designation / Rank *
              </label>
              <input
                type="text"
                value={newStaffData.designation}
                onChange={(e) => setNewStaffData({ ...newStaffData, designation: e.target.value })}
                placeholder="e.g. Senior Lecturer, Admissions Analyst"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Staff Cadre *</label>
              <select
                value={newStaffData.staff_category}
                onChange={(e) =>
                  setNewStaffData({
                    ...newStaffData,
                    staff_category: e.target.value as Staff['staff_category'],
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#002147]"
              >
                <option value="academic">Academic Faculty (Teaching & Research)</option>
                <option value="administrative">Administrative Cadre</option>
                <option value="non_academic">Technical / Laboratory Staff</option>
                <option value="executive">Executive Leadership (Dean/Director)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Department *</label>
              <select
                value={newStaffData.department_id}
                onChange={(e) => {
                  const dept = departments.find((d) => d.id === e.target.value);
                  setNewStaffData({
                    ...newStaffData,
                    department_id: e.target.value,
                    faculty_id: dept?.faculty_id || newStaffData.faculty_id,
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Highest Qualification
              </label>
              <input
                type="text"
                value={newStaffData.highest_qualification}
                onChange={(e) => setNewStaffData({ ...newStaffData, highest_qualification: e.target.value })}
                placeholder="e.g. Ph.D., M.Sc., B.Sc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Office / Room Location
              </label>
              <input
                type="text"
                value={newStaffData.office_room}
                onChange={(e) => setNewStaffData({ ...newStaffData, office_room: e.target.value })}
                placeholder="e.g. Faculty Complex, Room 204"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save & Register Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
