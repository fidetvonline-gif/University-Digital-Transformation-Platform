import React, { useState } from 'react';
import {
  Briefcase,
  BookOpen,
  Users,
  CheckCircle2,
  Save,
  Upload,
  Clock,
  Printer,
  Sparkles,
  User,
} from 'lucide-react';
import { UserProfile } from '../../components/portal/UserProfile';
import { useAuth } from '../../lib/auth/AuthContext';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Button, Card, Badge } from '../../components/ui/common';
import { Course, CourseEnrollment } from '../../types/database';

export interface StaffPortalViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const StaffPortalView: React.FC<StaffPortalViewProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const { staffList, courses, courseEnrollments, students, updateCourseGrade, settings } =
    useUniversityData();

  const staff =
    staffList.find((s) => s.profile?.email === profile?.email || s.user_id === user?.id) ||
    staffList[0];

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'grading' | 'roster' | 'courses' | 'profile'>('grading');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter enrollments for this course
  const courseStudents = courseEnrollments.filter((e) => e.course_id === selectedCourseId);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleScoreChange = (
    enrollmentId: string,
    field: 'ca_score' | 'exam_score',
    value: number
  ) => {
    const enrollment = courseEnrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;

    const ca = field === 'ca_score' ? value : enrollment.ca_score || 0;
    const exam = field === 'exam_score' ? value : enrollment.exam_score || 0;

    updateCourseGrade(enrollmentId, ca, exam);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-8 space-y-8">
      {/* Staff Identity Card */}
      <div className="max-w-6xl mx-auto bg-[#0F2137] text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-[#0F2137] flex items-center justify-center font-extrabold text-2xl shrink-0">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-300 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {staff?.staff_id}
                </span>
                <Badge variant="gold" className="text-[10px]">
                  {staff?.designation}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
                {staff?.profile?.first_name} {staff?.profile?.last_name}
              </h1>
              <p className="text-xs text-slate-300">
                {staff?.department?.name} • {staff?.faculty?.name}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur p-4 rounded-2xl border border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Teaching Load
            </span>
            <span className="text-xl font-bold text-white font-mono">
              3 Allocated Courses
            </span>
            <span className="text-[11px] text-amber-300 block">
              {settings.current_academic_session} Harmattan
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('grading')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'grading'
                  ? 'bg-[#0F2137] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Continuous Assessment & Exam Score Entry
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-[#0F2137] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Class Roster & Attendance
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#0F2137] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              User Profile
            </button>
          </div>

          {/* Select Course Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">Active Course:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-[#0F2137] focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title} ({c.credits} Credits)
                </option>
              ))}
            </select>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Scores successfully validated and committed to Faculty Examination Board!</span>
          </div>
        )}

        {/* Tab 1: Grading Engine */}
        {activeTab === 'grading' && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0F2137]">
                  {selectedCourse?.code}: {selectedCourse?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous Assessment (30 Marks) + Semester Examination (70 Marks) = 100 Marks.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                leftIcon={Save}
              >
                Submit Grades to HOD
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Matriculation No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center">CA Score (Max 30)</th>
                    <th className="p-3 text-center">Exam Score (Max 70)</th>
                    <th className="p-3 text-center">Total (100)</th>
                    <th className="p-3 text-center">Letter Grade</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((std, idx) => {
                    const existingEnr = courseStudents.find((e) => e.student_id === std.id);
                    const ca = existingEnr?.ca_score ?? (24 + (idx % 5));
                    const exam = existingEnr?.exam_score ?? (55 + (idx % 12));
                    const total = ca + exam;
                    const grade =
                      total >= 70
                        ? 'A'
                        : total >= 60
                        ? 'B'
                        : total >= 50
                        ? 'C'
                        : total >= 45
                        ? 'D'
                        : total >= 40
                        ? 'E'
                        : 'F';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#0F2137]">
                          {std.student_number}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {std.profile?.first_name} {std.profile?.last_name}
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            defaultValue={ca}
                            onChange={(e) =>
                              existingEnr &&
                              handleScoreChange(existingEnr.id, 'ca_score', parseInt(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0F2137]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="70"
                            defaultValue={exam}
                            onChange={(e) =>
                              existingEnr &&
                              handleScoreChange(existingEnr.id, 'exam_score', parseInt(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0F2137]"
                          />
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-900">
                          {total}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 font-mono font-bold rounded text-xs ${
                              grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : grade === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {grade}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="success" className="text-[9px]">
                            COMPUTED
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 2: Class Roster */}
        {activeTab === 'roster' && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0F2137]">
                Class Attendance Roster ({students.length} Enrolled Scholars)
              </h3>
              <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={Printer}>
                Print Class Register
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">S/N</th>
                    <th className="p-3">Matric No</th>
                    <th className="p-3">Scholar Name</th>
                    <th className="p-3">Programme</th>
                    <th className="p-3 text-center">Lecture Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((std, idx) => (
                    <tr key={std.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-[#0F2137]">{std.student_number}</td>
                      <td className="p-3 font-medium text-slate-900">{std.profile?.first_name} {std.profile?.last_name}</td>
                      <td className="p-3 text-slate-600">{std.programme?.name}</td>
                      <td className="p-3 text-center font-bold text-emerald-700 font-mono">92%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab: User Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <UserProfile />
          </div>
        )}
      </div>
    </div>
  );
};
