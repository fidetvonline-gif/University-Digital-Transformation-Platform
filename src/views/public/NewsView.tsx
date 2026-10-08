import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  Search,
  Download,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';
import { Button, Card, Badge } from '../../components/ui/common';
import { Modal } from '../../components/ui/Modal';
import { NewsArticle } from '../../types/database';

export const NewsView: React.FC<{
  onNavigate: (view: string, params?: any) => void;
  selectedArticleId?: string;
}> = ({ onNavigate, selectedArticleId }) => {
  const { news } = useUniversityData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(() => {
    if (selectedArticleId) {
      return news.find((n) => n.id === selectedArticleId) || null;
    }
    return null;
  });

  const categories = ['all', 'Admissions', 'Academic', 'Research', 'General', 'Infrastructure'];

  const filteredNews = news.filter((item) => {
    if (!item) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !term ||
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.summary && item.summary.toLowerCase().includes(term)) ||
      (item.content && item.content.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">Media & Publications</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Official University News & Gazettes
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Stay up to date with official Senate announcements, academic calendars, research breakthroughs,
            admissions lists, and campus developmental milestones.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Search & Category Filter */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news by headline, keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F2137] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Gazettes' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <Card
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="p-0 overflow-hidden hover:border-[#0F2137] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center text-slate-600">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <FileText className="w-12 h-12" />
                )}
                <div className="absolute top-3 left-3">
                  <Badge variant="gold" className="text-[10px] uppercase font-bold">
                    {article.category}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(article.published_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F2137] line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F2137]">
                  <span>Read Full Article</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <Modal
          isOpen={Boolean(activeArticle)}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
          subtitle={`Published on ${new Date(activeArticle.published_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })} • Category: ${activeArticle.category}`}
          size="xl"
          footer={
            <Button variant="outline" size="sm" onClick={() => setActiveArticle(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {activeArticle.image_url && (
              <div className="h-64 rounded-xl overflow-hidden mb-4">
                <img
                  src={activeArticle.image_url}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4 bg-slate-50 border-l-4 border-l-[#0F2137] rounded-r-xl font-medium text-slate-800 italic">
              "{activeArticle.summary}"
            </div>
            <div className="whitespace-pre-line pt-2 text-slate-700">
              {activeArticle.content}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export const DownloadsView: React.FC = () => {
  const { downloads, settings } = useUniversityData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filtered = downloads.filter((d) => {
    if (!d) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !term ||
      (d.title && d.title.toLowerCase().includes(term)) ||
      (d.category && d.category.toLowerCase().includes(term));
    const matchesCat = selectedCat === 'all' || d.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleDownload = (item: any) => {
    // Generate a downloadable text payload as mock document
    const blob = new Blob(
      [
        `====================================================\n${settings.university_name}\n${(item.title || 'DOCUMENT').toUpperCase()}\n====================================================\nCategory: ${item.category || 'General'}\nSession: ${settings.current_academic_session}\nGenerated: ${new Date().toISOString()}\n\nOfficial certified document issued by the Registry.\n`
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(item.title || 'document').toLowerCase().replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">Registry & Academic Documents</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Downloads, Academic Calendar & Forms
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Download official university handbooks, accredited degree brochures, Post-UTME screening forms,
            fee structures, and academic calendars.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search forms, calendars, handbooks..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
            />
          </div>

          <div className="flex items-center gap-2">
            {['all', 'Academic', 'Admissions', 'Registry', 'Handbook'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-[#0F2137] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Files' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="p-6 flex flex-col justify-between hover:border-[#0F2137] hover:shadow-md transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {item.category}
                  </span>
                  <Badge variant="neutral" className="text-[10px] font-mono">
                    {item.file_type} • {item.file_size}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-[#0F2137]">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Official university document certified by the Registrar for public and student use.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.download_count || 120} downloads
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(item)}
                  leftIcon={Download}
                >
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const { settings, submitContactMessage } = useUniversityData();
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    subject: 'Admissions Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sender_name || !formData.sender_email || !formData.message) return;

    submitContactMessage({
      sender_name: formData.sender_name,
      sender_email: formData.sender_email,
      sender_phone: formData.sender_phone,
      subject: formData.subject,
      message: formData.message,
    });

    setSubmitted(true);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#0F2137] text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="gold">University Helpdesk</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contact University Administration
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Have questions about admissions, transcripts, campus accommodation, or ICT portal support?
            Reach out to the University Helpdesk directly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="text-base font-bold text-[#0F2137] border-b border-slate-100 pb-3">
                Campus Location & Directory
              </h3>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 text-[#0F2137] rounded-lg shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900">Main Campus Address</span>
                    <p className="text-slate-500 mt-0.5">{settings.address}, {settings.state_country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 text-[#0F2137] rounded-lg shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900">Official Electronic Mail</span>
                    <p className="text-slate-500 mt-0.5">Admissions: admissions@pfust.edu.ng</p>
                    <p className="text-slate-500">Registry: registry@pfust.edu.ng</p>
                    <p className="text-slate-500">Bursary: bursary@pfust.edu.ng</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 text-[#0F2137] rounded-lg shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900">Helpdesk Telephone Lines</span>
                    <p className="text-slate-500 mt-0.5">{settings.contact_phone} (General Inquiries)</p>
                    <p className="text-slate-500">+234 803 111 2233 (Admissions Directorate)</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Operating Hours */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">
                Office Operating Hours
              </span>
              <p className="text-slate-600">
                <strong>Monday – Friday:</strong> 8:00 AM – 4:00 PM (WAT)
              </p>
              <p className="text-slate-500">
                Closed on Federal Public Holidays and Weekends.
              </p>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#0F2137]">Send Direct Message to University Desk</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your inquiry will be logged directly into the administrative CRM and routed to the responsible department.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Message Successfully Sent!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you for reaching out. The Admissions and Registry desk will respond to your email within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ sender_name: '', sender_email: '', sender_phone: '', subject: 'General Inquiry', message: '' });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.sender_name}
                        onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                        placeholder="e.g. Maryam Bello"
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.sender_email}
                        onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                        placeholder="e.g. maryam@gmail.com"
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.sender_phone}
                        onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                        placeholder="08012345678"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Subject / Department *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                      >
                        <option value="Admissions Inquiry">Admissions Inquiry & Post-UTME</option>
                        <option value="Transcript Verification">Transcript & Verification</option>
                        <option value="Fees & Bursary">Fees, Payments & Remita RRR</option>
                        <option value="ICT & Portal Support">ICT & Student Portal Support</option>
                        <option value="General Registry">General Registry Desk</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your detailed inquiry here..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full" leftIcon={Send}>
                    Transmit Message to University Registry
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
