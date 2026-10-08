-- ==========================================================
-- UNIVERSITY DIGITAL TRANSFORMATION PLATFORM
-- Supabase PostgreSQL Schema & Security Policies (RLS)
-- Version: 1.0.0 (Production Migration)
-- ==========================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_name TEXT NOT NULL DEFAULT 'Premier Federal University of Science & Technology',
    short_name TEXT NOT NULL DEFAULT 'PFUST',
    motto TEXT NOT NULL DEFAULT 'Excellence, Innovation and Character',
    logo_url TEXT DEFAULT '/assets/university-logo.svg',
    favicon_url TEXT DEFAULT '/favicon.ico',
    primary_color TEXT NOT NULL DEFAULT '#0F2137',
    secondary_color TEXT NOT NULL DEFAULT '#D4AF37',
    address TEXT NOT NULL DEFAULT 'University Boulevard, Academic City, PMB 1001, Nigeria',
    phone TEXT NOT NULL DEFAULT '+234 1 800 234 5678',
    email TEXT NOT NULL DEFAULT 'info@pfust.edu.ng',
    website TEXT NOT NULL DEFAULT 'https://pfust.edu.ng',
    domain TEXT NOT NULL DEFAULT 'pfust.edu.ng',
    vice_chancellor TEXT NOT NULL DEFAULT 'Prof. Babatunde A. Adeleke, PhD, FAS',
    registrar_name TEXT NOT NULL DEFAULT 'Dr. (Mrs.) Grace N. Okonkwo',
    bursar_name TEXT NOT NULL DEFAULT 'Alhaji Ibrahim S. Danjuma, FCA',
    current_academic_session TEXT NOT NULL DEFAULT '2026/2027',
    current_application_session TEXT NOT NULL DEFAULT '2026/2027',
    admission_status TEXT NOT NULL DEFAULT 'open' CHECK (admission_status IN ('open', 'closed', 'extended')),
    application_fee_ngn NUMERIC NOT NULL DEFAULT 15000.00,
    acceptance_fee_ngn NUMERIC NOT NULL DEFAULT 45000.00,
    contact_information JSONB DEFAULT '{"admissions_email": "admissions@pfust.edu.ng", "support_phone": "+234 803 123 4567", "pmo_address": "Senate Building, Wing B"}'::jsonb,
    social_media_links JSONB DEFAULT '{"twitter": "https://x.com/pfust_edu", "facebook": "https://facebook.com/pfust.edu", "linkedin": "https://linkedin.com/school/pfust"}'::jsonb,
    microsoft_365 JSONB DEFAULT '{"tenant_domain": "pfust.edu.ng", "portal_url": "https://portal.office.com", "enabled": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 3. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    address TEXT,
    state_of_origin TEXT,
    lga TEXT,
    nationality TEXT DEFAULT 'Nigerian',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    role TEXT NOT NULL DEFAULT 'applicant',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- 4. ACADEMIC STRUCTURE: FACULTIES, DEPARTMENTS, PROGRAMMES
CREATE TABLE IF NOT EXISTS public.faculties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    dean_name TEXT,
    dean_email TEXT,
    established_year INT DEFAULT 1985,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    hod_name TEXT,
    hod_email TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    degree_type TEXT NOT NULL,
    duration_years INT NOT NULL DEFAULT 4,
    entry_requirements JSONB NOT NULL DEFAULT '["5 O Level Credits including English and Mathematics in not more than 2 sittings", "UTME score meeting the institutional cut-off mark"]'::jsonb,
    description TEXT,
    tuition_per_session_ngn NUMERIC NOT NULL DEFAULT 120000.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    application_availability BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    is_application_open BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

