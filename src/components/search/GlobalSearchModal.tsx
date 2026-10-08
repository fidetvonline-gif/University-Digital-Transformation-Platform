import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  GraduationCap,
  FileText,
  Calendar,
  HelpCircle,
  Download,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useUniversityData } from '../../lib/supabase/UniversityDataContext';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { faculties, programmes, news, events, downloads, faqs } = useUniversityData();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const results: Array<{
      category: 'Programme' | 'Faculty' | 'News' | 'Event' | 'Download' | 'FAQ';
      title: string;
      subtitle: string;
      icon: any;
      action: () => void;
    }> = [];

    // Programmes
    programmes.forEach((p) => {
      if (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      ) {
        results.push({
          category: 'Programme',
          title: `${p.name} (${p.degree_type})`,
          subtitle: `${p.code} • ${p.duration_years} Years • ${p.admission_status}`,
          icon: GraduationCap,
          action: () => {
            onClose();
            onNavigate('programmes', { programmeId: p.id });
          },
        });
      }
    });

    // Faculties
    faculties.forEach((f) => {
      if ((f.name && f.name.toLowerCase().includes(q)) || (f.code && f.code.toLowerCase().includes(q))) {
        results.push({
          category: 'Faculty',
          title: f.name,
          subtitle: `${f.code} • Dean: ${f.dean_name}`,
          icon: BookOpen,
          action: () => {
            onClose();
            onNavigate('faculties', { facultyId: f.id });
          },
        });
      }
    });

    // News
    news.forEach((n) => {
      if ((n.title && n.title.toLowerCase().includes(q)) || (n.summary && n.summary.toLowerCase().includes(q))) {
        results.push({
          category: 'News',
          title: n.title,
          subtitle: `${n.category} • ${(n.published_at || '').split('T')[0]}`,
          icon: FileText,
          action: () => {
            onClose();
            onNavigate('news', { articleId: n.id });
          },
        });
      }
    });

    // Events
    events.forEach((e) => {
      if ((e.title && e.title.toLowerCase().includes(q)) || (e.location && e.location.toLowerCase().includes(q))) {
        results.push({
          category: 'Event',
          title: e.title,
          subtitle: `${e.event_date} • ${e.location}`,
          icon: Calendar,
          action: () => {
            onClose();
            onNavigate('events', { eventId: e.id });
          },
        });
      }
    });

    // Downloads
    downloads.forEach((d) => {
      if ((d.title && d.title.toLowerCase().includes(q)) || (d.category && d.category.toLowerCase().includes(q))) {
        results.push({
          category: 'Download',
          title: d.title,
          subtitle: `${d.category} • ${d.file_type} (${d.file_size})`,
          icon: Download,
          action: () => {
            onClose();
            onNavigate('downloads');
          },
        });
      }
    });

    // FAQs
    faqs.forEach((faq) => {
      if ((faq.question && faq.question.toLowerCase().includes(q)) || (faq.answer && faq.answer.toLowerCase().includes(q))) {
        results.push({
          category: 'FAQ',
          title: faq.question,
          subtitle: `Category: ${faq.category}`,
          icon: HelpCircle,
          action: () => {
            onClose();
            onNavigate('admissions');
          },
        });
      }
    });

    return results.slice(0, 10);
  }, [query, programmes, faculties, news, events, downloads, faqs, onClose, onNavigate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global University Search"
      subtitle="Quickly find academic programmes, faculty profiles, admissions requirements, news, and forms."
      size="lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type programme name, faculty, course code, admissions, or circulars..."
            autoFocus
            className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2137] focus:bg-white"
          />
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {['Computer Science', 'Cybersecurity', 'Software Engineering', 'Admissions 2026', 'School Fees', 'Academic Calendar'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQuery(chip)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {searchResults.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pt-2">
            {searchResults.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full p-3 flex items-start gap-3 hover:bg-slate-50 rounded-lg text-left transition-colors group cursor-pointer"
                >
                  <div className="p-2 bg-slate-100 group-hover:bg-[#0F2137] group-hover:text-amber-400 text-slate-600 rounded-lg transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0F2137] group-hover:translate-x-0.5 transition-all self-center" />
                </button>
              );
            })}
          </div>
        ) : query ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No matching programmes, documents or news found for "{query}". Try checking your spelling or search by department name.
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
