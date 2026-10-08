import React from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  Building,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { StatCard, Card, Badge, Button } from '../../components/ui/common';
import { formatNaira } from '../../lib/utils';

export const OverviewTab: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
  const {
    students,
    applications,
    invoices,
    payments,
    faculties,
    programmes,
    auditLogs,
    settings,
  } = useUniversityData();

  // Metrics
  const totalStudents = students.length;
  const totalApplications = applications.length;
  const admittedApplications = applications.filter((a) => a.status === 'admitted').length;
  const acceptanceRate =
    totalApplications > 0 ? Math.round((admittedApplications / totalApplications) * 100) : 0;
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount_ngn, 0);

  // Charts Data
  const facultyDistributionData = faculties.map((fac) => {
    const count = students.filter((s) => s.faculty_id === fac.id).length;
    return { name: fac.code, count };
  });

  const applicationStatusData = [
    { name: 'Admitted', value: applications.filter((a) => a.status === 'admitted').length, color: '#10B981' },
    { name: 'Under Review', value: applications.filter((a) => a.status === 'under_review').length, color: '#F59E0B' },
    { name: 'Submitted', value: applications.filter((a) => a.status === 'submitted' || a.status === 'paid').length, color: '#3B82F6' },
    { name: 'Draft', value: applications.filter((a) => a.status === 'draft').length, color: '#94A3B8' },
  ];

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
            Executive Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#002147] tracking-tight mt-0.5">
            Institutional Telemetry & Performance
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Real-time analytics for {settings.university_name} • Session {settings.current_academic_session}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="gold"
            size="sm"
            onClick={() => onTabChange('applications')}
            leftIcon={GraduationCap}
          >
            Review Admissions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange('finance')}
            leftIcon={CreditCard}
          >
            Bursary Ledger
          </Button>
        </div>
      </div>

      {/* 2. Top Stats Grid - 4 Columns */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Applications</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#002147]">{totalApplications.toLocaleString()}</h3>
            <span className="text-green-500 text-xs font-bold">+12.5%</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">2026/2027 Academic Session</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Admitted Students</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#002147]">{admittedApplications.toLocaleString()}</h3>
            <span className="text-gray-400 text-xs font-bold">{acceptanceRate}% Acceptance</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Senate Approved Quota</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue Collected</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#002147]">{formatNaira(totalRevenue)}</h3>
            <span className="text-green-500 text-xs font-bold">100% Paid</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Automated Remita & Paystack TSA</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Enrolled Students</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#002147]">{totalStudents.toLocaleString()}</h3>
            <span className="text-green-500 text-xs font-bold">4 Faculties</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">15 Degree Programmes</p>
        </div>
      </section>

      {/* 3. Main Dashboard Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Recent Admission Applications Table */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[#002147] text-sm">Recent Admission Applications</h3>
              <p className="text-[11px] text-gray-400">Latest candidate registrations awaiting evaluation</p>
            </div>
            <button
              onClick={() => onTabChange('applications')}
              className="text-[#D4AF37] text-xs font-bold hover:underline cursor-pointer"
            >
              View All ({applications.length})
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                  <th className="px-6 py-3 border-b border-gray-100">Applicant</th>
                  <th className="px-6 py-3 border-b border-gray-100">Programme</th>
                  <th className="px-6 py-3 border-b border-gray-100">ID Number</th>
                  <th className="px-6 py-3 border-b border-gray-100 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium divide-y divide-gray-50">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-[#002147] font-bold">
                        {app.applicant?.first_name} {app.applicant?.last_name}
                      </p>
                      <p className="text-[10px] text-gray-400">{app.applicant?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{app.programme?.name || '—'}</td>
                    <td className="px-6 py-4 font-mono text-gray-400">{app.application_number}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge
                        variant={
                          app.status === 'admitted'
                            ? 'success'
                            : app.status === 'under_review'
                            ? 'warning'
                            : app.status === 'submitted' || app.status === 'paid'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 cols: Quick Audit Log + Faculty Distribution */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Deep Navy Quick Audit Log */}
          <div className="bg-[#002147] text-white p-6 rounded-lg shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                  Quick Audit Log
                </h3>
                <button
                  onClick={() => onTabChange('audit-logs')}
                  className="text-[10px] text-[#A0AEC0] hover:text-white underline cursor-pointer"
                >
                  Full Log →
                </button>
              </div>

              <div className="space-y-4">
                {auditLogs.slice(0, 3).map((log, idx) => {
                  const barColor =
                    idx === 0 ? 'bg-[#D4AF37]' : idx === 1 ? 'bg-green-500' : 'bg-blue-500';
                  return (
                    <div key={log.id} className="flex gap-3">
                      <div className={`w-1 h-8 ${barColor} rounded shrink-0`} />
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold text-white truncate">
                          {log.action.replace('_', ' ')}
                        </p>
                        <p className="text-[9px] text-[#A0AEC0] uppercase truncate">
                          {log.actor_name} • {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Faculty Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#002147] mb-4">Faculty Headcount Distribution</h3>
            <div className="space-y-4">
              {faculties.map((fac, i) => {
                const total = students.length || 1;
                const facCount = students.filter((s) => s.faculty_id === fac.id).length;
                const pct = Math.round((facCount / total) * 100);
                const barColor =
                  i === 0 ? 'bg-[#002147]' : i === 1 ? 'bg-[#D4AF37]' : i === 2 ? 'bg-emerald-600' : 'bg-gray-400';

                return (
                  <div key={fac.id}>
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                      <span className="text-gray-700">{fac.name}</span>
                      <span className="text-gray-500">{pct}% ({facCount})</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor}`}
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Secondary Analytics Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Enrollment Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#002147]">Faculty Enrollment Comparison</h3>
              <p className="text-xs text-gray-400">Total registered student population by faculty code</p>
            </div>
            <Badge variant="neutral">Verified</Badge>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyDistributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" fontSize={11} stroke="#64748B" />
                <YAxis fontSize={11} stroke="#64748B" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#002147', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#002147" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Funnel Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#002147]">Admissions Processing Funnel</h3>
              <p className="text-xs text-gray-400">Applicant screening status progression</p>
            </div>
            <Badge variant="gold">2026/2027</Badge>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
            {applicationStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 truncate">{item.name}:</span>
                <span className="font-bold text-[#002147]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
