import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  CreditCard,
  FileText,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Plus,
  Trash2,
  ShieldCheck,
  QrCode,
  Sparkles,
  ExternalLink,
  User,
} from 'lucide-react';
import { UserProfile } from '../../components/portal/UserProfile';
import { useAuth } from '../../lib/auth/AuthContext';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Button, Card, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { formatNaira } from '../../lib/utils';
import { Course, CourseEnrollment, Student, Invoice } from '../../types/database';

export interface StudentPortalViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const {
    students,
    courses,
    courseEnrollments,
    invoices,
    payments,
    settings,
    registerCourseForStudent,
    createInvoice,
    processPayment,
  } = useUniversityData();

  // Pick student profile matching user or default to first student
  const student =
    students.find((s) => s.profile?.email === profile?.email || s.user_id === user?.id) ||
    students[0];

  const [activeTab, setActiveTab] = useState<
    'overview' | 'course-reg' | 'results' | 'bursary' | 'payments' | 'clearance' | 'requests' | 'profile'
  >('overview');

  // Course Registration State
  const [selectedCourses, setSelectedCourses] = useState<string[]>(() => {
    return courseEnrollments
      .filter((e) => e.student_id === student?.id)
      .map((e) => e.course_id);
  });
  const [courseRegSuccess, setCourseRegSuccess] = useState(false);

  // Bursary Payment State
  const [isPayingTuition, setIsPayingTuition] = useState(false);
  const [tuitionPaidSuccess, setTuitionPaidSuccess] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'paystack' | 'remita'>('paystack');

  // Document Request State
  const [docType, setDocType] = useState('Official Academic Transcript');
  const [docRequestSuccess, setDocRequestSuccess] = useState(false);

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0F2137]">No Matriculated Student Record Found</h2>
        <p className="text-xs text-slate-500">
          Please check your admission status or ensure you have completed your acceptance fee payment.
        </p>
      </div>
    );
  }

  // Student's enrolled courses with results
  const studentEnrollments = courseEnrollments.filter((e) => e.student_id === student.id);
  const totalRegisteredCredits = courses
    .filter((c) => selectedCourses.includes(c.id))
    .reduce((sum, c) => sum + c.credits, 0);

  // Student Invoices
  const studentInvoices = invoices.filter(
    (inv) => inv.payer_id === student.id || inv.payer_email === student.profile?.email
  );

  const handleToggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
    } else {
      const targetCourse = courses.find((c) => c.id === courseId);
      if (totalRegisteredCredits + (targetCourse?.credits || 0) > 24) {
        alert('Maximum semester credit limit is 24 units!');
        return;
      }
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const handleSaveCourseReg = () => {
    selectedCourses.forEach((cId) => {
      registerCourseForStudent(student.id, cId, 'sess-2026', 'First');
    });
    setCourseRegSuccess(true);
    setTimeout(() => setCourseRegSuccess(false), 4000);
  };

  const handlePayTuition = async () => {
    setIsPayingTuition(true);
    try {
      const inv = createInvoice({
        title: `2026/2027 Session School Fees (${student.student_number})`,
        fee_type: 'tuition_fee',
        amount_ngn: student.programme?.tuition_fee_ngn || 65000,
        currency: 'NGN',
        academic_session: '2026/2027',
        payer_id: student.id,
        payer_name: `${student.profile?.first_name} ${student.profile?.last_name}`,
        payer_email: student.profile?.email || 'student@pfust.edu.ng',
      });

      processPayment(inv.id, selectedProvider, {
        name: `${student.profile?.first_name} ${student.profile?.last_name}`,
        email: student.profile?.email || 'student@pfust.edu.ng',
        channel: 'card',
      });

      setTuitionPaidSuccess(true);
    } finally {
      setIsPayingTuition(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-8 space-y-8">
      {/* Student Identity Card Banner */}
      <div className="max-w-6xl mx-auto bg-[#0F2137] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-[#0F2137] flex items-center justify-center font-extrabold text-2xl shrink-0">
              {student.profile?.first_name?.[0]}
              {student.profile?.last_name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-300 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {student.student_number}
                </span>
                <Badge variant="success" className="text-[10px]">
                  {student.status.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
                {student.profile?.first_name} {student.profile?.last_name}
              </h1>
              <p className="text-xs text-slate-300">
                {student.programme?.name} • {student.level?.code || '100L'} • {student.faculty?.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/80 backdrop-blur p-3 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Current CGPA</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {student.current_cgpa.toFixed(2)} / 5.00
              </span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur p-3 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Session / Term</span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {settings.current_academic_session}
              </span>
              <span className="text-[10px] text-amber-300">First Semester</span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur p-3 rounded-xl border border-slate-700 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Registered Units</span>
              <span className="text-base font-bold text-white font-mono">{totalRegisteredCredits} Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Dashboard & Notices', icon: BookOpen },
            { id: 'course-reg', label: 'Course Registration (2026/2027)', icon: FileText },
            { id: 'results', label: 'Semester Results & Transcript', icon: Award },
            { id: 'bursary', label: 'Bursary & Fee Clearance', icon: CreditCard },
            { id: 'payments', label: 'Payment History', icon: Printer },
            { id: 'clearance', label: 'Exam Clearance Docket', icon: ShieldCheck },
            { id: 'requests', label: 'Certificate / Transcript Requests', icon: GraduationCap },
            { id: 'profile', label: 'User Profile', icon: User },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-[#0F2137] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0F2137] uppercase tracking-wider">
                Active Academic Workflows
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveTab('course-reg')}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#0F2137] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-[#0F2137]">
                      Course Registration
                    </span>
                    <Badge variant="warning">Open</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Register core and elective credit units for {settings.current_academic_session} Harmattan Semester.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('bursary')}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#0F2137] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-[#0F2137]">
                      School Fee Payment
                    </span>
                    <Badge variant="info">TSA Automated</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pay session tuition and generate certified e-Receipts with digital QR verification.
                  </p>
                </div>
              </div>
            </Card>

            {/* Registered Courses Quick View */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F2137]">Registered Courses ({selectedCourses.length})</h3>
                <button
                  onClick={() => setActiveTab('course-reg')}
                  className="text-xs text-[#0F2137] font-semibold hover:underline cursor-pointer"
                >
                  Edit Selection →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {courses
                  .filter((c) => selectedCourses.includes(c.id))
                  .map((course) => (
                    <div key={course.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-[#0F2137] mr-2">{course.code}</span>
                        <span className="text-slate-800 font-medium">{course.title}</span>
                      </div>
                      <Badge variant="neutral" className="text-[10px] font-mono">
                        {course.credits} Units
                      </Badge>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#0F2137] uppercase tracking-wider border-b border-slate-100 pb-2">
                Scholar Bio-Data
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Matric No:</span>
                  <span className="font-mono font-bold text-slate-900">{student.student_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admission Year:</span>
                  <span className="font-bold text-slate-900">{student.admission_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entry Level:</span>
                  <span className="font-bold text-slate-900">{student.level?.code || '100L'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">{student.department?.name}</span>
                </div>
              </div>
            </Card>

            <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span className="font-bold text-blue-900">University Cloud Account</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Access Microsoft Office 365, Teams, and Library databases with:
              </p>
              <code className="block p-2 bg-white rounded border border-blue-200 font-mono text-blue-800 text-[11px]">
                {student.student_number ? student.student_number.toLowerCase().replace(/\//g, '.') : 'student'}@pfust.edu.ng
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Course Registration */}
      {activeTab === 'course-reg' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Harmattan Semester 2026/2027
              </span>
              <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
                Online Course Registration Engine
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select required core and elective modules. (Min: 12 Units, Max: 24 Units).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Credits</span>
                <span className={`text-lg font-mono font-extrabold ${totalRegisteredCredits > 24 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {totalRegisteredCredits} / 24 Max
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleSaveCourseReg}
                disabled={totalRegisteredCredits < 12 || totalRegisteredCredits > 24}
              >
                Submit & Lock Registration
              </Button>
            </div>
          </div>

          {courseRegSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Course registration saved successfully! Certified form ready for download.</span>
            </div>
          )}

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0F2137]">Available Semester Courses (Department of {student.department?.name})</h3>

            <div className="divide-y divide-slate-100 text-xs">
              {courses
                .filter((c) => c.department_id === student.department_id)
                .map((course) => {
                  const isSelected = selectedCourses.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleToggleCourse(course.id)}
                      className={`p-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected ? 'bg-blue-50/60 border border-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-[#0F2137] pointer-events-none"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#0F2137]">{course.code}</span>
                            <span className="font-bold text-slate-900">{course.title}</span>
                            <Badge variant={course.is_elective ? 'neutral' : 'info'} className="text-[10px]">
                              {course.is_elective ? 'Elective' : 'Core Compulsory'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{course.description}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">{course.credits} Credits</span>
                        <span className="text-[10px] text-slate-400 block">{course.semester} Semester</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Print Action */}
          <div className="flex justify-end">
            <Button variant="outline" size="md" onClick={() => window.print()} leftIcon={Printer}>
              Print Official Course Registration Form (CRF)
            </Button>
          </div>
        </div>
      )}

      {/* Tab 3: Semester Results & Transcript */}
      {activeTab === 'results' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Academic Standing & Transcripts
              </span>
              <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
                Verified Examination Results & GPA Calculation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Senate-approved grades on standard 5.00 Grading Scale.
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={Download}>
              Download Statement of Results
            </Button>
          </div>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0F2137]">
                2025/2026 Academic Session — First Semester
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Semester GPA: 4.80 / 5.00
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Course Code</th>
                    <th className="p-3">Course Title</th>
                    <th className="p-3 text-center">Credit Units</th>
                    <th className="p-3 text-center">CA (30)</th>
                    <th className="p-3 text-center">Exam (70)</th>
                    <th className="p-3 text-center">Total (100)</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-[#0F2137]">{enr.course?.code}</td>
                      <td className="p-3 font-medium text-slate-800">{enr.course?.title}</td>
                      <td className="p-3 text-center font-mono">{enr.course?.credits}</td>
                      <td className="p-3 text-center font-mono">{enr.ca_score ?? 28}</td>
                      <td className="p-3 text-center font-mono">{enr.exam_score ?? 60}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">{enr.total_score ?? 88}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold font-mono rounded">
                          {enr.grade ?? 'A'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">
                        {enr.grade_point ? enr.grade_point * (enr.course?.credits || 3) : 15.0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Bursary & Fee Clearance */}
      {activeTab === 'bursary' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                University Bursary Desk
              </span>
              <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
                School Fees & Payment Clearances
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pay undergraduate session tuition online and retrieve certified digital receipts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pay Tuition Card */}
            <div className="lg:col-span-7">
              <Card className="p-6 space-y-6">
                <h3 className="text-sm font-bold text-[#0F2137]">
                  {settings.current_academic_session} Session Tuition Fee
                </h3>

                {tuitionPaidSuccess ? (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">Tuition Payment Successful!</h4>
                    <p className="text-xs text-slate-600">
                      Payment of {formatNaira(student.programme?.tuition_fee_ngn || 65000)} has been reconciled with the Bursary.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={Printer}>
                      Print e-Receipt
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Degree Programme:</span>
                        <span className="font-bold text-[#0F2137]">{student.programme?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tuition Amount:</span>
                        <span className="font-bold text-slate-900">{formatNaira(student.programme?.tuition_fee_ngn || 65000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Status:</span>
                        <Badge variant="warning">Pending Payment</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-bold uppercase tracking-wider text-slate-700">
                        Select Gateway
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedProvider('paystack')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            selectedProvider === 'paystack'
                              ? 'border-[#0F2137] bg-blue-50 font-bold text-[#0F2137]'
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>Paystack Gateway</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedProvider('remita')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            selectedProvider === 'remita'
                              ? 'border-[#0F2137] bg-amber-50 font-bold text-[#0F2137]'
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>Remita RRR Service</span>
                        </button>
                      </div>
                    </div>

                    <Button
                      variant="gold"
                      size="lg"
                      onClick={handlePayTuition}
                      isLoading={isPayingTuition}
                      leftIcon={CreditCard}
                      className="w-full"
                    >
                      Pay {formatNaira(student.programme?.tuition_fee_ngn || 65000)} via Gateway
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Receipt Summary */}
            <div className="lg:col-span-5">
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0F2137]">Payment History & e-Receipts</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Post-UTME Screening Fee</span>
                      <span className="text-[10px] text-slate-400 font-mono">PAY-REF-2026-9283</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 block">₦2,000</span>
                      <Badge variant="success" className="text-[9px]">PAID</Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Provisional Acceptance Fee</span>
                      <span className="text-[10px] text-slate-400 font-mono">PAY-REF-2026-1049</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 block">₦20,000</span>
                      <Badge variant="success" className="text-[9px]">PAID</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Payment History */}
      {activeTab === 'payments' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0F2137]">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="p-3 font-mono">{inv.id.slice(0, 8)}</td>
                      <td className="p-3">{inv.title}</td>
                      <td className="p-3">{formatNaira(inv.amount_ngn)}</td>
                      <td className="p-3">
                        <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                          {inv.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {inv.status === 'paid' && (
                          <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={Printer}>
                            Download Receipt
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Examination Clearance Docket */}
      {activeTab === 'clearance' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-[#0F2137] shadow-xl space-y-6 print:border-0 print:shadow-none">
            {/* Header */}
            <div className="text-center space-y-1 border-b-2 border-[#0F2137] pb-4">
              <h2 className="text-lg font-extrabold text-[#0F2137] uppercase">
                {settings.university_name}
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                OFFICIAL EXAMINATION CLEARANCE DOCKET / CARD
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {settings.current_academic_session} • Harmattan Semester Examinations
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="col-span-2 space-y-1.5">
                <div><span className="text-slate-400">Candidate Name: </span><strong className="text-slate-900">{student.profile?.first_name} {student.profile?.last_name}</strong></div>
                <div><span className="text-slate-400">Matriculation No: </span><strong className="font-mono text-[#0F2137]">{student.student_number}</strong></div>
                <div><span className="text-slate-400">Degree Programme: </span><strong>{student.programme?.name}</strong></div>
                <div><span className="text-slate-400">Level: </span><strong>{student.level?.code || '100L'}</strong></div>
              </div>

              <div className="border border-slate-300 rounded-xl p-2 flex flex-col items-center justify-center text-center bg-slate-50">
                <QrCode className="w-16 h-16 text-slate-800" />
                <span className="text-[9px] text-slate-500 font-mono mt-1">VERIFIED CLEARANCE</span>
              </div>
            </div>

            {/* Courses to be examined */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">
                Accredited Examination Courses ({selectedCourses.length})
              </span>
              <table className="w-full border border-slate-200 text-left">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="p-2">Course Code</th>
                    <th className="p-2">Course Title</th>
                    <th className="p-2">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {courses
                    .filter((c) => selectedCourses.includes(c.id))
                    .map((c) => (
                      <tr key={c.id}>
                        <td className="p-2 font-mono font-bold">{c.code}</td>
                        <td className="p-2">{c.title}</td>
                        <td className="p-2 font-mono text-slate-300">________________</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
              <span>Cleared by: <strong>Bursar & Dean of Student Affairs</strong></span>
              <span className="font-mono">Security Checksum: 0x92BA8104EF</span>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="primary" size="md" onClick={() => window.print()} leftIcon={Printer}>
              Print Official Examination Docket
            </Button>
          </div>
        </div>
      )}

      {/* Tab: Certificate / Transcript Requests */}
      {activeTab === 'requests' && (
        <Card className="max-w-2xl mx-auto p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0F2137]">Official Registry Document Services</h3>
            <p className="text-xs text-slate-500">
              Request official transcripts, certificates, or letters of introduction from the Registry.
            </p>
          </div>

          {docRequestSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Document Request Submitted!</h4>
              <p className="text-xs text-slate-600">
                Your request for <strong>{docType}</strong> has been logged with the Exams & Records division.
              </p>
              <Button variant="outline" size="sm" onClick={() => setDocRequestSuccess(false)}>
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDocRequestSuccess(true);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                >
                  <option value="Official Academic Transcript">Official Academic Transcript (₦10,000)</option>
                  <option value="Letter of Introduction / Attestation">Letter of Introduction / Attestation (₦2,500)</option>
                  <option value="Bonafide Student Certificate">Bonafide Student Certificate (₦2,000)</option>
                  <option value="English Proficiency Attestation">English Proficiency Attestation (₦5,000)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Destination Organization / University Address *
                </label>
                <textarea
                  rows={3}
                  placeholder="Recipient Name, Institution, Postal or Electronic address..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Transmit Request to Exams & Records
              </Button>
            </form>
          )}
          
          <div className="border-t border-slate-100 pt-6">
             <h4 className="text-sm font-bold text-[#0F2137] mb-3">Request Tracking Status</h4>
             <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Document</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-mono text-slate-500">REQ-2026-8912</td>
                      <td className="p-3">Official Academic Transcript</td>
                      <td className="p-3"><Badge variant="warning">Processing</Badge></td>
                    </tr>
                </tbody>
             </table>
          </div>
        </Card>
      )}

      {/* Tab: User Profile */}
      {activeTab === 'profile' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <UserProfile />
        </div>
      )}

    </div>
  );
};