-- 5. ADMISSIONS & APPLICANTS
CREATE TABLE IF NOT EXISTS public.applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    jamb_reg_number TEXT,
    jamb_score INT,
    first_choice_programme_id UUID REFERENCES public.programmes(id),
    second_choice_programme_id UUID REFERENCES public.programmes(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    application_number TEXT UNIQUE NOT NULL,
    academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id),
    programme_id UUID NOT NULL REFERENCES public.programmes(id),
    application_type TEXT NOT NULL DEFAULT 'UTME' CHECK (application_type IN ('UTME', 'Direct Entry', 'Postgraduate', 'Part-Time', 'Transfer')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'paid', 'submitted', 'under_review', 'correction_required', 'approved', 'rejected', 'admitted')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed', 'cancelled', 'refunded')),
    olevel_results JSONB DEFAULT '[]'::jsonb,
    jamb_score INT,
    jamb_reg_number TEXT,
    previous_institution TEXT,
    previous_qualification TEXT,
    cgpa NUMERIC(4,2),
    personal_statement TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewer_notes TEXT,
    rejection_reason TEXT,
    admitted_programme_id UUID REFERENCES public.programmes(id),
    admitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'birth_certificate', 'o_level', 'jamb_result', 'lga_identification', 'testimonial', 'other')),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_kb INT NOT NULL,
    file_type TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDENTS & STAFF
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.applicants(id),
    student_number TEXT UNIQUE NOT NULL, -- Matriculation Number
    programme_id UUID NOT NULL REFERENCES public.programmes(id),
    department_id UUID NOT NULL REFERENCES public.departments(id),
    faculty_id UUID NOT NULL REFERENCES public.faculties(id),
    academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id),
    level_id UUID NOT NULL REFERENCES public.levels(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'suspended', 'withdrawn', 'deferred')),
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_cgpa NUMERIC(4,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    staff_id TEXT UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id),
    faculty_id UUID REFERENCES public.faculties(id),
    designation TEXT NOT NULL,
    staff_category TEXT NOT NULL CHECK (staff_category IN ('academic', 'non_academic', 'administrative', 'executive')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'retired', 'resigned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FINANCIAL SYSTEM: INVOICES, PAYMENTS, RECEIPTS
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id),
    student_id UUID REFERENCES public.students(id),
    title TEXT NOT NULL,
    description TEXT,
    amount_ngn NUMERIC NOT NULL,
    fee_category TEXT NOT NULL CHECK (fee_category IN ('application_fee', 'acceptance_fee', 'tuition_fee', 'faculty_dues', 'department_dues', 'late_registration', 'transcript_fee')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled', 'refunded')),
    academic_session_id UUID REFERENCES public.academic_sessions(id),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    payment_reference TEXT UNIQUE NOT NULL,
    transaction_id TEXT,
    amount_ngn NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    provider TEXT NOT NULL CHECK (provider IN ('paystack', 'flutterwave', 'remita', 'bank_transfer', 'mock_sandbox')),
    channel TEXT NOT NULL DEFAULT 'card' CHECK (channel IN ('card', 'bank_transfer', 'ussd', 'bank_branch')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled', 'refunded')),
    paid_at TIMESTAMPTZ,
    payer_email TEXT NOT NULL,
    payer_name TEXT NOT NULL,
    metadata JSONB,
    receipt_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number TEXT UNIQUE NOT NULL,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount_paid_ngn NUMERIC NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payer_name TEXT NOT NULL,
    payer_identifier TEXT NOT NULL,
    description TEXT NOT NULL,
    academic_session TEXT NOT NULL,
    issued_by TEXT NOT NULL DEFAULT 'Bursary Department',
    verified BOOLEAN NOT NULL DEFAULT TRUE
);

-- 8. CMS & PUBLIC CONTENT: NEWS, EVENTS, ANNOUNCEMENTS, DOCUMENTS, FAQS, DOWNLOADS
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Academic', 'Admissions', 'Research', 'Campus Life', 'Administration', 'Events', 'Sports')),
    author_name TEXT NOT NULL DEFAULT 'University Press Office',
    author_title TEXT NOT NULL DEFAULT 'Information Officer',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    venue TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    end_time TEXT,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('Matriculation', 'Convocation', 'Inaugural Lecture', 'Conference', 'Workshop', 'Sports', 'Orientation')),
    registration_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'applicants', 'students', 'staff', 'faculty')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Admissions', 'Academic', 'Registry', 'Finance', 'Policies', 'Forms', 'Circulars', 'Reports', 'Publications')),
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'application/pdf',
    file_size_kb INT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    download_count INT NOT NULL DEFAULT 0,
    target_role TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'admission', 'payment')),
    link_url TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL CHECK (module IN ('admissions', 'students', 'staff', 'payments', 'academics', 'settings', 'auth', 'documents')),
    record_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    department_targeted TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('Admissions', 'Portals & Accounts', 'Tuition & Fees', 'Academic Programmes', 'General')),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Academic Calendar', 'Student Handbooks', 'Application Guidelines', 'Forms & Templates', 'Fee Schedules')),
    file_format TEXT NOT NULL CHECK (file_format IN ('PDF', 'DOCX', 'ZIP')),
    file_size TEXT NOT NULL,
    file_url TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR FREQUENTLY QUERIED COLUMNS
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_app_number ON public.applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_students_matric_number ON public.students(student_number);
CREATE INDEX IF NOT EXISTS idx_students_programme_id ON public.students(programme_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- 1. Helper function: Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = uid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. SYSTEM SETTINGS POLICIES: Public read, Super Admin write
CREATE POLICY "System settings are viewable by everyone" 
ON public.system_settings FOR SELECT USING (true);

CREATE POLICY "System settings are modifiable by super admin only" 
ON public.system_settings FOR ALL 
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'ict_admin'));

