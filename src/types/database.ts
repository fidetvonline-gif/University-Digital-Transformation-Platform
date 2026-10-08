export type UserRole =
  | 'super_admin'
  | 'management'
  | 'registrar'
  | 'bursar'
  | 'admissions_officer'
  | 'ict_admin'
  | 'registry_officer'
  | 'faculty_admin'
  | 'department_admin'
  | 'staff'
  | 'student'
  | 'applicant';

export type ApplicationStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'submitted'
  | 'under_review'
  | 'correction_required'
  | 'approved'
  | 'rejected'
  | 'admitted';

export type PaymentStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentProvider = 'paystack' | 'flutterwave' | 'remita' | 'bank_transfer' | 'mock_sandbox';

export type DegreeType = 'B.Sc.' | 'B.Eng.' | 'B.A.' | 'B.Tech.' | 'LL.B.' | 'MBBS' | 'M.Sc.' | 'Ph.D.' | 'Diploma';

export type DocumentCategory =
  | 'Admissions'
  | 'Academic'
  | 'Registry'
  | 'Finance'
  | 'Policies'
  | 'Forms'
  | 'Circulars'
  | 'Reports'
  | 'Publications';

export interface SystemSettings {
  id: string;
  university_name: string;
  short_name: string;
  motto: string;
  institution_type?: string; // 'Federal University' | 'State University' | 'Private University' | 'Polytechnic' | 'College of Education' | 'Specialized Academy'
  established_year?: number;
  accreditation_body?: string; // e.g. 'National Universities Commission (NUC)' | 'NBTE' | 'NCCE'
  accreditation_status?: string;
  meta_description?: string;
  crest_letter?: string; // e.g. 'U' or 'P' or 'A'
  logo_url: string;
  favicon_url: string;
  hero_image_url?: string;
  campus_showcase_images?: Array<{ id: string; title: string; image_url: string; description: string }>;
  primary_color: string;
  secondary_color: string;
  address: string;
  city_state?: string;
  state_country?: string;
  phone: string;
  email: string;
  contact_email?: string;
  contact_phone?: string;
  website: string;
  domain: string;
  vice_chancellor: string;
  head_title?: string; // 'Vice-Chancellor' | 'Rector' | 'Provost' | 'President' | 'Principal'
  head_name?: string;
  head_qualification?: string;
  head_message?: string;
  head_photo_url?: string;
  registrar_name: string;
  bursar_name: string;
  librarian_name?: string;
  current_academic_session: string;
  current_application_session: string;
  current_semester?: 'First' | 'Second' | 'Harmattan' | 'Rain';
  admission_status: 'open' | 'closed' | 'extended';
  admissions_open?: boolean;
  maintenance_mode?: boolean;
  minimum_cut_off_score?: number;
  application_fee_ngn: number;
  acceptance_fee_ngn: number;
  currency_symbol?: string; // '₦' | '$' | '£' | '€' | 'GH₵'
  currency_code?: string; // 'NGN' | 'USD' | 'GBP' | 'EUR' | 'GHS'
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  contact_information: {
    admissions_email: string;
    support_phone: string;
    pmo_address: string;
  };
  social_media_links: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
  };
  microsoft_365: {
    tenant_domain: string;
    portal_url: string;
    enabled: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth?: string;
  address?: string;
  state_of_origin?: string;
  lga?: string;
  nationality: string;
  marital_status?: string;
  religion?: string;
  next_of_kin_name?: string;
  next_of_kin_relationship?: string;
  next_of_kin_phone?: string;
  next_of_kin_address?: string;
  status: 'active' | 'suspended' | 'pending';
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: UserRole;
  display_name: string;
  description: string;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  category: string;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  description: string;
  dean_name?: string;
  dean_email?: string;
  established_year: number;
  status: 'active' | 'archived';
  created_at: string;
}

export interface Department {
  id: string;
  faculty_id: string;
  name: string;
  code: string;
  hod_name?: string;
  hod_email?: string;
  status: 'active' | 'archived';
  created_at: string;
  faculty?: Faculty;
}

