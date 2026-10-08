import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SystemSettings,
  Faculty,
  Department,
  Programme,
  AcademicSession,
  AcademicLevel,
  Application,
  ApplicationStatus,
  ApplicationDocument,
  Student,
  Staff,
  Invoice,
  Payment,
  Receipt,
  NewsArticle,
  UniversityEvent,
  Announcement,
  UniversityDocument,
  NotificationItem,
  DispatchedEmail,
  AuditLog,
  ContactMessage,
  FAQItem,
  DownloadResource,
  PaymentProvider,
  PaymentStatus,
  Role,
  Profile,
  UserRole,
} from '../../types/database';
import {
  initialSystemSettings,
  initialSessions,
  initialLevels,
  initialFaculties,
  initialDepartments,
  initialProgrammes,
  initialNews,
  initialEvents,
  initialAnnouncements,
  initialDocuments,
  initialFAQs,
  initialDownloads,
  initialApplications,
  initialStudents,
  initialStaff,
  initialInvoices,
  initialPayments,
  initialReceipts,
  initialAuditLogs,
  initialContactMessages,
  initialNotifications,
  initialDispatchedEmails,
  initialRoles,
  demoUserAccounts,
  schoolPresets,
  SchoolTemplatePreset,
} from './db';
import {
  generateApplicationNumber,
  generateMatricNumber,
  generateInvoiceNumber,
  generatePaymentReference,
  generateReceiptNumber,
} from '../utils';
import { useAuth } from '../auth/AuthContext';

interface UniversityDataContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  presets: SchoolTemplatePreset[];
  loadSchoolPreset: (presetId: string) => void;
  resetToDefaults: () => void;
  exportConfigJson: () => string;
  importConfigJson: (jsonStr: string) => { success: boolean; message?: string };

  rolesList: Role[];
  updateRoleDetails: (id: string, updates: Partial<Role>) => void;

  profiles: Profile[];
  createProfile: (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => Profile;
  updateProfileRole: (userId: string, newRole: UserRole) => void;
  updateProfileStatus: (userId: string, newStatus: Profile['status']) => void;

  sessions: AcademicSession[];
  levels: AcademicLevel[];
  faculties: Faculty[];
  departments: Department[];
  programmes: Programme[];
  addFaculty: (faculty: Omit<Faculty, 'id' | 'created_at'>) => void;
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;
  addDepartment: (dept: Omit<Department, 'id' | 'created_at'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addProgramme: (prog: Omit<Programme, 'id' | 'created_at'>) => void;
  updateProgramme: (id: string, updates: Partial<Programme>) => void;
  deleteProgramme: (id: string) => void;
  toggleProgrammeAdmission: (id: string, status?: 'open' | 'closed') => void;
  toggleAllProgrammesAdmission: (status: 'open' | 'closed') => void;

  applications: Application[];
  createOrUpdateApplication: (appData: Partial<Application>) => Application;
  updateApplicationStatus: (
    applicationId: string,
    status: ApplicationStatus,
    reviewerNotes?: string,
    rejectionReason?: string,
    matricNumber?: string
  ) => void;
  uploadApplicationDocument: (
    applicationId: string,
    doc: Omit<ApplicationDocument, 'id' | 'application_id' | 'created_at'>
  ) => void;

  students: Student[];
  admitApplicantAndCreateStudent: (
    applicationId: string,
    customMatricNumber?: string
  ) => { success: boolean; student?: Student; message?: string; emailDispatchedTo?: string; emailSubject?: string };
  updateStudentStatus: (studentId: string, status: Student['status']) => void;
  updateStudent: (
    studentId: string,
    studentUpdates: Partial<Student>,
    profileUpdates?: Partial<Profile>
  ) => void;
  resetStudentPassword: (
    studentId: string,
    customPassword?: string,
    sendEmail?: boolean
  ) => { success: boolean; password?: string; message: string; emailRecipient?: string };

  staffList: Staff[];
  addStaff: (staffData: Omit<Staff, 'id' | 'created_at'>) => void;
  updateStaff: (
    staffId: string,
    staffUpdates: Partial<Staff>,
    profileUpdates?: Partial<Profile>
  ) => void;
  updateStaffStatus: (staffId: string, status: Staff['status']) => void;
  resetStaffPassword: (
    staffId: string,
    customPassword?: string,
    sendEmail?: boolean
  ) => { success: boolean; password?: string; message: string; emailRecipient?: string };

  invoices: Invoice[];
  payments: Payment[];
  receipts: Receipt[];
  createInvoice: (inv: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'status'>) => Invoice;
  processPayment: (
    invoiceId: string,
    provider: PaymentProvider,
    payerDetails: { name: string; email: string; channel: 'card' | 'bank_transfer' | 'ussd' }
  ) => { success: boolean; payment: Payment; receipt: Receipt };

  news: NewsArticle[];
  addNews: (item: Omit<NewsArticle, 'id' | 'created_at' | 'views_count'>) => void;
  updateNews: (id: string, updates: Partial<NewsArticle>) => void;
  deleteNews: (id: string) => void;

  events: UniversityEvent[];
  addEvent: (item: Omit<UniversityEvent, 'id' | 'created_at'>) => void;
  updateEvent: (id: string, updates: Partial<UniversityEvent>) => void;
  deleteEvent: (id: string) => void;

  announcements: Announcement[];
  addAnnouncement: (item: Omit<Announcement, 'id' | 'created_at'>) => void;
  toggleAnnouncement: (id: string) => void;

  documents: UniversityDocument[];
  addDocument: (doc: Omit<UniversityDocument, 'id' | 'created_at' | 'download_count'>) => void;
  deleteDocument: (id: string) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  sendNotification: (item: Omit<NotificationItem, 'id' | 'created_at' | 'read'>) => void;

  dispatchedEmails: DispatchedEmail[];
  dispatchEmail: (email: Omit<DispatchedEmail, 'id' | 'sent_at' | 'status'>) => DispatchedEmail;
  resendMatriculationEmail: (applicationId: string) => { success: boolean; message: string; email?: DispatchedEmail };

  auditLogs: AuditLog[];
  recordAuditLog: (action: string, module: AuditLog['module'], recordId?: string, details?: Record<string, unknown> | string) => void;

  contactMessages: ContactMessage[];
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'created_at' | 'status'>) => void;
  markContactMessageRead: (id: string) => void;

  faqs: FAQItem[];
  downloads: DownloadResource[];
}

const UniversityDataContext = createContext<UniversityDataContextType | undefined>(undefined);

const DB_STORAGE_KEY = 'pfust_university_database_v1';