-- 3. PROFILES POLICIES: Users see own profile; Admins see all
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) IN ('super_admin', 'registrar', 'admissions_officer', 'bursar', 'ict_admin'));

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- 4. PUBLIC DATA: Faculties, Departments, Programmes, News, Events, FAQs, Downloads
CREATE POLICY "Public items are viewable by all" ON public.faculties FOR SELECT USING (true);
CREATE POLICY "Public items are viewable by all" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public items are viewable by all" ON public.programmes FOR SELECT USING (true);
CREATE POLICY "Public items are viewable by all" ON public.academic_sessions FOR SELECT USING (true);
CREATE POLICY "Public items are viewable by all" ON public.levels FOR SELECT USING (true);
CREATE POLICY "Published news is viewable by all" ON public.news FOR SELECT USING (is_published = true OR public.get_user_role(auth.uid()) IN ('super_admin', 'ict_admin', 'registry_officer'));
CREATE POLICY "Events viewable by all" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public documents viewable by all" ON public.documents FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);
CREATE POLICY "FAQs viewable by all" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Downloads viewable by all" ON public.downloads FOR SELECT USING (true);
CREATE POLICY "Active announcements viewable by audience" ON public.announcements FOR SELECT USING (is_active = true);

-- 5. APPLICANT & APPLICATION POLICIES
CREATE POLICY "Applicants can view own applicant record" 
ON public.applicants FOR SELECT 
USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) IN ('super_admin', 'admissions_officer', 'registrar'));

CREATE POLICY "Applicants can view own applications" 
ON public.applications FOR SELECT 
USING (applicant_id IN (SELECT id FROM public.applicants WHERE user_id = auth.uid()) OR public.get_user_role(auth.uid()) IN ('super_admin', 'admissions_officer', 'registrar', 'bursar'));

CREATE POLICY "Applicants can update draft applications" 
ON public.applications FOR UPDATE 
USING (applicant_id IN (SELECT id FROM public.applicants WHERE user_id = auth.uid()) AND status IN ('draft', 'correction_required'))
WITH CHECK (applicant_id IN (SELECT id FROM public.applicants WHERE user_id = auth.uid()));

CREATE POLICY "Admissions staff can manage applications" 
ON public.applications FOR ALL 
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admissions_officer', 'registrar'));

-- 6. APPLICATION DOCUMENTS POLICIES
CREATE POLICY "Applicants view own application documents" 
ON public.application_documents FOR SELECT 
USING (application_id IN (SELECT id FROM public.applications WHERE applicant_id IN (SELECT id FROM public.applicants WHERE user_id = auth.uid())) OR public.get_user_role(auth.uid()) IN ('super_admin', 'admissions_officer'));

CREATE POLICY "Applicants can insert own documents" 
ON public.application_documents FOR INSERT 
WITH CHECK (application_id IN (SELECT id FROM public.applications WHERE applicant_id IN (SELECT id FROM public.applicants WHERE user_id = auth.uid())));

-- 7. STUDENTS POLICIES
CREATE POLICY "Students can view own record" 
ON public.students FOR SELECT 
USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) IN ('super_admin', 'registrar', 'bursar', 'staff', 'faculty_admin', 'department_admin'));

CREATE POLICY "Registrar/Admins can manage students" 
ON public.students FOR ALL 
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'registrar', 'registry_officer'));

-- 8. STAFF POLICIES
CREATE POLICY "Staff can view own record" 
ON public.staff FOR SELECT 
USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) IN ('super_admin', 'management', 'registrar', 'ict_admin'));

CREATE POLICY "Management can manage staff" 
ON public.staff FOR ALL 
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'management', 'registrar'));

-- 9. INVOICES & PAYMENTS POLICIES
CREATE POLICY "Users can view own invoices" 
ON public.invoices FOR SELECT 
USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) IN ('super_admin', 'bursar', 'admissions_officer'));

CREATE POLICY "Bursary can manage invoices" 
ON public.invoices FOR ALL 
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'bursar'));

CREATE POLICY "Users can view own payments" 
ON public.payments FOR SELECT 
USING (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()) OR public.get_user_role(auth.uid()) IN ('super_admin', 'bursar'));

CREATE POLICY "Users can view own receipts" 
ON public.receipts FOR SELECT 
USING (payment_id IN (SELECT id FROM public.payments WHERE invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid())) OR public.get_user_role(auth.uid()) IN ('super_admin', 'bursar'));

-- 10. NOTIFICATIONS POLICIES
CREATE POLICY "Users see own notifications" 
ON public.notifications FOR ALL 
USING (auth.uid() = user_id);

-- 11. AUDIT LOGS POLICIES: Viewable by Super Admin and Management only
CREATE POLICY "Audit logs viewable by authorized admins" 
ON public.audit_logs FOR SELECT 
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'management', 'ict_admin'));

CREATE POLICY "System can record audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);

-- 12. CONTACT MESSAGES
CREATE POLICY "Anyone can submit contact message" 
ON public.contact_messages FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view and manage contact messages" 
ON public.contact_messages FOR ALL 
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'ict_admin', 'registry_officer', 'admissions_officer'));