export interface Programme {
  id: string;
  department_id: string;
  faculty_id: string;
  name: string;
  code: string;
  degree_type: DegreeType;
  duration_years: number;
  entry_requirements: string[];
  description: string;
  tuition_per_session_ngn: number;
  status: 'active' | 'archived';
  application_availability: boolean;
  department?: Department;
  faculty?: Faculty;
  created_at: string;
  tuition_fee_ngn?: number;
  jamb_cutoff_score?: number;
  admission_status?: 'open' | 'closed' | 'extended';
  career_prospects?: string[];
  total_credits_required?: number;
}

export interface AcademicSession {
  id: string;
  name: string; // e.g. "2026/2027"
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_application_open: boolean;
}

export interface AcademicLevel {
  id: string;
  code: string; // e.g. "100L", "200L"
  name: string;
  description: string;
}

export interface Applicant {
  id: string;
  user_id: string;
  profile_id: string;
  jamb_reg_number?: string;
  jamb_score?: number;
  first_choice_programme_id?: string;
  second_choice_programme_id?: string;
  created_at: string;
  profile?: Profile;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: 'passport' | 'birth_certificate' | 'o_level' | 'jamb_result' | 'lga_identification' | 'testimonial' | 'other';
  title: string;
  file_url: string;
  file_size_kb: number;
  file_type: string;
  verified: boolean;
  created_at: string;
}

export interface OLevelSubject {
  subject: string;
  grade: 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';
}

export interface OLevelResult {
  exam_type: 'WAEC' | 'NECO' | 'NABTEB';
  exam_year: number;
  exam_number: string;
  center_number?: string;
  subjects: OLevelSubject[];
}

export interface Application {
  id: string;
  applicant_id: string;
  application_number: string; // Format: APP/2026/000001
  academic_session_id: string;
  programme_id: string;
  application_type: 'UTME' | 'Direct Entry' | 'Postgraduate' | 'Part-Time' | 'Transfer';
  status: ApplicationStatus;
  payment_status: PaymentStatus;
  olevel_results?: OLevelResult[];
  jamb_score?: number;
  jamb_reg_number?: string;
  matric_number?: string; // Generated matriculation number upon admission
  previous_institution?: string;
  previous_qualification?: string;
  cgpa?: number;
  personal_statement?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  rejection_reason?: string;
  admitted_programme_id?: string;
  admitted_at?: string;
  created_at: string;
  updated_at: string;
  applicant?: Applicant & { profile?: Profile };
  programme?: Programme & { faculty?: Faculty; department?: Department };
  admitted_programme?: Programme;
  documents?: ApplicationDocument[];
  academic_session?: AcademicSession;
}

export interface Student {
  id: string;
  user_id: string;
  profile_id: string;
  applicant_id?: string;
  student_number: string; // Matric number, format: 2026/ND/ABC/0001 or 2026/FCS/CSC/0042
  programme_id: string;
  department_id: string;
  faculty_id: string;
  academic_session_id: string;
  level_id: string;
  status: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'deferred';
  admission_date: string;
  current_cgpa?: number;
  profile?: Profile;
  programme?: Programme;
  department?: Department;
  faculty?: Faculty;
  level?: AcademicLevel;
  academic_session?: AcademicSession;
  created_at: string;
}

export interface Staff {
  id: string;
  user_id: string;
  profile_id: string;
  staff_id: string; // e.g. STF/2024/012
  department_id: string;
  faculty_id?: string;
  designation: string; // e.g. "Senior Lecturer", "HOD", "Dean", "Admissions Officer", "ICT Analyst"
  staff_category: 'academic' | 'non_academic' | 'administrative' | 'executive';
  status: 'active' | 'on_leave' | 'retired' | 'resigned';
  profile?: Profile;
  department?: Department;
  faculty?: Faculty;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string; // e.g. INV-2026-00412
  user_id: string;
  profile_id: string;
  application_id?: string;
  student_id?: string;
  title: string;
  description: string;
  amount_ngn: number;
  fee_category: 'application_fee' | 'acceptance_fee' | 'tuition_fee' | 'faculty_dues' | 'department_dues' | 'late_registration' | 'transcript_fee';
  status: PaymentStatus;
  academic_session_id: string;
  due_date: string;
  created_at: string;
  paid_at?: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  payment_reference: string; // e.g. TXN-UNILAG-89417284
  transaction_id?: string;
  amount_ngn: number;
  currency: string;
  provider: PaymentProvider;
  channel: 'card' | 'bank_transfer' | 'ussd' | 'bank_branch';
  status: PaymentStatus;
  paid_at?: string;
  payer_email: string;
  payer_name: string;
  metadata?: Record<string, unknown>;
  receipt_number?: string;
  created_at: string;
  invoice?: Invoice;
}

