import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Building,
  Users,
  ChevronRight,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Button, Card, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { formatNaira } from '../../lib/utils';
import { Programme } from '../../types/database';

export const FacultiesView: React.FC<{
  onNavigate: (view: string, params?: any) => void;
  selectedFacultyId?: string;
}> = ({ onNavigate, selectedFacultyId }) => {
  const { faculties, departments, programmes } = useUniversityData();
  const [activeFacultyId, setActiveFacultyId] = useState<string>(
    selectedFacultyId || faculties[0]?.id || ''
  );

  const currentFaculty = faculties.find((f) => f.id === activeFacultyId) || faculties[0];
  const facultyDepts = departments.filter((d) => d.faculty_id === currentFaculty?.id);
  const facultyProgs = programmes.filter((p) => p.faculty_id === currentFaculty?.id);

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">Academics & Structure</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Accredited Faculties & Departments
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Discover our specialized academic faculties offering high-demand undergraduate degrees in
            computing, engineering, natural sciences, and technological management.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Faculty Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Faculty ({faculties.length})
            </h3>
            {faculties.map((fac) => {
              const isSelected = fac.id === currentFaculty?.id;
              const progCount = programmes.filter((p) => p.faculty_id === fac.id).length;
              return (
                <button
                  key={fac.id}
                  onClick={() => setActiveFacultyId(fac.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#0F2137] text-white border-[#0F2137] shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-amber-400 text-[#0F2137]' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {fac.code}
                      </span>
                      <span className="text-xs font-medium opacity-75">{progCount} Programmes</span>
                    </div>
                    <h4 className="text-sm font-bold mt-1.5">{fac.name}</h4>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Faculty Details Main Column */}
          {currentFaculty && (
            <div className="lg:col-span-8 space-y-8">
              {/* Overview Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                      Faculty Overview
                    </span>
                    <h2 className="text-2xl font-bold text-[#0F2137]">{currentFaculty.name}</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Faculty Code: {currentFaculty.code}</p>
                  </div>
                  <div className="text-left sm:text-right p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Dean of Faculty</span>
                    <span className="text-xs font-bold text-slate-900">{currentFaculty.dean_name}</span>
                    <span className="text-[11px] text-slate-500 block">{currentFaculty.dean_email}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentFaculty.description}
                </p>

                {/* Academic Departments */}
                <div className="pt-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Academic Departments ({facultyDepts.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {facultyDepts.map((dept) => (
                      <div key={dept.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{dept.name}</span>
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {dept.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">HOD: {dept.head_of_dept_name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Programmes Offered in Faculty */}
                <div className="pt-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Undergraduate Programmes Offered ({facultyProgs.length})
                  </h3>
                  <div className="space-y-2.5">
                    {facultyProgs.map((prog) => (
                      <div
                        key={prog.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-[#0F2137] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{prog.name}</span>
                            <Badge variant="neutral" className="text-[10px] font-semibold">{prog.degree_type}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {prog.duration_years} Years • Cut-Off: {prog.jamb_cutoff_score} • Tuition: {formatNaira(prog.tuition_fee_ngn)}/session
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate('programmes', { programmeId: prog.id })}
                        >
                          View Syllabus & Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProgrammesView: React.FC<{
  onNavigate: (view: string, params?: any) => void;
  selectedProgrammeId?: string;
}> = ({ onNavigate, selectedProgrammeId }) => {
  const { programmes, faculties } = useUniversityData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [activeProgramme, setActiveProgramme] = useState<Programme | null>(() => {
    if (selectedProgrammeId) {
      return programmes.find((p) => p.id === selectedProgrammeId) || null;
    }
    return null;
  });

  const filtered = programmes.filter((p) => {
    if (!p) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !term ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.code && p.code.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term));
    const matchesFaculty = selectedFaculty === 'all' || p.faculty_id === selectedFaculty;
    return matchesSearch && matchesFaculty;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">Undergraduate Prospectus 2026/2027</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Academic Degree Programmes
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Choose from 15 NUC-accredited bachelor's degree programmes designed to prepare you for
            high-impact global careers in software, artificial intelligence, cybersecurity, engineering, and digital commerce.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by programme name or course code..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedFaculty('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                selectedFaculty === 'all'
                  ? 'bg-[#0F2137] text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Faculties ({programmes.length})
            </button>
            {faculties.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFaculty(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  selectedFaculty === f.id
                    ? 'bg-[#0F2137] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.code}
              </button>
            ))}
          </div>
        </div>

        {/* Programmes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prog) => {
            const faculty = faculties.find((f) => f.id === prog.faculty_id);
            return (
              <Card
                key={prog.id}
                className="p-6 flex flex-col justify-between hover:border-[#0F2137] hover:shadow-md transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {faculty?.code || 'FACULTY'}
                    </span>
                    <Badge variant="neutral" className="text-[10px] font-mono">
                      {prog.degree_type} • {prog.duration_years} Yrs
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-[#0F2137] leading-snug">{prog.name}</h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-slate-100">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 block font-medium">JAMB Cut-Off</span>
                      <span className="font-bold text-slate-900">{prog.jamb_cutoff_score}+</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 block font-medium">Tuition / Session</span>
                      <span className="font-bold text-slate-900">{formatNaira(prog.tuition_fee_ngn)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setActiveProgramme(prog)}
                  >
                    View Syllabus
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onNavigate('apply', { programmeId: prog.id })}
                  >
                    Apply Now
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Programme Detailed Syllabus & Requirements Modal */}
      {activeProgramme && (
        <Modal
          isOpen={Boolean(activeProgramme)}
          onClose={() => setActiveProgramme(null)}
          title={`${activeProgramme.name} (${activeProgramme.degree_type})`}
          subtitle={`Faculty: ${faculties.find((f) => f.id === activeProgramme.faculty_id)?.name || 'Science & Tech'} • Duration: ${activeProgramme.duration_years} Years`}
          size="xl"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setActiveProgramme(null)}>
                Close
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  const id = activeProgramme.id;
                  setActiveProgramme(null);
                  onNavigate('apply', { programmeId: id });
                }}
              >
                Apply for {activeProgramme.name}
              </Button>
            </>
          }
        >
          <div className="space-y-6 text-xs text-slate-700">
            <div>
              <h4 className="font-bold text-sm text-[#0F2137] mb-2">Programme Overview</h4>
              <p className="leading-relaxed text-slate-600">{activeProgramme.description}</p>
            </div>

            {/* Key Requirements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">JAMB Minimum</span>
                <span className="text-base font-bold text-slate-900">{activeProgramme.jamb_cutoff_score}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Graduation Credits</span>
                <span className="text-base font-bold text-slate-900">{activeProgramme.total_credits_required} Units</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Tuition per Session</span>
                <span className="text-base font-bold text-emerald-700">{formatNaira(activeProgramme.tuition_fee_ngn)}</span>
              </div>
            </div>

            {/* Admission Subject Combinations */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <h4 className="font-bold text-amber-900">UTME & O'Level Admission Criteria</h4>
              <div className="space-y-1 text-slate-700">
                <p>
                  <strong>UTME Subjects:</strong> English Language, Mathematics, Physics, and Chemistry (or Economics/Biology depending on discipline).
                </p>
                <p>
                  <strong>O'Level Requirements:</strong> 5 Credit passes in SSCE/WAEC/NECO/NABTEB at not more than 2 sittings including English Language, Mathematics, Physics, Chemistry and one other relevant science or social science subject.
                </p>
                <p>
                  <strong>Direct Entry:</strong> Minimum of Upper Credit at ND / HND or 9 Points at IJMB / JUPEB in relevant disciplines.
                </p>
              </div>
            </div>

            {/* Career Opportunities */}
            {activeProgramme.career_prospects && activeProgramme.career_prospects.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-[#0F2137] mb-2">Target Career Trajectories</h4>
                <div className="flex flex-wrap gap-2">
                  {activeProgramme.career_prospects.map((career, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-medium">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
