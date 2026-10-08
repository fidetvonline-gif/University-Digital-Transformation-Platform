import React, { useState, useRef } from 'react';
import {
  Building2,
  Palette,
  Image as ImageIcon,
  UserCheck,
  GraduationCap,
  CreditCard,
  MapPin,
  Save,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus,
  Trash2,
  Globe,
  Mail,
  Phone,
  Shield,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Card, Button, Badge } from '../../components/ui/common';
import { SystemSettings } from '../../types/database';

export const SettingsTab: React.FC = () => {
  const {
    settings,
    updateSettings,
    presets,
    loadSchoolPreset,
    resetToDefaults,
    exportConfigJson,
    importConfigJson,
  } = useUniversityData();

  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'branding' | 'leadership' | 'admissions' | 'contact' | 'presets' | 'backup'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // File upload refs
  const logoFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const headPhotoFileRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Synchronize local form when global settings change (e.g. after preset loaded)
  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo_url' | 'hero_image_url' | 'head_photo_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 3MB for localStorage safety)
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB. Please select an image under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, [field]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (presetId: string) => {
    if (!presetId) return;
    loadSchoolPreset(presetId);
    setSelectedPresetId(presetId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleDownloadConfig = () => {
    const jsonString = exportConfigJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(formData.short_name || 'school').toLowerCase().replace(/[^a-z0-9]/g, '-')}-template-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const content = loadEvt.target?.result as string;
      if (content) {
        setImportJsonInput(content);
        executeImport(content);
      }
    };
    reader.readAsText(file);
  };

  const executeImport = (rawJson: string) => {
    setImportError(null);
    setImportSuccess(null);
    const result = importConfigJson(rawJson);
    if (result.success) {
      setImportSuccess(result.message || 'Configuration imported successfully!');
      setTimeout(() => setImportSuccess(null), 5000);
    } else {
      setImportError(result.message || 'Import failed. Check JSON format.');
    }
  };

  const colorPalettes = [
    { name: 'Oxford Navy & Gold', primary: '#002147', secondary: '#D4AF37' },
    { name: 'Forest Green & Amber', primary: '#0C3B2E', secondary: '#F59E0B' },
    { name: 'Royal Maroon & Gold', primary: '#4A0E17', secondary: '#D4AF37' },
    { name: 'Sapphire Indigo & Cyan', primary: '#1E1B4B', secondary: '#0284C7' },
    { name: 'Regal Purple & Gold', primary: '#3B0764', secondary: '#FACC15' },
    { name: 'Slate Charcoal & Emerald', primary: '#18181B', secondary: '#10B981' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#002147] text-[#D4AF37] rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                School Details & Multi-Tenant Template Manager
              </h1>
              <p className="text-xs text-gray-500">
                Super Admin Master Console • Configure school identity, logos, colors, leadership, fee schedules, presets, and deploy to any school.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={Download}
            onClick={handleDownloadConfig}
            title="Export complete configuration JSON to backup or replicate"
          >
            Export Config
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={Upload}
            onClick={() => setActiveSubTab('backup')}
            title="Import configuration JSON bundle"
          >
            Import JSON
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={Save}
            onClick={() => handleSave()}
            className="bg-[#002147] text-[#D4AF37] hover:bg-[#003366] font-semibold"
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Configuration Successfully Applied & Synced!
              </p>
              <p className="text-[11px] text-emerald-700">
                All public pages, portal layouts, crests, logos, leadership profiles, and academic parameters are now dynamically updated.
              </p>
            </div>
          </div>
          <Badge variant="success">Active Live</Badge>
        </div>
      )}

      {/* Real-Time Live Preview Header Card */}
      <Card className="p-5 border-2 border-[#002147]/20 bg-gradient-to-r from-slate-50 to-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#002147]" />
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Live School Identity Preview
            </span>
          </div>
          <span className="text-[11px] font-medium text-gray-500">
            Real-time reflection of current settings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Logo / Crest Column */}
          <div className="md:col-span-4 flex items-center gap-4">
            {formData.logo_url ? (
              <img
                src={formData.logo_url}
                alt={formData.university_name}
                className="w-16 h-16 object-contain rounded-lg border border-gray-200 p-1 bg-white shadow-sm"
              />
            ) : (
              <div
                style={{ backgroundColor: formData.primary_color, color: formData.secondary_color }}
                className="w-16 h-16 rounded-xl flex items-center justify-center font-serif font-black text-2xl shadow-md border-2 border-white"
              >
                {formData.crest_letter || formData.short_name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <span
                style={{ color: formData.primary_color }}
                className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 border border-gray-200"
              >
                {formData.institution_type || 'Tertiary Institution'}
              </span>
              <h2 className="text-sm font-bold text-gray-900 leading-tight mt-1">
                {formData.university_name || 'Institution Name'}
              </h2>
              <p className="text-xs text-gray-500 italic mt-0.5">
                "{formData.motto || 'Excellence and Innovation'}"
              </p>
            </div>
          </div>

          {/* Leadership & Academic Session Quick Badges */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {formData.head_title || 'Vice-Chancellor'}
              </span>
              <span className="font-bold text-gray-800 truncate block">
                {formData.head_name || formData.vice_chancellor || 'Prof. Leadership'}
              </span>
              <span className="text-[10px] text-gray-500 truncate block">
                {formData.head_qualification || 'Academic Leader'}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Academic Session
              </span>
              <span className="font-bold text-[#002147] block">
                {formData.current_academic_session} ({formData.current_semester || 'First'} Sem)
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 block">
                Admissions: {formData.admissions_open !== false ? 'OPEN' : 'CLOSED'} • Cut-off: {formData.minimum_cut_off_score || 160}
              </span>
            </div>
          </div>

          {/* Color Scheme Indicators */}
          <div className="md:col-span-3 flex flex-col items-end justify-center gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-gray-500 font-medium">Palette:</span>
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-gray-200 shadow-2xs">
                <span
                  style={{ backgroundColor: formData.primary_color }}
                  className="w-5 h-5 rounded-md border border-black/10 inline-block shadow-2xs"
                  title={`Primary: ${formData.primary_color}`}
                />
                <span
                  style={{ backgroundColor: formData.secondary_color }}
                  className="w-5 h-5 rounded-md border border-black/10 inline-block shadow-2xs"
                  title={`Secondary: ${formData.secondary_color}`}
                />
              </div>
            </div>
            <div className="text-[11px] text-gray-400 font-mono">
              {formData.domain || 'pfust.edu.ng'}
            </div>
          </div>
        </div>
      </Card>

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'general', label: '1. School Identity & Accreditation', icon: Building2 },
          { id: 'branding', label: '2. Logo, Images & Colors', icon: Palette },
          { id: 'leadership', label: '3. Leadership (VC / Rector)', icon: UserCheck },
          { id: 'admissions', label: '4. Admissions & Finance', icon: GraduationCap },
          { id: 'contact', label: '5. Campus Location & Socials', icon: MapPin },
          { id: 'presets', label: '6. Institutional Presets', icon: Sparkles },
          { id: 'backup', label: '7. Backup / JSON Export', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#002147] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SUBTAB 1: GENERAL IDENTITY */}
        {activeSubTab === 'general' && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#002147]" />
                  Institutional Classification & Legal Identity
                </h3>
                <Badge variant="info">Editable by Super Admin</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Official School / University Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.university_name}
                    onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                    placeholder="e.g. Premier Federal University of Science & Technology"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Displayed on all official degrees, transcripts, website headers, and admission letters.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Short Name / Acronym *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    placeholder="e.g. PFUST"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-bold tracking-wider focus:bg-white focus:ring-2 focus:ring-[#002147] focus:outline-none uppercase"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used in navigation bars, badges, invoice prefixes, and portals.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Institution Classification *
                  </label>
                  <select
                    value={formData.institution_type || 'Federal University'}
                    onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  >
                    <option value="Federal University">Federal University</option>
                    <option value="State University">State University</option>
                    <option value="Private University">Private University</option>
                    <option value="Polytechnic / Monotechnic">Polytechnic / Monotechnic</option>
                    <option value="College of Education">College of Education</option>
                    <option value="Specialized Academy">Specialized College / Academy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Year of Establishment
                  </label>
                  <input
                    type="number"
                    value={formData.established_year || 1998}
                    onChange={(e) => setFormData({ ...formData, established_year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Accreditation Body
                  </label>
                  <input
                    type="text"
                    value={formData.accreditation_body || 'National Universities Commission (NUC)'}
                    onChange={(e) => setFormData({ ...formData, accreditation_body: e.target.value })}
                    placeholder="e.g. NUC, NBTE, NCCE, COREN"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Institutional Motto / Slogan
                  </label>
                  <input
                    type="text"
                    value={formData.motto}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    placeholder="e.g. Excellence, Innovation and Character"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 italic focus:bg-white focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Accreditation & Charter Status
                  </label>
                  <input
                    type="text"
                    value={formData.accreditation_status || 'Fully Accredited & Licensed'}
                    onChange={(e) => setFormData({ ...formData, accreditation_status: e.target.value })}
                    placeholder="e.g. Fully Accredited & Licensed"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Institutional Summary & Mission Statement
                  </label>
                  <textarea
                    rows={3}
                    value={formData.meta_description || ''}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Brief description of the university's mandate, research excellence, and vision..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#002147] focus:outline-none"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SUBTAB 2: BRANDING, LOGO, IMAGES & COLORS */}
        {activeSubTab === 'branding' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Color Scheme Picker */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#002147]" />
                  University Color Theme & Presets
                </h3>
                <span className="text-xs text-gray-500">Applies across the entire platform</span>
              </div>

              {/* Color Presets Swatches */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Instant Color Swatches (1-Click Palette)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {colorPalettes.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          primary_color: p.primary,
                          secondary_color: p.secondary,
                        })
                      }
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        formData.primary_color === p.primary && formData.secondary_color === p.secondary
                          ? 'border-[#002147] ring-2 ring-[#002147] bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          style={{ backgroundColor: p.primary }}
                          className="w-4 h-4 rounded border border-black/10 inline-block shadow-2xs"
                        />
                        <span
                          style={{ backgroundColor: p.secondary }}
                          className="w-4 h-4 rounded border border-black/10 inline-block shadow-2xs"
                        />
                      </div>
                      <p className="text-[11px] font-bold text-gray-800 leading-tight truncate">
                        {p.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hex Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Primary Institutional Color (Oxford Navy / Maroon / Green)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none"
                    />
                    <span className="text-xs text-gray-500">Headers, sidebars, master badges</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Secondary Accent Color (Academic Gold / Amber / Cyan)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none"
                    />
                    <span className="text-xs text-gray-500">Buttons, highlights, active indicators</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Logo & Emblem Manager */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#002147]" />
                  School Logo, Crest Emblem & Favicon
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Config */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    School Logo (Image URL or Direct Upload)
                  </label>
                  <div className="flex items-start gap-4">
                    {formData.logo_url ? (
                      <div className="relative group">
                        <img
                          src={formData.logo_url}
                          alt="School Logo"
                          className="w-20 h-20 object-contain rounded-lg border border-gray-300 p-1.5 bg-white shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logo_url: '' })}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700"
                          title="Remove custom logo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{ backgroundColor: formData.primary_color, color: formData.secondary_color }}
                        className="w-20 h-20 rounded-xl flex items-center justify-center font-serif font-black text-3xl shadow-sm border-2 border-white shrink-0"
                      >
                        {formData.crest_letter || formData.short_name?.charAt(0) || 'U'}
                      </div>
                    )}

                    <div className="space-y-2 flex-1 text-xs">
                      <input
                        type="text"
                        value={formData.logo_url || ''}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://.../logo.png"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          ref={logoFileRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo_url')}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={Upload}
                          onClick={() => logoFileRef.current?.click()}
                        >
                          Upload Logo File
                        </Button>
                        <span className="text-[11px] text-gray-400">PNG, SVG or JPG (max 2MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crest Monogram Letter */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Fallback Crest Monogram Letter
                  </label>
                  <p className="text-xs text-gray-500">
                    Shown when no image logo is uploaded (e.g. "U" for University, "P" for Polytechnic, "A" for Academy).
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.crest_letter || 'U'}
                      onChange={(e) => setFormData({ ...formData, crest_letter: e.target.value.toUpperCase() })}
                      className="w-16 h-12 text-center text-xl font-bold bg-gray-50 border border-gray-300 rounded-lg uppercase focus:bg-white focus:outline-none"
                    />
                    <div className="text-xs text-gray-500">
                      Crest letter will be rendered inside the primary-colored emblem shield.
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Hero Banner & Campus Images */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#002147]" />
                  Campus Hero Banner & Media Gallery
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Homepage Hero Campus Banner Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {formData.hero_image_url && (
                      <img
                        src={formData.hero_image_url}
                        alt="Hero Preview"
                        className="w-full sm:w-48 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                    )}
                    <div className="space-y-2 flex-1 text-xs">
                      <input
                        type="text"
                        value={formData.hero_image_url || ''}
                        onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none text-xs"
                      />
                      <input
                        ref={heroFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'hero_image_url')}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={Upload}
                        onClick={() => heroFileRef.current?.click()}
                      >
                        Upload Banner Image
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SUBTAB 3: LEADERSHIP PROFILE */}
        {activeSubTab === 'leadership' && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#002147]" />
                  Executive Head of Institution (VC / Rector / Provost)
                </h3>
                <span className="text-xs text-gray-500">Displayed on Homepage Welcome & Admission Letters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Executive Title *
                  </label>
                  <select
                    value={formData.head_title || 'Vice-Chancellor'}
                    onChange={(e) => setFormData({ ...formData, head_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:outline-none"
                  >
                    <option value="Vice-Chancellor">Vice-Chancellor (Universities)</option>
                    <option value="Rector">Rector (Polytechnics)</option>
                    <option value="Provost">Provost (Colleges of Education)</option>
                    <option value="President">President & Vice-Chancellor</option>
                    <option value="Principal">Principal & Director</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Executive Head Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.head_name || formData.vice_chancellor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        head_name: e.target.value,
                        vice_chancellor: e.target.value,
                      })
                    }
                    placeholder="e.g. Prof. Abubakar S. Dikko"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Academic Qualifications & Fellowship Honors
                  </label>
                  <input
                    type="text"
                    value={formData.head_qualification || ''}
                    onChange={(e) => setFormData({ ...formData, head_qualification: e.target.value })}
                    placeholder="e.g. B.Eng, M.Sc, Ph.D, FNSE, FAEng"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Welcome Address & Institutional Vision
                  </label>
                  <textarea
                    rows={4}
                    value={formData.head_message || ''}
                    onChange={(e) => setFormData({ ...formData, head_message: e.target.value })}
                    placeholder="Official welcome address published on the home page and candidate acceptance packages..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Leadership Portrait Photo (URL or File Upload)
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.head_photo_url && (
                      <img
                        src={formData.head_photo_url}
                        alt="Head of Institution"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#002147] shadow-sm"
                      />
                    )}
                    <div className="space-y-2 flex-1">
                      <input
                        type="text"
                        value={formData.head_photo_url || ''}
                        onChange={(e) => setFormData({ ...formData, head_photo_url: e.target.value })}
                        placeholder="https://.../vc-photo.jpg"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none"
                      />
                      <input
                        ref={headPhotoFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'head_photo_url')}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={Upload}
                        onClick={() => headPhotoFileRef.current?.click()}
                      >
                        Upload Portrait Photo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Principal Officers */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#002147]" />
                  Principal Academic & Administrative Officers
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Registrar Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.registrar_name}
                    onChange={(e) => setFormData({ ...formData, registrar_name: e.target.value })}
                    placeholder="e.g. Dr. (Mrs.) Grace N. Okonkwo"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Signatory on Matriculation & Admission letters</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Bursar Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bursar_name}
                    onChange={(e) => setFormData({ ...formData, bursar_name: e.target.value })}
                    placeholder="e.g. Alhaji Ibrahim S. Danjuma, FCA"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Chief Financial Officer & Treasury Head</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    University Librarian Name
                  </label>
                  <input
                    type="text"
                    value={formData.librarian_name || ''}
                    onChange={(e) => setFormData({ ...formData, librarian_name: e.target.value })}
                    placeholder="e.g. Dr. Clement O. Adeleke, CLN"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Custodian of Digital Libraries & Academic Repositories</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SUBTAB 4: ADMISSIONS & FINANCE */}
        {activeSubTab === 'admissions' && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#002147]" />
                  Academic Calendar & Admissions Screening Controls
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Current Academic Session *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.current_academic_session}
                    onChange={(e) => setFormData({ ...formData, current_academic_session: e.target.value })}
                    placeholder="e.g. 2026/2027"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Active Semester / Term *
                  </label>
                  <select
                    value={formData.current_semester || 'First'}
                    onChange={(e) => setFormData({ ...formData, current_semester: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:outline-none"
                  >
                    <option value="First">First Semester (Harmattan)</option>
                    <option value="Second">Second Semester (Rain)</option>
                    <option value="Harmattan">Harmattan Semester</option>
                    <option value="Rain">Rain Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Minimum Screening Cut-Off Score
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_cut_off_score || 160}
                    onChange={(e) => setFormData({ ...formData, minimum_cut_off_score: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Threshold for UTME / Screening eligibility</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Admissions Status
                  </label>
                  <select
                    value={formData.admission_status || 'open'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        admission_status: e.target.value as any,
                        admissions_open: e.target.value !== 'closed',
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="open">Open (Accepting Applications)</option>
                    <option value="extended">Extended Application Window</option>
                    <option value="closed">Closed for the Session</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-3 border-t border-gray-100">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.admissions_open !== false}
                    onChange={(e) => setFormData({ ...formData, admissions_open: e.target.checked })}
                    className="w-4 h-4 rounded text-[#002147] focus:ring-[#002147]"
                  />
                  <span>Admissions Portal Active (Candidates can submit forms)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-rose-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.maintenance_mode || false}
                    onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Maintenance Mode (Freeze all portal operations temporarily)</span>
                </label>
              </div>
            </Card>

            {/* Fee Schedule & Bank Account */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#002147]" />
                  Fee Structure & Official Bank Account
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Currency Symbol & Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currency_symbol || '₦'}
                      onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                      className="w-14 px-2.5 py-2.5 text-center font-bold bg-gray-50 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={formData.currency_code || 'NGN'}
                      onChange={(e) => setFormData({ ...formData, currency_code: e.target.value.toUpperCase() })}
                      className="flex-1 px-3 py-2.5 font-bold uppercase bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Application Screening Fee ({formData.currency_symbol || '₦'})
                  </label>
                  <input
                    type="number"
                    value={formData.application_fee_ngn}
                    onChange={(e) => setFormData({ ...formData, application_fee_ngn: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Provisional Acceptance Fee ({formData.currency_symbol || '₦'})
                  </label>
                  <input
                    type="number"
                    value={formData.acceptance_fee_ngn}
                    onChange={(e) => setFormData({ ...formData, acceptance_fee_ngn: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Official Revenue Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name || 'Central Bank of Nigeria / Remita TSA Account'}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="e.g. Central Bank of Nigeria / Remita TSA"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Official Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_number || '0020485918'}
                    onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                    placeholder="e.g. 0020485918 / RRR Code"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Official Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_name || 'Bursary Revenue & Collections Account'}
                    onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                    placeholder="e.g. PFUST Bursary Revenue Account"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SUBTAB 5: CONTACT & SOCIALS */}
        {activeSubTab === 'contact' && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#002147]" />
                  Physical Campus Location & Postal Contacts
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Street Address / Campus Avenue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. University Boulevard, Academic City, PMB 1001"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    City, State & Country
                  </label>
                  <input
                    type="text"
                    value={formData.city_state || 'Abuja, FCT, Nigeria'}
                    onChange={(e) => setFormData({ ...formData, city_state: e.target.value })}
                    placeholder="e.g. Abuja, FCT"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Main Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@university.edu.ng"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Admissions Desk Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_information?.admissions_email || formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_information: {
                          ...formData.contact_information,
                          admissions_email: e.target.value,
                        },
                      })
                    }
                    placeholder="admissions@university.edu.ng"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Registry / Support Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 1 800 234 5678"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Official Web Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain || 'pfust.edu.ng'}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="pfust.edu.ng"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Microsoft 365 Tenant Domain
                  </label>
                  <input
                    type="text"
                    value={formData.microsoft_365?.tenant_domain || formData.domain || 'pfust.edu.ng'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        microsoft_365: {
                          ...formData.microsoft_365,
                          tenant_domain: e.target.value,
                        },
                      })
                    }
                    placeholder="pfust.edu.ng"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </Card>

            {/* Social Media Links */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#002147]" />
                  Social Media & Community Channels
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Twitter / X Profile URL
                  </label>
                  <input
                    type="text"
                    value={formData.social_media_links?.twitter || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_media_links: {
                          ...formData.social_media_links,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://x.com/university"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="text"
                    value={formData.social_media_links?.facebook || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_media_links: {
                          ...formData.social_media_links,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/university"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    LinkedIn Official Page
                  </label>
                  <input
                    type="text"
                    value={formData.social_media_links?.linkedin || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_media_links: {
                          ...formData.social_media_links,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="https://linkedin.com/school/university"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    type="text"
                    value={formData.social_media_links?.youtube || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_media_links: {
                          ...formData.social_media_links,
                          youtube: e.target.value,
                        },
                      })
                    }
                    placeholder="https://youtube.com/@university"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SUBTAB 6: PRESETS (1-CLICK TEMPLATES) */}
        {activeSubTab === 'presets' && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    1-Click Multi-School Templates & Institutional Presets
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Instantly reconfigure this deployment for any school type: Federal University, State University, Polytechnic, Private University, or College of Education.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {presets.map((preset) => {
                  const isCurrent = formData.university_name === preset.name;
                  return (
                    <div
                      key={preset.id}
                      className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#002147] ring-2 ring-[#002147] bg-blue-50/30'
                          : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {preset.badge}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              style={{ backgroundColor: preset.settings.primary_color }}
                              className="w-4 h-4 rounded border border-black/10 shadow-2xs"
                              title={`Primary: ${preset.settings.primary_color}`}
                            />
                            <span
                              style={{ backgroundColor: preset.settings.secondary_color }}
                              className="w-4 h-4 rounded border border-black/10 shadow-2xs"
                              title={`Secondary: ${preset.settings.secondary_color}`}
                            />
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                          {preset.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                          {preset.description}
                        </p>

                        <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-600 space-y-1">
                          <div>
                            <span className="font-semibold text-gray-700">Head:</span>{' '}
                            {preset.settings.head_title} ({preset.settings.head_name})
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Accreditation:</span>{' '}
                            {preset.settings.accreditation_body}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        {isCurrent ? (
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#002147] py-1.5 bg-blue-100/60 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Currently Active Template
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="w-full bg-[#002147] text-[#D4AF37] hover:bg-[#003366]"
                            onClick={() => handleApplyPreset(preset.id)}
                          >
                            Apply This School Template
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* SUBTAB 7: BACKUP, EXPORT & IMPORT JSON */}
        {activeSubTab === 'backup' && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#002147]" />
                    Template Export, Import & Replication
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Export the complete institutional state (settings, faculties, departments, programmes, roles) to deploy instantly across multiple school domains.
                  </p>
                </div>
              </div>

              {/* Status messages */}
              {importSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {importSuccess}
                </div>
              )}
              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs font-semibold text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  {importError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Column */}
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#002147]" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Export Current School Config
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Generates a portable <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-[11px]">school-config.json</code> file containing all branding, colors, fees, and academic metadata.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    leftIcon={Download}
                    onClick={handleDownloadConfig}
                    className="w-full bg-[#002147] text-[#D4AF37] hover:bg-[#003366]"
                  >
                    Download Configuration File (.json)
                  </Button>
                </div>

                {/* Import File Column */}
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#002147]" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Upload School Configuration File
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Upload a JSON template to restore or migrate settings from another deployment.
                  </p>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    leftIcon={Upload}
                    onClick={() => importFileRef.current?.click()}
                    className="w-full"
                  >
                    Select .json File to Import
                  </Button>
                </div>
              </div>

              {/* Paste JSON Manually */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Or Paste Raw Configuration JSON
                </label>
                <textarea
                  rows={5}
                  value={importJsonInput}
                  onChange={(e) => setImportJsonInput(e.target.value)}
                  placeholder='{"university_name": "...", "short_name": "...", "primary_color": "#002147" ...}'
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-none"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!importJsonInput.trim()}
                  onClick={() => executeImport(importJsonInput)}
                >
                  Apply Pasted JSON Config
                </Button>
              </div>

              {/* Factory Reset */}
              <div className="p-5 bg-rose-50 rounded-xl border border-rose-200 space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Factory Template Reset
                    </h4>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Restores all institutional parameters, sample faculties, and role assignments to initial factory defaults.
                    </p>
                  </div>
                  {showResetConfirm ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResetConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          resetToDefaults();
                          setShowResetConfirm(false);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 4000);
                        }}
                      >
                        Confirm Reset
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResetConfirm(true)}
                      className="text-rose-700 border-rose-300 hover:bg-rose-100"
                    >
                      Reset to Factory Default
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-gray-300 shadow-lg flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-700">
              Editing Template for:{' '}
              <span className="font-bold text-gray-900">{formData.university_name}</span> (
              {formData.short_name})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={RotateCcw}
              onClick={() => setFormData({ ...settings })}
            >
              Revert Unsaved
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={Save}
              className="bg-[#002147] text-[#D4AF37] hover:bg-[#003366] font-bold shadow-md"
            >
              Save & Deploy School Template
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
