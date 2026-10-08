import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Building,
  GraduationCap,
  CheckCircle2,
  Eye,
  Lock,
  AlertCircle,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { Programme, Faculty, Department, DegreeType, Payment, Receipt } from '../../types/database';
import { formatNaira } from '../../lib/utils';

export const AcademicsTab: React.FC = () => {
  const {
    faculties,
    departments,
    programmes,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addProgramme,
    updateProgramme,
    deleteProgramme,
    toggleProgrammeAdmission,
    toggleAllProgrammesAdmission,
  } = useUniversityData();

  const [activeSubTab, setActiveSubTab] = useState<'programmes' | 'faculties' | 'departments'>('programmes');

  // Filter state for programmes
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [admissionFilter, setAdmissionFilter] = useState<'all' | 'open' | 'closed'>('all');

  // Notification Toast state
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'danger' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Programme Modals
  const [isAddProgModalOpen, setIsAddProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<Programme | null>(null);
  const [deletingProg, setDeletingProg] = useState<Programme | null>(null);
  const [viewingProg, setViewingProg] = useState<Programme | null>(null);

  // Faculty Modals
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);

  // Department Modals
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  // Form State: New Programme
  const [newProg, setNewProg] = useState({
    name: '',
    code: '',
    faculty_id: faculties[0]?.id || '',
    department_id: departments[0]?.id || '',
    degree_type: 'B.Sc.' as DegreeType,
    duration_years: 4,
    jamb_cutoff_score: 180,
    tuition_fee_ngn: 150000,
    admission_status: 'open' as 'open' | 'closed' | 'extended',
    description: '',
    entry_requirements: [
      '5 O-Level Credit passes in English, Mathematics, and relevant science subjects in no more than 2 sittings',
      'JAMB UTME minimum score requirement',
    ],
    career_prospects: 'Software Architect, Systems Analyst, Research Engineer',
  });

  // Form State: Edit Programme
  const [editProgForm, setEditProgForm] = useState<{
    name: string;
    code: string;
    faculty_id: string;
    department_id: string;
    degree_type: DegreeType;
    duration_years: number;
    jamb_cutoff_score: number;
    tuition_fee_ngn: number;
    admission_status: 'open' | 'closed' | 'extended';
    description: string;
    entry_requirements: string;
    career_prospects: string;
  }>({
    name: '',
    code: '',
    faculty_id: '',
    department_id: '',
    degree_type: 'B.Sc.',
    duration_years: 4,
    jamb_cutoff_score: 180,
    tuition_fee_ngn: 150000,
    admission_status: 'open',
    description: '',
    entry_requirements: '',
    career_prospects: '',
  });

  // Faculty Form State
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    code: '',
    description: '',
    dean_name: '',
    dean_email: '',
    established_year: 2024,
    status: 'active' as 'active' | 'archived',
  });

  // Department Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    faculty_id: faculties[0]?.id || '',
    hod_name: '',
    hod_email: '',
    status: 'active' as 'active' | 'archived',
  });

  // Handle Add Programme Submit
  const handleAddProgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProg.name || !newProg.code) return;

    addProgramme({
      name: newProg.name,
      code: newProg.code,
      faculty_id: newProg.faculty_id || faculties[0]?.id || '',
      department_id: newProg.department_id || departments[0]?.id || '',
      degree_type: newProg.degree_type,
      duration_years: Number(newProg.duration_years),
      total_credits_required: 140,
      jamb_cutoff_score: Number(newProg.jamb_cutoff_score),
      tuition_fee_ngn: Number(newProg.tuition_fee_ngn),
      tuition_per_session_ngn: Number(newProg.tuition_fee_ngn),
      admission_status: newProg.admission_status,
      application_availability: newProg.admission_status === 'open' || newProg.admission_status === 'extended',
      status: 'active',
      description: newProg.description,
      entry_requirements: newProg.entry_requirements,
      career_prospects: newProg.career_prospects.split(',').map((s) => s.trim()).filter(Boolean),
    });

    setIsAddProgModalOpen(false);
    showNotification(`Degree programme "${newProg.name}" created successfully!`, 'success');
  };

  // Open Edit Programme Modal
  const openEditProgrammeModal = (prog: Programme) => {
    setEditingProg(prog);
    setEditProgForm({
      name: prog.name,
      code: prog.code,
      faculty_id: prog.faculty_id,
      department_id: prog.department_id,
      degree_type: prog.degree_type,
      duration_years: prog.duration_years,
      jamb_cutoff_score: prog.jamb_cutoff_score ?? 180,
      tuition_fee_ngn: prog.tuition_fee_ngn ?? prog.tuition_per_session_ngn ?? 150000,
      admission_status: prog.admission_status ?? (prog.application_availability ? 'open' : 'closed'),
      description: prog.description || '',
      entry_requirements: Array.isArray(prog.entry_requirements) ? prog.entry_requirements.join('\n') : '',
      career_prospects: Array.isArray(prog.career_prospects) ? prog.career_prospects.join(', ') : '',
    });
  };

  // Handle Save Edit Programme
  const handleEditProgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProg) return;

    const isOpen = editProgForm.admission_status === 'open' || editProgForm.admission_status === 'extended';

    updateProgramme(editingProg.id, {
      name: editProgForm.name,
      code: editProgForm.code,
      faculty_id: editProgForm.faculty_id,
      department_id: editProgForm.department_id,
      degree_type: editProgForm.degree_type,
      duration_years: Number(editProgForm.duration_years),
      jamb_cutoff_score: Number(editProgForm.jamb_cutoff_score),
      tuition_fee_ngn: Number(editProgForm.tuition_fee_ngn),
      tuition_per_session_ngn: Number(editProgForm.tuition_fee_ngn),
      admission_status: editProgForm.admission_status,
      application_availability: isOpen,
      description: editProgForm.description,
      entry_requirements: editProgForm.entry_requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      career_prospects: editProgForm.career_prospects.split(',').map((s) => s.trim()).filter(Boolean),
    });

    setEditingProg(null);
    showNotification(`Programme "${editProgForm.name}" updated successfully!`, 'success');
  };

  // Handle Confirm Delete Programme
  const handleConfirmDeleteProgramme = () => {
    if (!deletingProg) return;
    const progName = deletingProg.name;
    deleteProgramme(deletingProg.id);
    setDeletingProg(null);
    showNotification(`Degree programme "${progName}" deleted successfully.`, 'danger');
  };

  // Quick Inline Admission Status Toggle
  const handleToggleAdmission = (prog: Programme) => {
    const isCurrentlyOpen = prog.admission_status === 'open' || (prog.application_availability ?? true);
    const nextStatus = isCurrentlyOpen ? 'closed' : 'open';
    toggleProgrammeAdmission(prog.id, nextStatus);
    showNotification(
      `Admission for "${prog.name}" is now ${nextStatus.toUpperCase()}!`,
      nextStatus === 'open' ? 'success' : 'info'
    );
  };

  // Bulk Admission Toggles
  const handleBulkToggle = (status: 'open' | 'closed') => {
    toggleAllProgrammesAdmission(status);
    showNotification(
      `All undergraduate degree programmes are now ${status.toUpperCase()} for applications.`,
      status === 'open' ? 'success' : 'info'
    );
  };

  // Faculty Handlers
  const handleAddFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name || !facultyForm.code) return;
    addFaculty({
      name: facultyForm.name,
      code: facultyForm.code,
      description: facultyForm.description,
      dean_name: facultyForm.dean_name,
      dean_email: facultyForm.dean_email,
      established_year: Number(facultyForm.established_year),
      status: facultyForm.status,
    });
    setIsAddFacultyModalOpen(false);
    showNotification(`Faculty "${facultyForm.name}" created successfully!`, 'success');
  };

  const handleEditFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    updateFaculty(editingFaculty.id, {
      name: facultyForm.name,
      code: facultyForm.code,
      description: facultyForm.description,
      dean_name: facultyForm.dean_name,
      dean_email: facultyForm.dean_email,
      established_year: Number(facultyForm.established_year),
      status: facultyForm.status,
    });
    setEditingFaculty(null);
    showNotification(`Faculty "${facultyForm.name}" updated successfully!`, 'success');
  };

  const handleConfirmDeleteFaculty = () => {
    if (!deletingFaculty) return;
    const name = deletingFaculty.name;
    deleteFaculty(deletingFaculty.id);
    setDeletingFaculty(null);
    showNotification(`Faculty "${name}" deleted.`, 'danger');
  };

  // Department Handlers
  const handleAddDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    addDepartment({
      name: deptForm.name,
      code: deptForm.code,
      faculty_id: deptForm.faculty_id || faculties[0]?.id || '',
      hod_name: deptForm.hod_name,
      hod_email: deptForm.hod_email,
      status: deptForm.status,
    });
    setIsAddDeptModalOpen(false);
    showNotification(`Department "${deptForm.name}" created successfully!`, 'success');
  };

  const handleEditDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    updateDepartment(editingDept.id, {
      name: deptForm.name,
      code: deptForm.code,
      faculty_id: deptForm.faculty_id,
      hod_name: deptForm.hod_name,
      hod_email: deptForm.hod_email,
      status: deptForm.status,
    });
    setEditingDept(null);
    showNotification(`Department "${deptForm.name}" updated successfully!`, 'success');
  };

  const handleConfirmDeleteDept = () => {
    if (!deletingDept) return;
    const name = deletingDept.name;
    deleteDepartment(deletingDept.id);
    setDeletingDept(null);
    showNotification(`Department "${name}" deleted.`, 'danger');
  };

  // Filtered Programmes
  const filteredProgrammes = programmes.filter((p) => {
    const matchesFaculty = facultyFilter === 'all' || p.faculty_id === facultyFilter;
    const isOpen = p.admission_status === 'open' || (p.application_availability ?? true);
    const matchesAdmission =
      admissionFilter === 'all' ||
      (admissionFilter === 'open' && isOpen) ||
      (admissionFilter === 'closed' && !isOpen);
    return matchesFaculty && matchesAdmission;
  });

  const openCount = programmes.filter((p) => p.admission_status === 'open' || (p.application_availability ?? true)).length;
  const closedCount = programmes.length - openCount;

  // Columns for Programmes DataTable
  const programmeColumns: Column<Programme>[] = [
    {
      header: 'Course Code',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-[#0F2137] bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Programme & Department',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => {
        const fac = faculties.find((f) => f.id === row.faculty_id);
        const dept = departments.find((d) => d.id === row.department_id);
        return (
          <div className="space-y-0.5 max-w-sm">
            <span className="font-bold text-slate-900 text-xs block hover:text-[#0F2137]">
              {row.name}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="text-amber-800 font-semibold">{row.degree_type}</span>
              <span>•</span>
              <span>{row.duration_years} Years</span>
              <span>•</span>
              <span className="text-slate-600 truncate">{fac?.code || 'FAC'} / {dept?.code || 'DEPT'}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'JAMB Cut-Off',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
          {row.jamb_cutoff_score ?? 180}+
        </span>
      ),
    },
    {
      header: 'Tuition / Session',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {formatNaira(row.tuition_fee_ngn ?? row.tuition_per_session_ngn ?? 150000)}
        </span>
      ),
    },
    {
      header: 'Admission Status (Live Toggle)',
      sortable: true,
      cell: (row) => {
        const isOpen = row.admission_status === 'open' || (row.application_availability ?? true);
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleAdmission(row)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                isOpen
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 hover:scale-102'
                  : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 hover:scale-102'
              }`}
              title={isOpen ? 'Click to CLOSE admission for this programme' : 'Click to OPEN admission for this programme'}
            >
              {isOpen ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>OPEN FOR ADMISSION</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>CLOSED</span>
                </>
              )}
            </button>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingProg(row)}
            className="p-1.5 text-slate-500 hover:text-[#0F2137] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View syllabus and requirements"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEditProgrammeModal(row)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit programme details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingProg(row)}
            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete degree programme"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all animate-in fade-in slide-in-from-top-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : feedbackMessage.type === 'danger'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedbackMessage.type === 'danger' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" /> Curriculum & Academic Administration
          </span>
          <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
            Accredited Faculties, Departments & Degree Programmes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer degree offerings, edit curriculum specifications, delete programmes, and control live admission open/closed statuses.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {activeSubTab === 'programmes' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleBulkToggle('open')}
                leftIcon={CheckCircle2}
              >
                Open All Admissions
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-rose-300 text-rose-700 hover:bg-rose-50"
                onClick={() => handleBulkToggle('closed')}
                leftIcon={Lock}
              >
                Close All Admissions
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddProgModalOpen(true)}
                leftIcon={Plus}
              >
                Add Degree Programme
              </Button>
            </>
          )}

          {activeSubTab === 'faculties' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFacultyForm({
                  name: '',
                  code: '',
                  description: '',
                  dean_name: '',
                  dean_email: '',
                  established_year: 2024,
                  status: 'active',
                });
                setIsAddFacultyModalOpen(true);
              }}
              leftIcon={Plus}
            >
              Add Faculty
            </Button>
          )}

          {activeSubTab === 'departments' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDeptForm({
                  name: '',
                  code: '',
                  faculty_id: faculties[0]?.id || '',
                  hod_name: '',
                  hod_email: '',
                  status: 'active',
                });
                setIsAddDeptModalOpen(true);
              }}
              leftIcon={Plus}
            >
              Add Department
            </Button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('programmes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'programmes'
              ? 'bg-[#0F2137] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Degree Programmes ({programmes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faculties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'faculties'
              ? 'bg-[#0F2137] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Accredited Faculties ({faculties.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'departments'
              ? 'bg-[#0F2137] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Academic Departments ({departments.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: DEGREE PROGRAMMES */}
      {activeSubTab === 'programmes' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">Total Degree Offerings</span>
              <span className="text-2xl font-bold text-[#0F2137]">{programmes.length} Programmes</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
              <span className="text-xs text-emerald-700 block font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Admissions Open
              </span>
              <span className="text-2xl font-bold text-emerald-800">{openCount} Programmes</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/40 shadow-xs">
              <span className="text-xs text-rose-700 block font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Admissions Closed
              </span>
              <span className="text-2xl font-bold text-rose-800">{closedCount} Programmes</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">Accreditation Status</span>
              <span className="text-2xl font-bold text-amber-700">100% NUC Approved</span>
            </div>
          </div>

          {/* Quick Filters Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Faculty:
              </span>
              <button
                onClick={() => setFacultyFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  facultyFilter === 'all'
                    ? 'bg-[#0F2137] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({programmes.length})
              </button>
              {faculties.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFacultyFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    facultyFilter === f.id
                      ? 'bg-[#0F2137] text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.code}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="font-bold text-slate-600">Admission Status:</span>
              <button
                onClick={() => setAdmissionFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  admissionFilter === 'all'
                    ? 'bg-[#0F2137] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAdmissionFilter('open')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  admissionFilter === 'open'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Open Only ({openCount})
              </button>
              <button
                onClick={() => setAdmissionFilter('closed')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  admissionFilter === 'closed'
                    ? 'bg-rose-700 text-white'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                Closed Only ({closedCount})
              </button>
            </div>
          </div>

          {/* Programmes Table */}
          <DataTable
            data={filteredProgrammes}
            columns={programmeColumns}
            searchPlaceholder="Search programmes by name, course code or faculty..."
            exportFileName="pfust-degree-programmes"
          />
        </div>
      )}

      {/* SUB-TAB 2: ACCREDITED FACULTIES */}
      {activeSubTab === 'faculties' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculties.map((fac) => {
              const progCount = programmes.filter((p) => p.faculty_id === fac.id).length;
              const deptCount = departments.filter((d) => d.faculty_id === fac.id).length;
              return (
                <div
                  key={fac.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#0F2137] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                        {fac.code}
                      </span>
                      <Badge variant={fac.status === 'active' ? 'success' : 'neutral'} className="text-[10px]">
                        {fac.status?.toUpperCase() || 'ACTIVE'}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-[#0F2137]">{fac.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{fac.description || 'NUC Accredited Faculty'}</p>

                    <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                      <div>
                        <span className="text-slate-400">Dean: </span>
                        <span className="font-semibold text-slate-900">{fac.dean_name || 'Prof. Faculty Dean'}</span>
                      </div>
                      {fac.dean_email && (
                        <div>
                          <span className="text-slate-400">Email: </span>
                          <span className="font-mono text-[11px] text-slate-700">{fac.dean_email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {deptCount} Depts • {progCount} Programmes
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingFaculty(fac);
                          setFacultyForm({
                            name: fac.name,
                            code: fac.code,
                            description: fac.description || '',
                            dean_name: fac.dean_name || '',
                            dean_email: fac.dean_email || '',
                            established_year: fac.established_year || 2024,
                            status: fac.status || 'active',
                          });
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Faculty"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingFaculty(fac)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Faculty"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ACADEMIC DEPARTMENTS */}
      {activeSubTab === 'departments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const parentFac = faculties.find((f) => f.id === dept.faculty_id);
              const progCount = programmes.filter((p) => p.department_id === dept.id).length;
              return (
                <div
                  key={dept.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#0F2137] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {parentFac?.code || 'FAC'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#0F2137]">{dept.name}</h3>

                    <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                      <div>
                        <span className="text-slate-400">Head of Department: </span>
                        <span className="font-semibold text-slate-900">{dept.hod_name || 'Dr. HOD'}</span>
                      </div>
                      {dept.hod_email && (
                        <div>
                          <span className="text-slate-400">HOD Email: </span>
                          <span className="font-mono text-[11px] text-slate-700">{dept.hod_email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{progCount} Degree Offerings</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingDept(dept);
                          setDeptForm({
                            name: dept.name,
                            code: dept.code,
                            faculty_id: dept.faculty_id,
                            hod_name: dept.hod_name || '',
                            hod_email: dept.hod_email || '',
                            status: dept.status || 'active',
                          });
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingDept(dept)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION */}
      {/* ========================================================================= */}

      {/* ADD PROGRAMME MODAL */}
      <Modal
        isOpen={isAddProgModalOpen}
        onClose={() => setIsAddProgModalOpen(false)}
        title="Add NUC-Accredited Degree Programme"
        subtitle="Introduce an accredited bachelor's or postgraduate degree to the university admissions prospectus."
        size="lg"
      >
        <form onSubmit={handleAddProgSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Programme Title *
              </label>
              <input
                type="text"
                value={newProg.name}
                onChange={(e) => setNewProg({ ...newProg, name: e.target.value })}
                placeholder="e.g. B.Sc. Artificial Intelligence"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                value={newProg.code}
                onChange={(e) => setNewProg({ ...newProg, code: e.target.value })}
                placeholder="e.g. AI-BSC"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Faculty *
              </label>
              <select
                value={newProg.faculty_id}
                onChange={(e) => {
                  const facId = e.target.value;
                  const firstDeptInFac = departments.find((d) => d.faculty_id === facId);
                  setNewProg({
                    ...newProg,
                    faculty_id: facId,
                    department_id: firstDeptInFac?.id || newProg.department_id,
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={newProg.department_id}
                onChange={(e) => setNewProg({ ...newProg, department_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              >
                {departments
                  .filter((d) => !newProg.faculty_id || d.faculty_id === newProg.faculty_id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Degree Awarded
              </label>
              <select
                value={newProg.degree_type}
                onChange={(e) => setNewProg({ ...newProg, degree_type: e.target.value as DegreeType })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="B.Sc.">B.Sc.</option>
                <option value="B.Eng.">B.Eng.</option>
                <option value="B.A.">B.A.</option>
                <option value="B.Tech.">B.Tech.</option>
                <option value="LL.B.">LL.B.</option>
                <option value="MBBS">MBBS</option>
                <option value="M.Sc.">M.Sc.</option>
                <option value="Ph.D.">Ph.D.</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Duration (Years)
              </label>
              <input
                type="number"
                min={1}
                max={7}
                value={newProg.duration_years}
                onChange={(e) => setNewProg({ ...newProg, duration_years: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                JAMB Minimum Cut-Off
              </label>
              <input
                type="number"
                value={newProg.jamb_cutoff_score}
                onChange={(e) => setNewProg({ ...newProg, jamb_cutoff_score: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tuition Fee / Session (₦)
              </label>
              <input
                type="number"
                value={newProg.tuition_fee_ngn}
                onChange={(e) => setNewProg({ ...newProg, tuition_fee_ngn: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Initial Admission Status *
              </label>
              <select
                value={newProg.admission_status}
                onChange={(e) => setNewProg({ ...newProg, admission_status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-800"
              >
                <option value="open">OPEN FOR ADMISSIONS</option>
                <option value="closed">CLOSED</option>
                <option value="extended">EXTENDED APPLICATION WINDOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Programme Overview & Description
            </label>
            <textarea
              rows={3}
              value={newProg.description}
              onChange={(e) => setNewProg({ ...newProg, description: e.target.value })}
              placeholder="Detailed overview of curriculum focus, lab training, industry certifications..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Career Prospects (comma-separated)
            </label>
            <input
              type="text"
              value={newProg.career_prospects}
              onChange={(e) => setNewProg({ ...newProg, career_prospects: e.target.value })}
              placeholder="e.g. AI Research Scientist, Machine Learning Engineer, Cloud Architect"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddProgModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Programme
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PROGRAMME MODAL */}
      {editingProg && (
        <Modal
          isOpen={Boolean(editingProg)}
          onClose={() => setEditingProg(null)}
          title={`Edit Degree Programme: ${editingProg.code}`}
          subtitle="Modify degree title, tuition schedule, cut-off score, curriculum specs, and admission availability."
          size="lg"
        >
          <form onSubmit={handleEditProgSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Programme Title *
                </label>
                <input
                  type="text"
                  value={editProgForm.name}
                  onChange={(e) => setEditProgForm({ ...editProgForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  value={editProgForm.code}
                  onChange={(e) => setEditProgForm({ ...editProgForm, code: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Faculty *
                </label>
                <select
                  value={editProgForm.faculty_id}
                  onChange={(e) => setEditProgForm({ ...editProgForm, faculty_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Department *
                </label>
                <select
                  value={editProgForm.department_id}
                  onChange={(e) => setEditProgForm({ ...editProgForm, department_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                >
                  {departments
                    .filter((d) => !editProgForm.faculty_id || d.faculty_id === editProgForm.faculty_id)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Degree Awarded
                </label>
                <select
                  value={editProgForm.degree_type}
                  onChange={(e) => setEditProgForm({ ...editProgForm, degree_type: e.target.value as DegreeType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="B.Sc.">B.Sc.</option>
                  <option value="B.Eng.">B.Eng.</option>
                  <option value="B.A.">B.A.</option>
                  <option value="B.Tech.">B.Tech.</option>
                  <option value="LL.B.">LL.B.</option>
                  <option value="MBBS">MBBS</option>
                  <option value="M.Sc.">M.Sc.</option>
                  <option value="Ph.D.">Ph.D.</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Duration (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={editProgForm.duration_years}
                  onChange={(e) => setEditProgForm({ ...editProgForm, duration_years: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  JAMB Minimum Cut-Off
                </label>
                <input
                  type="number"
                  value={editProgForm.jamb_cutoff_score}
                  onChange={(e) => setEditProgForm({ ...editProgForm, jamb_cutoff_score: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tuition Fee / Session (₦)
                </label>
                <input
                  type="number"
                  value={editProgForm.tuition_fee_ngn}
                  onChange={(e) => setEditProgForm({ ...editProgForm, tuition_fee_ngn: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              {/* Admission Status Selector */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Admission Status Control *
                </label>
                <select
                  value={editProgForm.admission_status}
                  onChange={(e) => setEditProgForm({ ...editProgForm, admission_status: e.target.value as any })}
                  className={`w-full px-3 py-2 border rounded-lg font-bold transition-colors ${
                    editProgForm.admission_status === 'open'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : editProgForm.admission_status === 'extended'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  <option value="open">🟢 OPEN FOR ADMISSION</option>
                  <option value="closed">🔴 CLOSED (Admissions Suspended)</option>
                  <option value="extended">🟡 EXTENDED APPLICATION WINDOW</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Programme Description
              </label>
              <textarea
                rows={3}
                value={editProgForm.description}
                onChange={(e) => setEditProgForm({ ...editProgForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Entry Requirements (One requirement per line)
              </label>
              <textarea
                rows={3}
                value={editProgForm.entry_requirements}
                onChange={(e) => setEditProgForm({ ...editProgForm, entry_requirements: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Career Prospects (comma-separated)
              </label>
              <input
                type="text"
                value={editProgForm.career_prospects}
                onChange={(e) => setEditProgForm({ ...editProgForm, career_prospects: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingProg(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE PROGRAMME CONFIRMATION MODAL */}
      {deletingProg && (
        <Modal
          isOpen={Boolean(deletingProg)}
          onClose={() => setDeletingProg(null)}
          title="Confirm Programme Deletion"
          subtitle="This action will permanently delete the degree programme from the prospectus."
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Delete "{deletingProg.name}"?</span>
              </div>
              <p className="leading-relaxed">
                You are about to delete course code <strong className="font-mono">{deletingProg.code}</strong>.
                Applicants will no longer be able to select or submit applications for this degree programme.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setDeletingProg(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleConfirmDeleteProgramme}
                leftIcon={Trash2}
              >
                Yes, Delete Programme
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW PROGRAMME DETAILS MODAL */}
      {viewingProg && (
        <Modal
          isOpen={Boolean(viewingProg)}
          onClose={() => setViewingProg(null)}
          title={`${viewingProg.name} (${viewingProg.degree_type})`}
          subtitle={`Course Code: ${viewingProg.code} • Duration: ${viewingProg.duration_years} Years`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">JAMB Cut-Off</span>
                <span className="font-bold text-slate-900">{viewingProg.jamb_cutoff_score ?? 180}+</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Tuition / Session</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {formatNaira(viewingProg.tuition_fee_ngn ?? viewingProg.tuition_per_session_ngn ?? 150000)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Faculty</span>
                <span className="font-bold text-slate-900">
                  {faculties.find((f) => f.id === viewingProg.faculty_id)?.name || 'Faculty'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Admission Status</span>
                <Badge
                  variant={
                    viewingProg.admission_status === 'open' || (viewingProg.application_availability ?? true)
                      ? 'success'
                      : 'danger'
                  }
                  className="text-[10px]"
                >
                  {(viewingProg.admission_status || (viewingProg.application_availability ? 'OPEN' : 'CLOSED')).toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {viewingProg.description || 'No description provided.'}
              </p>
            </div>

            {viewingProg.entry_requirements && viewingProg.entry_requirements.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Entry Requirements</h4>
                <ul className="list-disc list-inside space-y-1 bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                  {viewingProg.entry_requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {viewingProg.career_prospects && viewingProg.career_prospects.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Career Pathways</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {viewingProg.career_prospects.map((cp, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200 text-[11px] font-medium">
                      {cp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setViewingProg(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const prog = viewingProg;
                  setViewingProg(null);
                  openEditProgrammeModal(prog);
                }}
                leftIcon={Edit2}
              >
                Edit Programme
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* FACULTY MODALS (ADD/EDIT/DELETE) */}
      {(isAddFacultyModalOpen || editingFaculty) && (
        <Modal
          isOpen={isAddFacultyModalOpen || Boolean(editingFaculty)}
          onClose={() => {
            setIsAddFacultyModalOpen(false);
            setEditingFaculty(null);
          }}
          title={editingFaculty ? `Edit Faculty: ${editingFaculty.code}` : 'Add Accredited Faculty'}
          subtitle="Manage faculty name, code, Dean contact details, and accreditation state."
          size="md"
        >
          <form
            onSubmit={editingFaculty ? handleEditFacultySubmit : handleAddFacultySubmit}
            className="space-y-3.5 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  placeholder="e.g. Faculty of Computing & Artificial Intelligence"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Faculty Code *</label>
                <input
                  type="text"
                  value={facultyForm.code}
                  onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value })}
                  placeholder="e.g. FCAI"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Dean Name</label>
                <input
                  type="text"
                  value={facultyForm.dean_name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, dean_name: e.target.value })}
                  placeholder="e.g. Prof. Chukwuma Eze"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Dean Email</label>
                <input
                  type="email"
                  value={facultyForm.dean_email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, dean_email: e.target.value })}
                  placeholder="dean.computing@pfust.edu.ng"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={facultyForm.description}
                onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsAddFacultyModalOpen(false);
                  setEditingFaculty(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingFaculty ? 'Save Faculty' : 'Create Faculty'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deletingFaculty && (
        <Modal
          isOpen={Boolean(deletingFaculty)}
          onClose={() => setDeletingFaculty(null)}
          title="Delete Faculty"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
              Are you sure you want to delete <strong>{deletingFaculty.name} ({deletingFaculty.code})</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingFaculty(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={handleConfirmDeleteFaculty}>
                Delete Faculty
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DEPARTMENT MODALS (ADD/EDIT/DELETE) */}
      {(isAddDeptModalOpen || editingDept) && (
        <Modal
          isOpen={isAddDeptModalOpen || Boolean(editingDept)}
          onClose={() => {
            setIsAddDeptModalOpen(false);
            setEditingDept(null);
          }}
          title={editingDept ? `Edit Department: ${editingDept.code}` : 'Add Academic Department'}
          size="md"
        >
          <form onSubmit={editingDept ? handleEditDeptSubmit : handleAddDeptSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Department of Cyber Security"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="e.g. CYS"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Parent Faculty *</label>
              <select
                value={deptForm.faculty_id}
                onChange={(e) => setDeptForm({ ...deptForm, faculty_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Head of Dept (HOD)</label>
                <input
                  type="text"
                  value={deptForm.hod_name}
                  onChange={(e) => setDeptForm({ ...deptForm, hod_name: e.target.value })}
                  placeholder="e.g. Dr. Ngozi Adebayo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">HOD Email</label>
                <input
                  type="email"
                  value={deptForm.hod_email}
                  onChange={(e) => setDeptForm({ ...deptForm, hod_email: e.target.value })}
                  placeholder="hod.cyber@pfust.edu.ng"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsAddDeptModalOpen(false);
                  setEditingDept(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingDept ? 'Save Department' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deletingDept && (
        <Modal
          isOpen={Boolean(deletingDept)}
          onClose={() => setDeletingDept(null)}
          title="Delete Department"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
              Are you sure you want to delete <strong>{deletingDept.name} ({deletingDept.code})</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingDept(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={handleConfirmDeleteDept}>
                Delete Department
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export const FinanceTab: React.FC = () => {
  const { invoices, payments, createInvoice } = useUniversityData();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [newInv, setNewInv] = useState({
    title: '2026/2027 Acceptance Fee',
    fee_type: 'acceptance_fee' as any,
    amount_ngn: 20000,
    payer_name: 'Admitted Candidate',
    payer_email: 'candidate@gmail.com',
    academic_session: '2026/2027',
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount_ngn, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice({
      title: newInv.title,
      fee_type: newInv.fee_type,
      amount_ngn: Number(newInv.amount_ngn),
      currency: 'NGN',
      academic_session: newInv.academic_session,
      payer_name: newInv.payer_name,
      payer_email: newInv.payer_email,
    });
    setIsInvoiceModalOpen(false);
  };

  const paymentColumns: Column<Payment>[] = [
    {
      header: 'Payment Reference',
      accessorKey: 'payment_reference',
      sortable: true,
      cell: (row) => <span className="font-mono font-bold text-[#0F2137] text-xs">{row.payment_reference}</span>,
    },
    {
      header: 'Payer Details',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{row.payer_name}</span>
          <span className="text-[11px] text-slate-500">{row.payer_email}</span>
        </div>
      ),
    },
    {
      header: 'Gateway Provider',
      accessorKey: 'provider',
      cell: (row) => (
        <Badge variant={row.provider === 'paystack' ? 'info' : 'gold'} className="text-[10px] font-bold">
          {row.provider.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Amount Paid',
      accessorKey: 'amount_ngn',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-emerald-700 text-xs">
          {formatNaira(row.amount_ngn)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant="success" className="text-[10px]">
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Date Paid',
      accessorKey: 'paid_at',
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.paid_at).toLocaleDateString('en-GB')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            University Bursary & Treasury
          </span>
          <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
            Financial Ledger & Automated Payments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time reconciliation with Federal TSA, Remita RRR, and Paystack channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setIsInvoiceModalOpen(true)} leftIcon={Plus}>
            Generate Custom Fee Invoice
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 block font-medium">Total Reconciled Revenue</span>
          <span className="text-2xl font-bold text-emerald-700">{formatNaira(totalCollected)}</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 block font-medium">Processed Transactions</span>
          <span className="text-2xl font-bold text-[#0F2137]">{payments.length} Payments</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 block font-medium">Active Invoices</span>
          <span className="text-2xl font-bold text-slate-900">{invoices.length} Invoices</span>
        </div>
      </div>

      {/* Payments Table */}
      <DataTable
        data={payments}
        columns={paymentColumns}
        searchPlaceholder="Search by payment reference, payer name or email..."
        exportFileName="pfust-bursary-payments"
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate New University Fee Invoice"
        subtitle="Issue an invoice with Remita/Paystack payment reference for tuition, acceptance or screening."
        size="md"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Invoice Purpose / Title *
            </label>
            <input
              type="text"
              value={newInv.title}
              onChange={(e) => setNewInv({ ...newInv, title: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Fee Category *
              </label>
              <select
                value={newInv.fee_type}
                onChange={(e) => setNewInv({ ...newInv, fee_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              >
                <option value="tuition_fee">Tuition Fee</option>
                <option value="acceptance_fee">Acceptance Fee</option>
                <option value="application_fee">Application Fee</option>
                <option value="hostel_fee">Hostel / Accommodation</option>
                <option value="transcript_fee">Transcript Fee</option>
              </select>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Amount (₦) *
              </label>
              <input
                type="number"
                value={newInv.amount_ngn}
                onChange={(e) => setNewInv({ ...newInv, amount_ngn: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Payer Full Name *
              </label>
              <input
                type="text"
                value={newInv.payer_name}
                onChange={(e) => setNewInv({ ...newInv, payer_name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Payer Email *
              </label>
              <input
                type="email"
                value={newInv.payer_email}
                onChange={(e) => setNewInv({ ...newInv, payer_email: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Issue Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