export interface Receipt {
  id: string;
  receipt_number: string; // e.g. REC/2026/00142
  payment_id: string;
  invoice_id: string;
  amount_paid_ngn: number;
  payment_date: string;
  payer_name: string;
  payer_identifier: string; // App number or Matric number
  description: string;
  academic_session: string;
  issued_by: string;
  verified: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string;
  category: 'Academic' | 'Admissions' | 'Research' | 'Campus Life' | 'Administration' | 'Events' | 'Sports';
  author_name: string;
  author_title: string;
  published_at: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
}

export interface UniversityEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  venue: string;
  event_date: string;
  event_time: string;
  end_time?: string;
  image_url?: string;
  category: 'Matriculation' | 'Convocation' | 'Inaugural Lecture' | 'Conference' | 'Workshop' | 'Sports' | 'Orientation';
  registration_url?: string;
  is_featured: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  target_audience: 'all' | 'applicants' | 'students' | 'staff' | 'faculty';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

export interface UniversityDocument {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  file_url: string;
  file_type: string;
  file_size_kb: number;
  is_public: boolean;
  download_count: number;
  target_role?: UserRole | 'all';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'admission' | 'payment';
  link_url?: string;
  read: boolean;
  created_at: string;
}

export interface DispatchedEmail {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body_html: string;
  body_text: string;
  category: 'matriculation_issuance' | 'admission_offer' | 'application_received' | 'status_update' | 'payment_receipt';
  reference_id?: string; // e.g. applicationId, studentId, invoiceId
  matric_number?: string;
  application_number?: string;
  status: 'sent' | 'delivered' | 'failed';
  sent_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  actor_name: string;
  actor_role: string;
  action: string; // e.g. "application.approved", "student.matriculated", "payment.verified"
  module: 'admissions' | 'students' | 'staff' | 'payments' | 'academics' | 'settings' | 'auth' | 'documents' | 'users';
  record_id?: string;
  details?: Record<string, unknown> | string;
  ip_address?: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  department_targeted?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export interface FAQItem {
  id: string;
  category: 'Admissions' | 'Portals & Accounts' | 'Tuition & Fees' | 'Academic Programmes' | 'General';
  question: string;
  answer: string;
  sort_order: number;
}

export interface DownloadResource {
  id: string;
  title: string;
  category: 'Academic Calendar' | 'Student Handbooks' | 'Application Guidelines' | 'Forms & Templates' | 'Fee Schedules';
  file_format: 'PDF' | 'DOCX' | 'ZIP';
  file_size: string;
  file_url: string;
  version: string;
  updated_at: string;
}

export interface Course {
  id: string;
  department_id: string;
  faculty_id?: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  semester: 'First' | 'Second';
  level: string;
  is_elective: boolean;
  department?: Department;
  faculty?: Faculty;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  academic_session_id: string;
  semester: 'First' | 'Second';
  ca_score?: number;
  exam_score?: number;
  total_score?: number;
  grade?: string;
  grade_point?: number;
  status: 'registered' | 'approved' | 'completed' | 'dropped';
  created_at: string;
  course?: Course;
  student?: Student;
}

export type OLevelSubjectGrade = OLevelSubject;

export interface SeedUserAccount {
  email: string;
  name: string;
  label?: string;
  role: UserRole;
  department: string;
  password?: string;
}