let globalEntityCounter = 0;
export const generateUniqueEntityId = (prefix: string): string => {
  globalEntityCounter += 1;
  const time = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${time}-${globalEntityCounter}-${rand}`;
};

const ensureUniqueEntityList = <T extends { id: string }>(items: T[], prefix: string): T[] => {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.map((item, idx) => {
    if (!item.id || seen.has(item.id)) {
      const uniqueId = `${prefix}-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 7)}`;
      seen.add(uniqueId);
      return { ...item, id: uniqueId };
    }
    seen.add(item.id);
    return item;
  });
};

export const UniversityDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  // Primary State
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialSystemSettings;
  });

  const [faculties, setFaculties] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_faculties`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'fac') : initialFaculties;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_departments`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'dept') : initialDepartments;
  });

  const [programmes, setProgrammes] = useState<Programme[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_programmes`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'prog') : initialProgrammes;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_applications`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'app') : initialApplications;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_students`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'stud') : initialStudents;
  });

  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_staff`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'stf') : initialStaff;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_invoices`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'inv') : initialInvoices;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_payments`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'pay') : initialPayments;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_receipts`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'rec') : initialReceipts;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_news`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'news') : initialNews;
  });

  const [events, setEvents] = useState<UniversityEvent[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_events`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'event') : initialEvents;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_announcements`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'ann') : initialAnnouncements;
  });

  const [documents, setDocuments] = useState<UniversityDocument[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_documents`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'doc') : initialDocuments;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_notifications`);
    if (saved) {
      try {
        const parsed: NotificationItem[] = JSON.parse(saved);
        return ensureUniqueEntityList(parsed, 'notif');
      } catch {
        // fallback
      }
    }
    return ensureUniqueEntityList(initialNotifications, 'notif');
  });

  const [dispatchedEmails, setDispatchedEmails] = useState<DispatchedEmail[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_dispatchedEmails`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'email') : initialDispatchedEmails;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_auditLogs`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'log') : initialAuditLogs;
  });

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_contactMessages`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'msg') : initialContactMessages;
  });

  const [rolesList, setRolesList] = useState<Role[]>(() => {
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_roles`);
    return saved ? ensureUniqueEntityList(JSON.parse(saved), 'role') : initialRoles;
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const defaultProfiles = demoUserAccounts.map((d) => d.profile);
    const saved = localStorage.getItem(`${DB_STORAGE_KEY}_profiles`);
    if (saved) {
      try {
        const parsed: Profile[] = JSON.parse(saved);
        // Ensure super admin profile is always up-to-date with Fidelis Sibe credentials
        const superAdminProfile = defaultProfiles.find((p) => p.role === 'super_admin');
        const updatedList = parsed.map((p) => {
          if (p.role === 'super_admin' || p.email === 'fidelissibe@gmail.com' || p.user_id === 'usr-admin-01') {
            return superAdminProfile || p;
          }
          return p;
        });
        if (!updatedList.some((p) => p.email === 'fidelissibe@gmail.com')) {
          if (superAdminProfile) updatedList.unshift(superAdminProfile);
        }
        return updatedList;
      } catch {
        // fallback
      }
    }
    return defaultProfiles;
  });

  // Sync to LocalStorage on updates for durable offline persistence
  useEffect(() => {
    try {
      localStorage.setItem(`${DB_STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${DB_STORAGE_KEY}_faculties`, JSON.stringify(faculties));
      localStorage.setItem(`${DB_STORAGE_KEY}_departments`, JSON.stringify(departments));
      localStorage.setItem(`${DB_STORAGE_KEY}_programmes`, JSON.stringify(programmes));
      localStorage.setItem(`${DB_STORAGE_KEY}_applications`, JSON.stringify(applications));
      localStorage.setItem(`${DB_STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${DB_STORAGE_KEY}_staff`, JSON.stringify(staffList));
      localStorage.setItem(`${DB_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(`${DB_STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${DB_STORAGE_KEY}_receipts`, JSON.stringify(receipts));
      localStorage.setItem(`${DB_STORAGE_KEY}_news`, JSON.stringify(news));
      localStorage.setItem(`${DB_STORAGE_KEY}_events`, JSON.stringify(events));
      localStorage.setItem(`${DB_STORAGE_KEY}_announcements`, JSON.stringify(announcements));
      localStorage.setItem(`${DB_STORAGE_KEY}_documents`, JSON.stringify(documents));
      localStorage.setItem(`${DB_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${DB_STORAGE_KEY}_dispatchedEmails`, JSON.stringify(dispatchedEmails));
      localStorage.setItem(`${DB_STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
      localStorage.setItem(`${DB_STORAGE_KEY}_contactMessages`, JSON.stringify(contactMessages));
      localStorage.setItem(`${DB_STORAGE_KEY}_roles`, JSON.stringify(rolesList));
      localStorage.setItem(`${DB_STORAGE_KEY}_profiles`, JSON.stringify(profiles));
    } catch {
      // ignore storage quota errors
    }
  }, [
    settings,
    faculties,
    departments,
    programmes,
    applications,
    students,
    staffList,
    invoices,
    payments,
    receipts,
    news,
    events,
    announcements,
    documents,
    notifications,
    dispatchedEmails,
    auditLogs,
    contactMessages,
    rolesList,
    profiles,
  ]);

  const recordAuditLog = (
    action: string,
    module: AuditLog['module'],
    recordId?: string,
    details?: Record<string, unknown> | string
  ) => {
    const actorName = profile
      ? `${profile.first_name} ${profile.last_name} (${profile.role})`
      : 'System Automated Service';
    const actorRole = profile?.role || 'system';

    const newLog: AuditLog = {
      id: generateUniqueEntityId('log'),
      user_id: profile?.user_id,
      actor_name: actorName,
      actor_role: actorRole,
      action,
      module,
      record_id: recordId,
      details,
      ip_address: '102.89.41.' + Math.floor(10 + Math.random() * 80),
      created_at: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings, updated_at: new Date().toISOString() };
      recordAuditLog('settings.updated', 'settings', updated.id, { changes: Object.keys(newSettings) });
      return updated;
    });
  };

  const loadSchoolPreset = (presetId: string) => {
    const matched = schoolPresets.find((p) => p.id === presetId);
    if (!matched) return;
    setSettings((prev) => {
      const merged = { ...prev, ...matched.settings, updated_at: new Date().toISOString() };
      recordAuditLog('template.preset_applied', 'settings', presetId, {
        preset_name: matched.name,
        badge: matched.badge,
      });
      return merged;
    });
  };

  const resetToDefaults = () => {
    setSettings(initialSystemSettings);
    setFaculties(initialFaculties);
    setDepartments(initialDepartments);
    setProgrammes(initialProgrammes);
    setRolesList(initialRoles);
    setProfiles(demoUserAccounts.map((d) => d.profile));
    recordAuditLog('template.reset_defaults', 'settings', 'all', 'Restored system template factory defaults');
  };

  const exportConfigJson = (): string => {
    const fullConfig = {
      version: '2.0.0',
      exported_at: new Date().toISOString(),
      institution: settings,
      faculties,
      departments,
      programmes,
      roles: rolesList,
    };
    return JSON.stringify(fullConfig, null, 2);
  };

  const importConfigJson = (jsonStr: string): { success: boolean; message?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.institution && !parsed.university_name) {
        return { success: false, message: 'Invalid school configuration format. Missing institution data.' };
      }

      if (parsed.institution) {
        setSettings((prev) => ({ ...prev, ...parsed.institution, updated_at: new Date().toISOString() }));
      } else {
        setSettings((prev) => ({ ...prev, ...parsed, updated_at: new Date().toISOString() }));
      }

      if (Array.isArray(parsed.faculties)) setFaculties(parsed.faculties);
      if (Array.isArray(parsed.departments)) setDepartments(parsed.departments);
      if (Array.isArray(parsed.programmes)) setProgrammes(parsed.programmes);
      if (Array.isArray(parsed.roles)) setRolesList(parsed.roles);

      recordAuditLog('template.config_imported', 'settings', 'custom_import', 'Imported external school configuration bundle');
      return { success: true, message: 'Institutional template loaded successfully!' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'JSON parse failure';
      return { success: false, message: `Failed to import configuration: ${message}` };
    }
  };

  const updateRoleDetails = (id: string, updates: Partial<Role>) => {
    setRolesList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    recordAuditLog('role.updated', 'users', id, updates);
  };

  const createProfile = (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Profile => {
    const newProf: Profile = {
      ...data,
      id: generateUniqueEntityId('prof'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProfiles((prev) => [newProf, ...prev]);
    recordAuditLog('user.created', 'users', newProf.user_id, {
      name: `${newProf.first_name} ${newProf.last_name}`,
      role: newProf.role,
      email: newProf.email,
    });
    return newProf;
  };

  const updateProfileRole = (userId: string, newRole: UserRole) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.user_id === userId ? { ...p, role: newRole, updated_at: new Date().toISOString() } : p
      )
    );
    recordAuditLog('user.role_changed', 'users', userId, { new_role: newRole });
  };

  const updateProfileStatus = (userId: string, newStatus: Profile['status']) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.user_id === userId ? { ...p, status: newStatus, updated_at: new Date().toISOString() } : p
      )
    );
    recordAuditLog('user.status_changed', 'users', userId, { new_status: newStatus });
  };

  const addFaculty = (fac: Omit<Faculty, 'id' | 'created_at'>) => {
    const newFac: Faculty = {
      ...fac,
      id: generateUniqueEntityId('fac'),
      created_at: new Date().toISOString(),
    };
    setFaculties((prev) => [...prev, newFac]);
    recordAuditLog('faculty.created', 'academics', newFac.id, { name: newFac.name, code: newFac.code });
  };

  const updateFaculty = (id: string, updates: Partial<Faculty>) => {
    setFaculties((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    recordAuditLog('faculty.updated', 'academics', id, updates);
  };

  const deleteFaculty = (id: string) => {
    const target = faculties.find((f) => f.id === id);
    setFaculties((prev) => prev.filter((f) => f.id !== id));
    recordAuditLog('faculty.deleted', 'academics', id, { name: target?.name, code: target?.code });
  };

  const addDepartment = (dept: Omit<Department, 'id' | 'created_at'>) => {
    const newDept: Department = {
      ...dept,
      id: generateUniqueEntityId('dept'),
      created_at: new Date().toISOString(),
    };
    setDepartments((prev) => [...prev, newDept]);
    recordAuditLog('department.created', 'academics', newDept.id, { name: newDept.name, code: newDept.code });
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    recordAuditLog('department.updated', 'academics', id, updates);
  };

  const deleteDepartment = (id: string) => {
    const target = departments.find((d) => d.id === id);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    recordAuditLog('department.deleted', 'academics', id, { name: target?.name, code: target?.code });
  };

  const addProgramme = (prog: Omit<Programme, 'id' | 'created_at'>) => {
    const newProg: Programme = {
      ...prog,
      id: generateUniqueEntityId('prog'),
      created_at: new Date().toISOString(),
    };
    setProgrammes((prev) => [...prev, newProg]);
    recordAuditLog('programme.created', 'academics', newProg.id, { name: newProg.name, code: newProg.code });
  };

  const updateProgramme = (id: string, updates: Partial<Programme>) => {
    setProgrammes((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        // sync application_availability with admission_status if updated
        if (updates.admission_status) {
          updated.application_availability = updates.admission_status === 'open' || updates.admission_status === 'extended';
        } else if (updates.application_availability !== undefined) {
          updated.admission_status = updates.application_availability ? 'open' : 'closed';
        }
        return updated;
      })
    );
    recordAuditLog('programme.updated', 'academics', id, updates);
  };

  const deleteProgramme = (id: string) => {
    const target = programmes.find((p) => p.id === id);
    setProgrammes((prev) => prev.filter((p) => p.id !== id));
    recordAuditLog('programme.deleted', 'academics', id, { name: target?.name, code: target?.code });
  };

  const toggleProgrammeAdmission = (id: string, status?: 'open' | 'closed') => {
    setProgrammes((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const currentIsOpen = p.admission_status === 'open' || (p.application_availability ?? true);
        const targetIsOpen = status !== undefined ? status === 'open' : !currentIsOpen;
        const newStatus = targetIsOpen ? 'open' : 'closed';
        return {
          ...p,
          admission_status: newStatus,
          application_availability: targetIsOpen,
        };
      })
    );
    recordAuditLog('programme.admission_status.toggled', 'academics', id, { status });
  };

  const toggleAllProgrammesAdmission = (status: 'open' | 'closed') => {
    const isOpen = status === 'open';
    setProgrammes((prev) =>
      prev.map((p) => ({
        ...p,
        admission_status: status,
        application_availability: isOpen,
      }))
    );
    recordAuditLog('programmes.all_admissions.toggled', 'academics', undefined, { status });
  };

  // Applications
  const createOrUpdateApplication = (appData: Partial<Application>): Application => {
    let resultApp: Application;

    if (appData.id) {
      const existing = applications.find((a) => a.id === appData.id);
      if (existing) {
        resultApp = {
          ...existing,
          ...appData,
          updated_at: new Date().toISOString(),
        };
        setApplications((prev) => prev.map((a) => (a.id === appData.id ? resultApp : a)));
        recordAuditLog('application.updated', 'admissions', resultApp.id, { status: resultApp.status });
        return resultApp;
      }
    }

    // Create New Application
    const newAppNumber = generateApplicationNumber();
    const targetProgramme = programmes.find((p) => p.id === appData.programme_id) || programmes[0];

    resultApp = {
      id: generateUniqueEntityId('app'),
      applicant_id: appData.applicant_id || generateUniqueEntityId('appl'),
      application_number: newAppNumber,
      academic_session_id: appData.academic_session_id || 'sess-2026',
      programme_id: targetProgramme.id,
      application_type: appData.application_type || 'UTME',
      status: appData.status || 'draft',
      payment_status: appData.payment_status || 'pending',
      olevel_results: appData.olevel_results || [],
      jamb_score: appData.jamb_score,
      jamb_reg_number: appData.jamb_reg_number,
      personal_statement: appData.personal_statement,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      programme: targetProgramme,
      documents: appData.documents || [],
      applicant: appData.applicant,
    };

    setApplications((prev) => [resultApp, ...prev]);
    recordAuditLog('application.created', 'admissions', resultApp.id, {
      application_number: resultApp.application_number,
      programme: targetProgramme.name,
    });

    return resultApp;
  };

  const updateApplicationStatus = (
    applicationId: string,
    status: ApplicationStatus,
    reviewerNotes?: string,
    rejectionReason?: string,
    matricNumber?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app;
        const updated: Application = {
          ...app,
          status,
          matric_number: matricNumber || app.matric_number,
          reviewer_notes: reviewerNotes !== undefined ? reviewerNotes : app.reviewer_notes,
          rejection_reason: rejectionReason !== undefined ? rejectionReason : app.rejection_reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.user_id || 'usr-admin-01',
          admitted_at: status === 'admitted' ? new Date().toISOString() : app.admitted_at,
          admitted_programme_id: status === 'admitted' ? app.programme_id : app.admitted_programme_id,
          updated_at: new Date().toISOString(),
        };

        recordAuditLog(`application.status.${status}`, 'admissions', app.id, {
          application_number: app.application_number,
          new_status: status,
          matric_number: matricNumber || app.matric_number,
          reviewer_notes: reviewerNotes,
        });

        // Send notification to applicant if profile exists
        if (app.applicant?.user_id) {
          sendNotification({
            user_id: app.applicant.user_id,
            title: status === 'admitted' ? '🎉 Admission Offer Granted!' : `Application Status: ${status.replace('_', ' ').toUpperCase()}`,
            message: status === 'admitted'
              ? `Congratulations! You have been granted provisional admission into ${app.programme?.name || 'your chosen programme'}.`
              : `Your application ${app.application_number} status has been updated to ${status}.`,
            type: status === 'admitted' ? 'admission' : 'info',
            link_url: '/portal/applicant',
          });
        }

        return updated;
      })
    );
  };

  const uploadApplicationDocument = (
    applicationId: string,
    doc: Omit<ApplicationDocument, 'id' | 'application_id' | 'created_at'>
  ) => {
    const newDoc: ApplicationDocument = {
      ...doc,
      id: generateUniqueEntityId('doc'),
      application_id: applicationId,
      created_at: new Date().toISOString(),
    };

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app;
        return {
          ...app,
          documents: [...(app.documents || []), newDoc],
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  // Electronic Communication / Email Dispatch Service
  const dispatchEmail = (
    emailData: Omit<DispatchedEmail, 'id' | 'sent_at' | 'status'>
  ): DispatchedEmail => {
    const newEmail: DispatchedEmail = {
      ...emailData,
      id: generateUniqueEntityId('email'),
      status: 'delivered',
      sent_at: new Date().toISOString(),
    };

    setDispatchedEmails((prev) => [newEmail, ...prev]);

    recordAuditLog('email.dispatched', 'admissions', newEmail.reference_id, {
      recipient: newEmail.recipient_email,
      subject: newEmail.subject,
      category: newEmail.category,
      matric_number: newEmail.matric_number,
      application_number: newEmail.application_number,
    });

    return newEmail;
  };

  // Convert Admitted Applicant to Student Record & Generate Matriculation Number
  const admitApplicantAndCreateStudent = (
    applicationId: string,
    customMatricNumber?: string
  ): { success: boolean; student?: Student; message?: string; emailDispatchedTo?: string; emailSubject?: string } => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) {
      return { success: false, message: 'Application not found' };
    }

    const prog = programmes.find((p) => p.id === targetApp.programme_id) || programmes[0];
    const dept = departments.find((d) => d.id === prog.department_id) || departments[0];
    const fac = faculties.find((f) => f.id === prog.faculty_id) || faculties[0];

    const matricNo = customMatricNumber || generateMatricNumber(2026, fac.code, dept.code);

    const newStudent: Student = {
      id: generateUniqueEntityId('stud'),
      user_id: targetApp.applicant?.user_id || generateUniqueEntityId('usr-stud'),
      profile_id: targetApp.applicant?.profile_id || generateUniqueEntityId('prof-stud'),
      applicant_id: targetApp.applicant_id,
      student_number: matricNo,
      programme_id: prog.id,
      department_id: dept.id,
      faculty_id: fac.id,
      academic_session_id: 'sess-2026',
      level_id: 'lvl-100',
      status: 'active',
      admission_date: new Date().toISOString().split('T')[0],
      current_cgpa: 0.0,
      created_at: new Date().toISOString(),
      profile: targetApp.applicant?.profile,
      programme: prog,
      department: dept,
      faculty: fac,
      level: initialLevels[0],
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Update Application to admitted with matric number
    updateApplicationStatus(applicationId, 'admitted', `Admitted as student with Matric Number: ${matricNo}`, undefined, matricNo);

    // Retrieve recipient email from applicant registration profile / application form submission
    const applicantProfile = targetApp.applicant?.profile;
    const recipientEmail =
      applicantProfile?.email ||
      targetApp.applicant?.email ||
      (targetApp as any).email ||
      '';

    const recipientName = applicantProfile
      ? `${applicantProfile.first_name} ${applicantProfile.middle_name ? applicantProfile.middle_name + ' ' : ''}${applicantProfile.last_name}`
      : 'Admitted Student';

    const emailSubject = `Official Matriculation Notice & Student Number Assignment — ${settings.university_name || 'PFUST'} [Matric No: ${matricNo}]`;
    const emailBodyText = `Dear ${recipientName},\n\nCongratulations! You have been officially matriculated into ${settings.university_name} for the ${settings.current_academic_session} Academic Session.\n\nYour official University Matriculation Number is: ${matricNo}\nProgramme: ${prog.degree_type || 'B.Sc.'} ${prog.name}\nFaculty: ${fac.name} (${fac.code})\nDepartment: ${dept.name} (${dept.code})\nLevel: 100 Level (Freshman)\nApplication Ref Number: ${targetApp.application_number}\n\nYou may now access the Student Portal with your Matriculation Number or your registered email address (${recipientEmail}) to complete course registration and ID card issuance.\n\nOffice of the Registrar & Admissions Directorate,\n${settings.university_name}`;

    const emailBodyHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: #0F2137; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">${settings.university_name}</h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #f59e0b; letter-spacing: 0.5px;">OFFICE OF THE REGISTRAR • DIRECTORATE OF ADMISSIONS & SCREENING</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #065f46; font-size: 18px; margin-top: 0;">🎉 Official Matriculation Notice & Number Assignment</h2>
        <p style="font-size: 14px; line-height: 1.5;">Dear <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5;">We are pleased to inform you that following the successful verification and approval of your admission credentials, you have been formally assigned your official university matriculation number for the <strong>${settings.current_academic_session} Academic Session</strong>.</p>
        
        <div style="background: #f0fdf4; border: 2px dashed #059669; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 11px; text-transform: uppercase; color: #047857; font-weight: bold; display: block; letter-spacing: 1px;">Official University Matriculation Number</span>
          <span style="font-size: 24px; font-weight: 900; font-family: monospace; color: #064e3b; letter-spacing: 1.5px; display: block; margin-top: 6px;">${matricNo}</span>
        </div>

        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Admitted Programme:</td><td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${prog.degree_type || 'B.Sc.'} ${prog.name}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Faculty:</td><td style="padding: 8px 0; font-weight: 600;">${fac.name} (${fac.code})</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Department:</td><td style="padding: 8px 0; font-weight: 600;">${dept.name} (${dept.code})</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Class Cohort / Level:</td><td style="padding: 8px 0; font-weight: 600;">100 Level (Freshman)</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Application Ref:</td><td style="padding: 8px 0; font-weight: 600; font-family: monospace;">${targetApp.application_number}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Applicant Email:</td><td style="padding: 8px 0; font-weight: 600; color: #2563eb;">${recipientEmail}</td></tr>
        </table>

        <div style="background: #f8fafc; border-left: 4px solid #0F2137; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
          <strong style="font-size: 13px; color: #0F2137; display: block; margin-bottom: 4px;">Student Portal Onboarding Instructions:</strong>
          <ol style="margin: 0; padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.6;">
            <li>Log in to the University Student Portal with your new Matric Number (<strong>${matricNo}</strong>) or registered email (<strong>${recipientEmail}</strong>).</li>
            <li>Review and confirm your student bio-data record.</li>
            <li>Pay acceptance fee and 1st semester tuition fee schedule.</li>
            <li>Complete departmental course registration and generate semester timetable.</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="/portal/student" style="background: #0F2137; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Access Student Portal Now →</a>
        </div>

        <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-bottom: 0; line-height: 1.4;">
          This electronic communication was automatically dispatched to the applicant email address provided during your online application submission (<strong>${recipientEmail}</strong>). Please keep this email safe. For help, contact <a href="mailto:admissions@pfust.edu.ng" style="color: #2563eb;">admissions@pfust.edu.ng</a>.
        </p>
      </div>
    </div>`;

    // Automatically send email to candidate's email address from application form
    if (recipientEmail) {
      dispatchEmail({
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject: emailSubject,
        body_text: emailBodyText,
        body_html: emailBodyHtml,
        category: 'matriculation_issuance',
        reference_id: targetApp.id,
        matric_number: matricNo,
        application_number: targetApp.application_number,
      });
    }

    recordAuditLog('student.matriculated', 'students', newStudent.id, {
      matric_number: matricNo,
      programme: prog.name,
      applicant_number: targetApp.application_number,
      email_dispatched_to: recipientEmail,
    });

    return {
      success: true,
      student: newStudent,
      emailDispatchedTo: recipientEmail,
      emailSubject: emailSubject,
      message: `Student matriculated with Matric No: ${matricNo}. Official confirmation email dispatched to ${recipientEmail}.`,
    };
  };

  const resendMatriculationEmail = (
    applicationId: string
  ): { success: boolean; message: string; email?: DispatchedEmail } => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: 'Application record not found' };
    }

    const matricNo = app.matric_number || (students.find((s) => s.applicant_id === app.applicant_id)?.student_number);
    if (!matricNo) {
      return { success: false, message: 'No matriculation number has been generated for this applicant yet.' };
    }

    const applicantProfile = app.applicant?.profile;
    const recipientEmail =
      applicantProfile?.email ||
      app.applicant?.email ||
      (app as any).email ||
      '';

    if (!recipientEmail) {
      return { success: false, message: 'No email address found on applicant submission form.' };
    }

    const recipientName = applicantProfile
      ? `${applicantProfile.first_name} ${applicantProfile.middle_name ? applicantProfile.middle_name + ' ' : ''}${applicantProfile.last_name}`
      : 'Admitted Student';

    const prog = programmes.find((p) => p.id === app.admitted_programme_id || p.id === app.programme_id) || programmes[0];
    const dept = departments.find((d) => d.id === prog.department_id) || departments[0];
    const fac = faculties.find((f) => f.id === prog.faculty_id) || faculties[0];

    const emailSubject = `Official Matriculation Notice & Student Number Assignment — ${settings.university_name || 'PFUST'} [Matric No: ${matricNo}]`;
    const emailBodyText = `Dear ${recipientName},\n\nCongratulations! You have been officially matriculated into ${settings.university_name} for the ${settings.current_academic_session} Academic Session.\n\nYour official University Matriculation Number is: ${matricNo}\nProgramme: ${prog.degree_type || 'B.Sc.'} ${prog.name}\nFaculty: ${fac.name} (${fac.code})\nDepartment: ${dept.name} (${dept.code})\nLevel: 100 Level (Freshman)\nApplication Ref Number: ${app.application_number}\n\nYou may now access the Student Portal with your Matriculation Number or your registered email address (${recipientEmail}) to complete course registration and ID card issuance.\n\nOffice of the Registrar & Admissions Directorate,\n${settings.university_name}`;

    const emailBodyHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: #0F2137; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">${settings.university_name}</h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #f59e0b; letter-spacing: 0.5px;">OFFICE OF THE REGISTRAR • DIRECTORATE OF ADMISSIONS & SCREENING</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #065f46; font-size: 18px; margin-top: 0;">🎉 Official Matriculation Notice & Number Assignment (Copy)</h2>
        <p style="font-size: 14px; line-height: 1.5;">Dear <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5;">This is an official re-transmission of your matriculation confirmation for <strong>${settings.university_name}</strong> (${settings.current_academic_session} Academic Session).</p>
        
        <div style="background: #f0fdf4; border: 2px dashed #059669; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 11px; text-transform: uppercase; color: #047857; font-weight: bold; display: block; letter-spacing: 1px;">Official University Matriculation Number</span>
          <span style="font-size: 24px; font-weight: 900; font-family: monospace; color: #064e3b; letter-spacing: 1.5px; display: block; margin-top: 6px;">${matricNo}</span>
        </div>

        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Admitted Programme:</td><td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${prog.degree_type || 'B.Sc.'} ${prog.name}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Faculty:</td><td style="padding: 8px 0; font-weight: 600;">${fac.name} (${fac.code})</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Department:</td><td style="padding: 8px 0; font-weight: 600;">${dept.name} (${dept.code})</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Class Cohort / Level:</td><td style="padding: 8px 0; font-weight: 600;">100 Level (Freshman)</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Application Ref:</td><td style="padding: 8px 0; font-weight: 600; font-family: monospace;">${app.application_number}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Applicant Email:</td><td style="padding: 8px 0; font-weight: 600; color: #2563eb;">${recipientEmail}</td></tr>
        </table>

        <div style="background: #f8fafc; border-left: 4px solid #0F2137; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
          <strong style="font-size: 13px; color: #0F2137; display: block; margin-bottom: 4px;">Student Portal Onboarding Instructions:</strong>
          <ol style="margin: 0; padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.6;">
            <li>Log in to the University Student Portal with your Matric Number (<strong>${matricNo}</strong>) or registered email (<strong>${recipientEmail}</strong>).</li>
            <li>Review and confirm your student bio-data record.</li>
            <li>Pay acceptance fee and 1st semester tuition fee schedule.</li>
            <li>Complete departmental course registration.</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="/portal/student" style="background: #0F2137; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Access Student Portal Now →</a>
        </div>

        <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-bottom: 0; line-height: 1.4;">
          This electronic communication was dispatched to the candidate email address specified on the admission application form (<strong>${recipientEmail}</strong>).
        </p>
      </div>
    </div>`;

    const dispatched = dispatchEmail({
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject: emailSubject,
      body_text: emailBodyText,
      body_html: emailBodyHtml,
      category: 'matriculation_issuance',
      reference_id: app.id,
      matric_number: matricNo,
      application_number: app.application_number,
    });

    return {
      success: true,
      message: `Official matriculation email re-dispatched to ${recipientEmail}`,
      email: dispatched,
    };
  };

  const updateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
    recordAuditLog('student.status.updated', 'students', studentId, { status });
  };

  const updateStudent = (
    studentId: string,
    studentUpdates: Partial<Student>,
    profileUpdates?: Partial<Profile>
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        // Resolve programme / dept / faculty if programme_id changed
        let prog = s.programme;
        let dept = s.department;
        let fac = s.faculty;
        if (studentUpdates.programme_id && studentUpdates.programme_id !== s.programme_id) {
          prog = programmes.find((p) => p.id === studentUpdates.programme_id) || s.programme;
          if (prog?.department_id) {
            dept = departments.find((d) => d.id === prog.department_id) || s.department;
          }
          if (prog?.faculty_id) {
            fac = faculties.find((f) => f.id === prog.faculty_id) || s.faculty;
          }
        }

        const mergedProfile = profileUpdates
          ? ({ ...(s.profile || {}), ...profileUpdates } as Profile)
          : s.profile;

        return {
          ...s,
          ...studentUpdates,
          programme: prog,
          department: dept,
          faculty: fac,
          profile: mergedProfile,
        };
      })
    );

    // Also update in profiles state if profileUpdates provided
    if (profileUpdates) {
      setProfiles((prev) =>
        prev.map((p) => {
          const targetStudent = students.find((s) => s.id === studentId);
          if (
            targetStudent &&
            (p.id === targetStudent.profile_id ||
              p.user_id === targetStudent.user_id ||
              p.email === targetStudent.profile?.email)
          ) {
            return { ...p, ...profileUpdates };
          }
          return p;
        })
      );
    }

    recordAuditLog('student.updated', 'students', studentId, {
      studentUpdates,
      profileUpdates,
    });
  };

  const resetStudentPassword = (
    studentId: string,
    customPassword?: string,
    sendEmail: boolean = true
  ): { success: boolean; password?: string; message: string; emailRecipient?: string } => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, message: 'Student record not found in registry.' };
    }

    const generatedPassword =
      customPassword && customPassword.trim().length >= 6
        ? customPassword.trim()
        : `PFUST-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}!`;

    const recipientEmail = student.profile?.email || 'student@pfust.edu.ng';
    const studentName = student.profile
      ? `${student.profile.first_name} ${student.profile.last_name}`
      : 'Undergraduate Scholar';

    // Dispatch official email notification if requested
    let emailDispatched = false;
    if (sendEmail && recipientEmail) {
      const emailContentText = `Dear ${studentName},\n\nYour Prime Form University of Science and Technology (PFUST) Student Portal password has been reset by the Super Administrator.\n\nYour Active Login Credentials:\n- Institutional Matriculation Number: ${student.student_number}\n- Registered Email: ${recipientEmail}\n- Temporary Password: ${generatedPassword}\n\nPlease proceed to the Student Portal to sign in and change your password immediately upon authentication.\n\nPortal URL: https://pfust.edu.ng/student-portal\n\nSecurity Notice: If you did not request this credential change, please contact the University ICT Directorate at helpdesk@pfust.edu.ng.\n\nRegards,\nPFUST University Directorate of ICT & Student Records`;

      dispatchEmail({
        recipient_email: recipientEmail,
        recipient_name: studentName,
        subject: `🔐 PFUST Student Portal Password Reset - Matric No: ${student.student_number}`,
        body_text: emailContentText,
        body_html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #002147;">PFUST Student Portal Password Reset</h2>
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your Prime Form University of Science and Technology (PFUST) Student Portal password has been reset by the Super Administrator.</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Institutional Matriculation Number:</strong> <code>${student.student_number}</code></p>
            <p style="margin: 5px 0;"><strong>Registered Email:</strong> ${recipientEmail}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="font-size: 16px; color: #002147; font-weight: bold;">${generatedPassword}</code></p>
          </div>
          <p>Please proceed to the Student Portal to sign in and update your password.</p>
          <p style="font-size: 12px; color: #64748b;">Security Notice: If you did not request this credential change, please contact the University ICT Directorate at helpdesk@pfust.edu.ng.</p>
        </div>`,
        category: 'status_update',
        reference_id: student.id,
        matric_number: student.student_number,
      });
      emailDispatched = true;
    }

    recordAuditLog('student.password_reset', 'students', student.id, {
      student_number: student.student_number,
      email: recipientEmail,
      dispatched_email: emailDispatched,
      reset_by: 'Super Administrator',
    });

    sendNotification({
      user_id: student.user_id,
      title: `Student Password Reset: ${student.student_number}`,
      message: `Password reset credentials generated and ${emailDispatched ? `emailed to ${recipientEmail}` : 'stored'}.`,
      type: 'info',
    });

    return {
      success: true,
      password: generatedPassword,
      message: `Password successfully reset! ${emailDispatched ? `Official credential notice dispatched to ${recipientEmail}.` : ''}`,
      emailRecipient: recipientEmail,
    };
  };

  // Staff
  const addStaff = (staffData: Omit<Staff, 'id' | 'created_at'>) => {
    const newStaff: Staff = {
      ...staffData,
      id: generateUniqueEntityId('stf'),
      created_at: new Date().toISOString(),
    };
    setStaffList((prev) => [newStaff, ...prev]);
    recordAuditLog('staff.created', 'staff', newStaff.id, { staff_id: newStaff.staff_id, designation: newStaff.designation });
  };

  const updateStaffStatus = (staffId: string, status: Staff['status']) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status } : s))
    );
    recordAuditLog('staff.status_updated', 'staff', staffId, { status });
  };

  const updateStaff = (
    staffId: string,
    staffUpdates: Partial<Staff>,
    profileUpdates?: Partial<Profile>
  ) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;

        let dept = s.department;
        let fac = s.faculty;

        if (staffUpdates.department_id) {
          dept = departments.find((d) => d.id === staffUpdates.department_id) || s.department;
          if (dept?.faculty_id) {
            fac = faculties.find((f) => f.id === dept.faculty_id) || s.faculty;
          }
        }
        if (staffUpdates.faculty_id) {
          fac = faculties.find((f) => f.id === staffUpdates.faculty_id) || fac;
        }

        const mergedProfile = profileUpdates
          ? ({ ...(s.profile || {}), ...profileUpdates } as Profile)
          : s.profile;

        return {
          ...s,
          ...staffUpdates,
          department: dept,
          faculty: fac,
          profile: mergedProfile,
        };
      })
    );

    if (profileUpdates) {
      setProfiles((prev) =>
        prev.map((p) => {
          const targetStaff = staffList.find((s) => s.id === staffId);
          if (
            targetStaff &&
            (p.id === targetStaff.profile_id ||
              p.user_id === targetStaff.user_id ||
              p.email === targetStaff.profile?.email)
          ) {
            return { ...p, ...profileUpdates };
          }
          return p;
        })
      );
    }

    recordAuditLog('staff.updated', 'staff', staffId, {
      staffUpdates,
      profileUpdates,
    });
  };

  const resetStaffPassword = (
    staffId: string,
    customPassword?: string,
    sendEmail: boolean = true
  ): { success: boolean; password?: string; message: string; emailRecipient?: string } => {
    const staffMember = staffList.find((s) => s.id === staffId);
    if (!staffMember) {
      return { success: false, message: 'Staff record not found in registry.' };
    }

    const generatedPassword =
      customPassword && customPassword.trim().length >= 6
        ? customPassword.trim()
        : `PFUST-STF-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}!`;

    const recipientEmail = staffMember.profile?.email || 'staff@pfust.edu.ng';
    const staffName = staffMember.profile
      ? `${staffMember.profile.first_name} ${staffMember.profile.last_name}`
      : 'Faculty / Staff Member';

    let emailDispatched = false;
    if (sendEmail && recipientEmail) {
      const emailContentText = `Dear ${staffName},\n\nYour Prime Form University of Science and Technology (PFUST) Staff & Faculty Portal login credentials have been reset by the Super Administrator.\n\nYour Active Login Credentials:\n- Institutional Staff ID: ${staffMember.staff_id}\n- Designation: ${staffMember.designation}\n- Registered Official Email: ${recipientEmail}\n- Temporary Password: ${generatedPassword}\n\nPlease proceed to the University Staff Portal to sign in and update your security credentials.\n\nPortal URL: https://pfust.edu.ng/staff-portal\n\nSecurity Notice: If you did not request this credential change, please alert the Directorate of ICT Security immediately at helpdesk@pfust.edu.ng.\n\nRegards,\nPFUST University Directorate of ICT & Human Resources`;

      dispatchEmail({
        recipient_email: recipientEmail,
        recipient_name: staffName,
        subject: `🔐 PFUST Staff Portal Login Credentials Reset - Staff ID: ${staffMember.staff_id}`,
        body_text: emailContentText,
        body_html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #002147;">PFUST Staff Portal Credentials Reset</h2>
          <p>Dear <strong>${staffName}</strong>,</p>
          <p>Your Prime Form University of Science and Technology (PFUST) Staff & Faculty Portal password has been reset by the Super Administrator.</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Institutional Staff ID:</strong> <code>${staffMember.staff_id}</code></p>
            <p style="margin: 5px 0;"><strong>Designation / Rank:</strong> ${staffMember.designation}</p>
            <p style="margin: 5px 0;"><strong>Cadre:</strong> ${staffMember.staff_category?.toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Official Email:</strong> ${recipientEmail}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="font-size: 16px; color: #002147; font-weight: bold;">${generatedPassword}</code></p>
          </div>
          <p>Please proceed to the Staff Portal to sign in and update your password.</p>
          <p style="font-size: 12px; color: #64748b;">Security Notice: If you did not request this credential change, please contact the Directorate of ICT at helpdesk@pfust.edu.ng.</p>
        </div>`,
        category: 'status_update',
        reference_id: staffMember.id,
        matric_number: staffMember.staff_id,
      });
      emailDispatched = true;
    }

    recordAuditLog('staff.password_reset', 'staff', staffMember.id, {
      staff_id: staffMember.staff_id,
      email: recipientEmail,
      dispatched_email: emailDispatched,
      reset_by: 'Super Administrator',
    });

    sendNotification({
      user_id: staffMember.user_id,
      title: `Staff Password Reset: ${staffMember.staff_id}`,
      message: `Password reset credentials generated and ${emailDispatched ? `emailed to ${recipientEmail}` : 'recorded'}.`,
      type: 'info',
    });

    return {
      success: true,
      password: generatedPassword,
      message: `Staff password successfully reset! ${emailDispatched ? `Official credential notice dispatched to ${recipientEmail}.` : ''}`,
      emailRecipient: recipientEmail,
    };
  };

  // Invoices & Payment Architecture
  const createInvoice = (inv: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'status'>): Invoice => {
    const newInvoice: Invoice = {
      ...inv,
      id: generateUniqueEntityId('inv'),
      invoice_number: generateInvoiceNumber(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    recordAuditLog('invoice.created', 'payments', newInvoice.id, {
      invoice_number: newInvoice.invoice_number,
      amount: newInvoice.amount_ngn,
    });
    return newInvoice;
  };

  const processPayment = (
    invoiceId: string,
    provider: PaymentProvider,
    payerDetails: { name: string; email: string; channel: 'card' | 'bank_transfer' | 'ussd' }
  ): { success: boolean; payment: Payment; receipt: Receipt } => {
    const targetInvoice = invoices.find((inv) => inv.id === invoiceId);
    const amount = targetInvoice ? targetInvoice.amount_ngn : 15000;
    const ref = generatePaymentReference();
    const receiptNo = generateReceiptNumber();

    const payment: Payment = {
      id: generateUniqueEntityId('pay'),
      invoice_id: invoiceId,
      payment_reference: ref,
      transaction_id: `${provider.toUpperCase()}_${Date.now()}`,
      amount_ngn: amount,
      currency: 'NGN',
      provider,
      channel: payerDetails.channel,
      status: 'successful',
      paid_at: new Date().toISOString(),
      payer_email: payerDetails.email,
      payer_name: payerDetails.name,
      receipt_number: receiptNo,
      created_at: new Date().toISOString(),
      invoice: targetInvoice,
    };

    const receipt: Receipt = {
      id: generateUniqueEntityId('rec'),
      receipt_number: receiptNo,
      payment_id: payment.id,
      invoice_id: invoiceId,
      amount_paid_ngn: amount,
      payment_date: new Date().toISOString(),
      payer_name: payerDetails.name,
      payer_identifier: targetInvoice?.invoice_number || ref,
      description: targetInvoice?.title || 'University Educational Fee',
      academic_session: '2026/2027',
      issued_by: 'University Electronic Bursary Counter',
      verified: true,
    };

    setPayments((prev) => [payment, ...prev]);
    setReceipts((prev) => [receipt, ...prev]);

    // Mark invoice as successful
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'successful', paid_at: new Date().toISOString() } : inv
      )
    );

    // If this was an application fee invoice, mark application payment status as successful
    if (targetInvoice?.application_id) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === targetInvoice.application_id
            ? { ...app, payment_status: 'successful', status: app.status === 'draft' ? 'paid' : app.status }
            : app
        )
      );
    }

    recordAuditLog('payment.successful', 'payments', payment.id, {
      reference: ref,
      amount,
      provider,
      payer: payerDetails.name,
    });

    return { success: true, payment, receipt };
  };

  // CMS
  const addNews = (item: Omit<NewsArticle, 'id' | 'created_at' | 'views_count'>) => {
    const newItem: NewsArticle = {
      ...item,
      id: generateUniqueEntityId('news'),
      views_count: 0,
      created_at: new Date().toISOString(),
    };
    setNews((prev) => [newItem, ...prev]);
    recordAuditLog('news.created', 'documents', newItem.id, { title: newItem.title });
  };

  const updateNews = (id: string, updates: Partial<NewsArticle>) => {
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    recordAuditLog('news.updated', 'documents', id, updates);
  };

  const deleteNews = (id: string) => {
    setNews((prev) => prev.filter((n) => n.id !== id));
    recordAuditLog('news.deleted', 'documents', id);
  };

  const addEvent = (item: Omit<UniversityEvent, 'id' | 'created_at'>) => {
    const newItem: UniversityEvent = {
      ...item,
      id: generateUniqueEntityId('event'),
      created_at: new Date().toISOString(),
    };
    setEvents((prev) => [newItem, ...prev]);
    recordAuditLog('event.created', 'documents', newItem.id, { title: newItem.title });
  };

  const updateEvent = (id: string, updates: Partial<UniversityEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    recordAuditLog('event.updated', 'documents', id, updates);
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    recordAuditLog('event.deleted', 'documents', id);
  };

  const addAnnouncement = (item: Omit<Announcement, 'id' | 'created_at'>) => {
    const newItem: Announcement = {
      ...item,
      id: generateUniqueEntityId('ann'),
      created_at: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newItem, ...prev]);
    recordAuditLog('announcement.created', 'documents', newItem.id, { title: newItem.title });
  };

  const toggleAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: !a.is_active } : a))
    );
  };

  const addDocument = (doc: Omit<UniversityDocument, 'id' | 'created_at' | 'download_count'>) => {
    const newDoc: UniversityDocument = {
      ...doc,
      id: generateUniqueEntityId('doc'),
      download_count: 0,
      created_at: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    recordAuditLog('document.uploaded', 'documents', newDoc.id, { title: newDoc.title });
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    recordAuditLog('document.deleted', 'documents', id);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const sendNotification = (item: Omit<NotificationItem, 'id' | 'created_at' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: generateUniqueEntityId('notif'),
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const submitContactMessage = (msg: Omit<ContactMessage, 'id' | 'created_at' | 'status'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: generateUniqueEntityId('msg'),
      status: 'new',
      created_at: new Date().toISOString(),
    };
    setContactMessages((prev) => [newMsg, ...prev]);
  };

  const markContactMessageRead = (id: string) => {
    setContactMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m))
    );
  };

  return (
    <UniversityDataContext.Provider
      value={{
        settings,
        updateSettings,
        presets: schoolPresets,
        loadSchoolPreset,
        resetToDefaults,
        exportConfigJson,
        importConfigJson,

        rolesList,
        updateRoleDetails,

        profiles,
        createProfile,
        updateProfileRole,
        updateProfileStatus,

        sessions: initialSessions,
        levels: initialLevels,
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

        applications,
        createOrUpdateApplication,
        updateApplicationStatus,
        uploadApplicationDocument,

        students,
        admitApplicantAndCreateStudent,
        updateStudentStatus,
        updateStudent,
        resetStudentPassword,

        staffList,
        addStaff,
        updateStaff,
        updateStaffStatus,
        resetStaffPassword,

        invoices,
        payments,
        receipts,
        createInvoice,
        processPayment,

        news,
        addNews,
        updateNews,
        deleteNews,

        events,
        addEvent,
        updateEvent,
        deleteEvent,

        announcements,
        addAnnouncement,
        toggleAnnouncement,

        documents,
        addDocument,
        deleteDocument,

        notifications,
        markNotificationRead,
        sendNotification,

        dispatchedEmails,
        dispatchEmail,
        resendMatriculationEmail,

        auditLogs,
        recordAuditLog,

        contactMessages,
        submitContactMessage,
        markContactMessageRead,

        faqs: initialFAQs,
        downloads: initialDownloads,
      }}
    >
      {children}
    </UniversityDataContext.Provider>
  );
};

export const useUniversityData = () => {
  const context = useContext(UniversityDataContext);
  if (!context) {
    throw new Error('useUniversityData must be used within a UniversityDataProvider');
  }
  return context;
};
