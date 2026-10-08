import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Eye,
  ShieldCheck,
  Search,
  Filter,
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button, Card, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { NewsArticle, AuditLog } from '../../types/database';

export const CmsTab: React.FC = () => {
  const { news, addNewsArticle, deleteNewsArticle } = useUniversityData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newArticle, setNewArticle] = useState({
    title: '',
    category: 'Admissions',
    summary: '',
    content: '',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    is_published: true,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.content) return;

    addNewsArticle({
      title: newArticle.title,
      category: newArticle.category,
      summary: newArticle.summary || newArticle.content.slice(0, 120) + '...',
      content: newArticle.content,
      image_url: newArticle.image_url,
      is_published: newArticle.is_published,
      author_name: 'University Information Office',
    });

    setIsAddModalOpen(false);
    setNewArticle({
      title: '',
      category: 'Admissions',
      summary: '',
      content: '',
      image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
      is_published: true,
    });
  };

  const columns: Column<NewsArticle>[] = [
    {
      header: 'Headline Title',
      accessorKey: 'title',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{row.title}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{row.summary}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (row) => <Badge variant="gold" className="text-[10px] uppercase font-bold">{row.category}</Badge>,
    },
    {
      header: 'Author / Desk',
      accessorKey: 'author_name',
      cell: (row) => <span className="text-slate-600 text-xs">{row.author_name}</span>,
    },
    {
      header: 'Date Published',
      accessorKey: 'published_at',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(row.published_at).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'is_published',
      cell: (row) => (
        <Badge variant={row.is_published ? 'success' : 'neutral'} className="text-[10px]">
          {row.is_published ? 'LIVE' : 'DRAFT'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      cell: (row) => (
        <button
          onClick={() => deleteNewsArticle(row.id)}
          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
          title="Delete Article"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            University Media & CMS
          </span>
          <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
            Official Gazettes, Press Releases & Announcements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish breaking institutional bulletins to the public portal and student feed.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} leftIcon={Plus}>
          Publish New Gazette
        </Button>
      </div>

      <DataTable
        data={news}
        columns={columns}
        searchPlaceholder="Search news by headline or category..."
        exportFileName="pfust-news-bulletins"
      />

      {/* Add News Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Compose Official University Gazette"
        subtitle="Write a new press release or public academic announcement."
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Headline Title *
            </label>
            <input
              type="text"
              value={newArticle.title}
              onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              placeholder="e.g. Senate Approves New Research Grant Programme for 2026/2027"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={newArticle.category}
                onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              >
                <option value="Admissions">Admissions</option>
                <option value="Academic">Academic</option>
                <option value="Research">Research</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Featured Cover Image URL
              </label>
              <input
                type="text"
                value={newArticle.image_url}
                onChange={(e) => setNewArticle({ ...newArticle, image_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Short Summary (Lead Paragraph)
            </label>
            <textarea
              rows={2}
              value={newArticle.summary}
              onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
              placeholder="Brief summary shown on cards..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Article Body (Markdown supported) *
            </label>
            <textarea
              rows={6}
              value={newArticle.content}
              onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
              placeholder="Full text of the announcement..."
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish Gazette
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const AuditLogsTab: React.FC = () => {
  const { auditLogs } = useUniversityData();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'created_at',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-slate-600 text-xs">
          {new Date(row.created_at).toLocaleString('en-GB')}
        </span>
      ),
    },
    {
      header: 'Action Taken',
      accessorKey: 'action',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-[#0F2137] text-xs bg-slate-100 px-2 py-0.5 rounded">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Actor & Role',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{row.actor_name}</span>
          <span className="text-[10px] text-amber-700 font-semibold uppercase">{row.actor_role}</span>
        </div>
      ),
    },
    {
      header: 'Target Entity',
      cell: (row) => (
        <span className="text-slate-700 text-xs">
          {row.module} {row.record_id ? `(${row.record_id.slice(0, 10)}...)` : ''}
        </span>
      ),
    },
    {
      header: 'IP Address',
      accessorKey: 'ip_address',
      cell: (row) => <span className="font-mono text-[11px] text-slate-400">{row.ip_address}</span>,
    },
    {
      header: 'Details',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedLog(row)}
          className="text-xs py-0.5"
        >
          JSON
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Compliance & Cybersecurity
          </span>
          <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
            Security Audit Trail & Activity Logs ({auditLogs.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tamper-evident log stream capturing all administrative decisions, admissions approvals, and payment events.
          </p>
        </div>
      </div>

      <DataTable
        data={auditLogs}
        columns={columns}
        searchPlaceholder="Search audit logs by actor, action, or IP address..."
        exportFileName="pfust-security-audit-logs"
      />

      {/* JSON Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event: ${selectedLog.action}`}
          subtitle={`Logged at ${new Date(selectedLog.created_at).toISOString()} by ${selectedLog.actor_name}`}
          size="md"
        >
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase">Raw Event Metadata (JSON)</span>
            <pre className="p-4 bg-slate-900 text-emerald-400 text-xs rounded-xl overflow-x-auto font-mono">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </div>
        </Modal>
      )}
    </div>
  );
};

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings } = useUniversityData();
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Core System Configuration
        </span>
        <h2 className="text-xl font-bold text-[#0F2137] tracking-tight">
          University Enterprise Parameters
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Academic sessions, active semesters, payment gateways, and institutional profile.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System settings updated and synchronized across all portals!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0F2137] border-b border-slate-100 pb-2">
            1. University Branding & Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full University Name
              </label>
              <input
                type="text"
                value={formData.university_name}
                onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Short Name / Acronym
              </label>
              <input
                type="text"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Institutional Motto
              </label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Main Campus Location
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0F2137] border-b border-slate-100 pb-2">
            2. Academic Session & Admissions Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Current Academic Session
              </label>
              <input
                type="text"
                value={formData.current_academic_session}
                onChange={(e) => setFormData({ ...formData, current_academic_session: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Active Semester
              </label>
              <select
                value={formData.current_semester}
                onChange={(e) => setFormData({ ...formData, current_semester: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="First">First Semester (Harmattan)</option>
                <option value="Second">Second Semester (Rain)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Application Screening Fee (₦)
              </label>
              <input
                type="number"
                value={formData.application_fee_ngn}
                onChange={(e) => setFormData({ ...formData, application_fee_ngn: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.admissions_open}
                onChange={(e) => setFormData({ ...formData, admissions_open: e.target.checked })}
                className="rounded text-[#0F2137]"
              />
              <span>Admissions Portal Open (Accepting New UTME/DE Submissions)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenance_mode}
                onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                className="rounded text-rose-600"
              />
              <span className="text-rose-700">Maintenance Mode (Temporary Portal Freeze)</span>
            </label>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" leftIcon={Save}>
            Save & Deploy Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
