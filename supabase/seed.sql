-- ==========================================================
-- UNIVERSITY DIGITAL TRANSFORMATION PLATFORM
-- Realistic Production Seed Data
-- ==========================================================

-- 1. SYSTEM SETTINGS
INSERT INTO public.system_settings (
    id,
    university_name,
    short_name,
    motto,
    logo_url,
    primary_color,
    secondary_color,
    address,
    phone,
    email,
    website,
    domain,
    vice_chancellor,
    registrar_name,
    bursar_name,
    current_academic_session,
    current_application_session,
    admission_status,
    application_fee_ngn,
    acceptance_fee_ngn,
    contact_information,
    social_media_links,
    microsoft_365
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Premier Federal University of Science & Technology',
    'PFUST',
    'Excellence, Innovation and Character',
    '/assets/university-logo.svg',
    '#0F2137',
    '#D4AF37',
    'University Boulevard, Academic City, PMB 1001, Nigeria',
    '+234 1 800 234 5678',
    'info@pfust.edu.ng',
    'https://pfust.edu.ng',
    'pfust.edu.ng',
    'Prof. Babatunde A. Adeleke, PhD, FAS',
    'Dr. (Mrs.) Grace N. Okonkwo',
    'Alhaji Ibrahim S. Danjuma, FCA',
    '2026/2027',
    '2026/2027',
    'open',
    15000.00,
    45000.00,
    '{"admissions_email": "admissions@pfust.edu.ng", "support_phone": "+234 803 123 4567", "pmo_address": "Senate Building, Wing B"}'::jsonb,
    '{"twitter": "https://x.com/pfust_edu", "facebook": "https://facebook.com/pfust.edu", "linkedin": "https://linkedin.com/school/pfust"}'::jsonb,
    '{"tenant_domain": "pfust.edu.ng", "portal_url": "https://portal.office.com", "enabled": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. ACADEMIC SESSIONS
INSERT INTO public.academic_sessions (id, name, start_date, end_date, is_current, is_application_open) VALUES
('11111111-0000-0000-0000-000000000001', '2025/2026', '2025-09-01', '2026-07-31', false, false),
('11111111-0000-0000-0000-000000000002', '2026/2027', '2026-09-01', '2027-07-31', true, true)
ON CONFLICT (id) DO NOTHING;

-- 3. LEVELS
INSERT INTO public.levels (id, code, name, description) VALUES
('22222222-0000-0000-0000-000000000001', '100L', '100 Level / Freshman', 'First year undergraduate cohort'),
('22222222-0000-0000-0000-000000000002', '200L', '200 Level / Sophomore', 'Second year undergraduate cohort'),
('22222222-0000-0000-0000-000000000003', '300L', '300 Level / Penultimate', 'Third year undergraduate cohort'),
('22222222-0000-0000-0000-000000000004', '400L', '400 Level / Final Year', 'Fourth year undergraduate cohort'),
('22222222-0000-0000-0000-000000000005', '500L', '500 Level / Professional Year', 'Fifth year engineering/medical cohort')
ON CONFLICT (id) DO NOTHING;

-- 4. 5 FACULTIES
INSERT INTO public.faculties (id, name, code, description, dean_name, dean_email, established_year, status) VALUES
('33333333-0000-0000-0000-000000000001', 'Faculty of Computing & Information Technology', 'FCIT', 'Leading computing, artificial intelligence, software engineering and cyber security training in West Africa.', 'Prof. Chukwuma E. Nnamdi', 'dean.fcit@pfust.edu.ng', 1998, 'active'),
('33333333-0000-0000-0000-000000000002', 'Faculty of Engineering & Technology', 'FENG', 'Producing pioneering engineers in renewable energy, robotics, electrical, and civil infrastructure.', 'Engr. Prof. Folashade A. Balogun, FNSE', 'dean.feng@pfust.edu.ng', 1985, 'active'),
('33333333-0000-0000-0000-000000000003', 'Faculty of Basic Medical & Health Sciences', 'FBMS', 'State-of-the-art research hospital and training for next-generation clinicians and medical scientists.', 'Prof. Olufemi K. Soyinka, FWACP', 'dean.fbms@pfust.edu.ng', 1992, 'active'),
('33333333-0000-0000-0000-000000000004', 'Faculty of Management & Social Sciences', 'FMSS', 'Developing ethical corporate leaders, financial economists, and strategic institutional managers.', 'Prof. (Mrs.) Amina Bello-Kano', 'dean.fmss@pfust.edu.ng', 1988, 'active'),
('33333333-0000-0000-0000-000000000005', 'Faculty of Environmental Sciences', 'FENV', 'Pioneering sustainable urban development, architecture, estate management, and geospatial analytics.', 'Prof. Tariere D. Briggs', 'dean.fenv@pfust.edu.ng', 2004, 'active')
ON CONFLICT (id) DO NOTHING;

-- 5. 10 DEPARTMENTS
INSERT INTO public.departments (id, faculty_id, name, code, hod_name, hod_email, status) VALUES
('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'Department of Computer Science', 'CSC', 'Dr. Ayodeji O. Martins', 'hod.csc@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'Department of Software Engineering & AI', 'SEN', 'Dr. (Mrs.) Chidinma Obi', 'hod.sen@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000002', 'Department of Electrical & Electronic Engineering', 'EEE', 'Engr. Dr. Mustapha Haruna', 'hod.eee@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000002', 'Department of Mechanical Engineering', 'MEE', 'Engr. Dr. Segun Adeyemi', 'hod.mee@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000003', 'Department of Nursing Science', 'NSC', 'Dr. (Mrs.) Victoria Eze', 'hod.nsc@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000003', 'Department of Medical Laboratory Science', 'MLS', 'Dr. Kenneth I. Nwosu', 'hod.mls@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000004', 'Department of Accounting & Finance', 'ACC', 'Dr. Olalekan Shonibare, FCA', 'hod.acc@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000004', 'Department of Economics & Development Studies', 'ECO', 'Dr. (Mrs.) Fatima Sanusi', 'hod.eco@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000005', 'Department of Architecture', 'ARC', 'Arc. Dr. Damilola Ojo, MNIA', 'hod.arc@pfust.edu.ng', 'active'),
('44444444-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000005', 'Department of Estate Management & Urban Planning', 'ESM', 'Dr. Joshua E. Okon', 'hod.esm@pfust.edu.ng', 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. 15 PROGRAMMES
INSERT INTO public.programmes (id, department_id, faculty_id, name, code, degree_type, duration_years, entry_requirements, description, tuition_per_session_ngn, status, application_availability) VALUES
('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'B.Sc. Computer Science', 'CSC-BSC', 'B.Sc.', 4, '["5 O Level credits including English, Mathematics, Physics, Chemistry in not more than 2 sittings", "UTME combination: English, Mathematics, Physics, Chemistry/Biology", "Institutional cut-off score: 200+"]'::jsonb, 'Rigorous training in algorithms, cloud systems, network engineering and modern software architecture.', 160000.00, 'active', true),
('55555555-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'B.Sc. Software Engineering', 'SEN-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Maths, Physics, Chemistry", "UTME combination: English, Maths, Physics, Chemistry", "Cut-off: 210+"]'::jsonb, 'Specialized curriculum focused on enterprise software engineering, devops, distributed architectures and AI integration.', 180000.00, 'active', true),
('55555555-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'B.Sc. Cyber Security', 'CYS-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Maths, Physics, Chemistry", "UTME Cut-off: 200+"]'::jsonb, 'Comprehensive defense systems, cryptography, digital forensics, ethical hacking and cloud security.', 175000.00, 'active', true),
('55555555-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000002', 'B.Eng. Electrical & Electronics Engineering', 'EEE-BENG', 'B.Eng.', 5, '["5 O Level credits in English, Maths, Physics, Chemistry, Technical Drawing", "UTME Cut-off: 220+"]'::jsonb, 'Accredited 5-year engineering programme in telecommunications, power generation, embedded electronics and robotics.', 220000.00, 'active', true),
('55555555-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000002', 'B.Eng. Mechanical Engineering', 'MEE-BENG', 'B.Eng.', 5, '["5 O Level credits in English, Maths, Physics, Chemistry", "UTME Cut-off: 215+"]'::jsonb, 'Thermodynamics, mechatronics, automotive systems, materials science and computer-aided manufacturing.', 210000.00, 'active', true),
('55555555-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000003', 'B.N.Sc. Nursing Science', 'NSC-BNSC', 'B.Sc.', 5, '["5 O Level credits in English, Mathematics, Biology, Chemistry, Physics in 1 sitting", "UTME Cut-off: 240+"]'::jsonb, 'NMCN accredited clinical nursing programme with dual hospital rotations and evidence-based healthcare delivery.', 250000.00, 'active', true),
('55555555-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000003', 'B.MLS Medical Laboratory Science', 'MLS-BMLS', 'B.Sc.', 5, '["5 O Level credits in English, Maths, Biology, Chemistry, Physics", "UTME Cut-off: 225+"]'::jsonb, 'Diagnostic microbiology, clinical chemistry, haematology, histopathology and molecular diagnostics.', 230000.00, 'active', true),
('55555555-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000004', 'B.Sc. Accounting', 'ACC-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Mathematics, Economics, Accounting/Commerce", "UTME Cut-off: 200+"]'::jsonb, 'ICAN and ACCA accredited financial accounting, taxation, auditing and corporate forensic financial management.', 150000.00, 'active', true),
('55555555-0000-0000-0000-000000000009', '44444444-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000004', 'B.Sc. Banking & Finance', 'BFN-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Maths, Economics", "UTME Cut-off: 195+"]'::jsonb, 'Investment banking, fintech innovation, microfinance and algorithmic trading systems.', 145000.00, 'active', true),
('55555555-0000-0000-0000-000000000010', '44444444-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000004', 'B.Sc. Economics', 'ECO-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Maths, Economics", "UTME Cut-off: 200+"]'::jsonb, 'Macroeconomic policy, econometrics, public finance, development economics and statistical modeling.', 140000.00, 'active', true),
('55555555-0000-0000-0000-000000000011', '44444444-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000005', 'B.Sc. Architecture', 'ARC-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Mathematics, Physics, Chemistry, Technical Drawing", "UTME Cut-off: 210+"]'::jsonb, 'Architectural studio design, BIM technology, green building principles and structural dynamics.', 195000.00, 'active', true),
('55555555-0000-0000-0000-000000000012', '44444444-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000005', 'B.Sc. Estate Management', 'ESM-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Mathematics, Economics", "UTME Cut-off: 190+"]'::jsonb, 'Real estate appraisal, property development financing, facility management and environmental law.', 145000.00, 'active', true),
('55555555-0000-0000-0000-000000000013', '44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'B.Sc. Data Science & Analytics', 'DSC-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Maths, Physics, Chemistry", "UTME Cut-off: 205+"]'::jsonb, 'Big data infrastructure, statistical learning, data visualization and deep learning algorithms.', 170000.00, 'active', true),
('55555555-0000-0000-0000-000000000014', '44444444-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000002', 'B.Eng. Mechatronics Engineering', 'MCE-BENG', 'B.Eng.', 5, '["5 O Level credits in English, Maths, Physics, Chemistry", "UTME Cut-off: 220+"]'::jsonb, 'Synergy of precision mechanical engineering, electronic control and intelligent software systems.', 225000.00, 'active', true),
('55555555-0000-0000-0000-000000000015', '44444444-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000004', 'B.Sc. Business Administration', 'BUS-BSC', 'B.Sc.', 4, '["5 O Level credits in English, Maths, Economics", "UTME Cut-off: 195+"]'::jsonb, 'Strategic management, organizational psychology, supply chain systems and entrepreneurial innovation.', 140000.00, 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 7. NEWS ARTICLES
INSERT INTO public.news (id, title, slug, summary, content, featured_image, category, author_name, author_title, published_at, is_published, views_count) VALUES
('66666666-0000-0000-0000-000000000001', 'PFUST Secures Full NUC Accreditation for 15 Undergraduate Programmes', 'pfust-secures-full-nuc-accreditation-2026', 'The National Universities Commission (NUC) has awarded five-year full accreditation to all fifteen undergraduate programmes evaluated during the recent exercise.', 'The Vice-Chancellor, Prof. Babatunde A. Adeleke, FAS, announced with immense satisfaction that the National Universities Commission (NUC) has granted 100% full accreditation to all academic programmes presented during the institutional review. The accreditation covers programmes in Computing, Engineering, Nursing Science, Management, and Environmental Sciences. Prof. Adeleke attributed this milestone to the relentless dedication of faculty, heavy institutional investment in laboratories, and modernized digital learning environments.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80', 'Academic', 'University Information Directorate', 'Chief Public Relations Officer', '2026-08-15 09:00:00+00', true, 1420),
('66666666-0000-0000-0000-000000000002', '2026/2027 Undergraduate Admission Screening Exercise Officially Commences', 'undergraduate-admissions-screening-2026-2027', 'Applications are now open for candidates who scored 180 and above in the 2026 Unified Tertiary Matriculation Examination (UTME) and Direct Entry applicants.', 'The Admissions Office wishes to inform the general public and prospective applicants that the online portal for the 2026/2027 Academic Session admission screening has been activated. Candidates who made the Premier Federal University of Science & Technology their first choice or are seeking change of institution are advised to register on the digital portal before the deadline. Applicants must ensure their O-Level results are accurately uploaded on the JAMB CAPS portal.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', 'Admissions', 'Admissions Office', 'Head of Admissions', '2026-08-20 10:30:00+00', true, 3890),
('66666666-0000-0000-0000-000000000003', 'Faculty of Engineering Unveils Autonomous Solar-Powered Agricultural Robot', 'engineering-faculty-unveils-solar-agricultural-robot', 'A team of final-year engineering students and faculty researchers have prototyped a multi-purpose solar-powered drone rover for precision farming.', 'In line with the Universitys mandate of advancing technological innovation for food security, the Department of Mechatronics and Electrical Engineering unveiled an autonomous farm management system. The robot is equipped with spectral soil sensors, precision pesticide micro-dispensers, and real-time weed identification models powered by edge computing.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', 'Research', 'Directorate of Research & Innovation', 'Lead Research Fellow', '2026-08-24 14:00:00+00', true, 950)
ON CONFLICT (id) DO NOTHING;

-- 8. EVENTS
INSERT INTO public.events (id, title, slug, description, venue, event_date, event_time, image_url, category, is_featured, status) VALUES
('77777777-0000-0000-0000-000000000001', '38th Annual Convocation Ceremonies & Award of Degrees', '38th-annual-convocation-ceremonies', 'Conferment of First Degrees, Postgraduate Diplomas, Higher Degrees, and Honorary Doctorates to distinguished scholars and graduating students.', 'University Main Auditorium & Convocation Arena', '2026-10-18', '10:00 AM', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80', 'Convocation', true, 'upcoming'),
('77777777-0000-0000-0000-000000000002', '2026/2027 Freshmen Matriculation & Oath Taking', '2026-freshmen-matriculation-ceremony', 'Official induction ceremony and oath of allegiance for all newly admitted undergraduate and postgraduate students.', 'Multipurpose Indoor Hall, Campus Central', '2026-11-12', '09:00 AM', 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=1200&q=80', 'Matriculation', true, 'upcoming'),
('77777777-0000-0000-0000-000000000003', 'Inaugural Lecture Series: Digital Sovereignty & African AI Infrastructure', 'inaugural-lecture-prof-nnamdi', 'Delivered by Prof. Chukwuma E. Nnamdi, Dean of Computing & Information Technology.', 'Senate Chamber, 3rd Floor', '2026-09-25', '03:00 PM', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', 'Inaugural Lecture', false, 'upcoming')
ON CONFLICT (id) DO NOTHING;

-- 9. ANNOUNCEMENTS
INSERT INTO public.announcements (id, title, message, target_audience, priority, starts_at, is_active, created_by) VALUES
('88888888-0000-0000-0000-000000000001', '2026/2027 Undergraduate Admission Application is Now Open', 'Eligible candidates who sat for the 2026 UTME and scored 180+ are invited to complete their screening applications on the applicant portal.', 'all', 'high', NOW(), true, 'Admissions Directorate'),
('88888888-0000-0000-0000-000000000002', 'Bursary Notice: Fee Schedule & Official Payment Channels', 'All returning students and freshmen must note that school fees and acceptance dues are payable strictly via generated portal invoices. Never pay into individual accounts.', 'students', 'urgent', NOW(), true, 'Bursary Department'),
('88888888-0000-0000-0000-000000000003', 'Staff Microsoft 365 Institutional Identity Migration', 'The ICT Directorate has provisioned official @pfust.edu.ng email and M365 accounts for all academic and administrative personnel.', 'staff', 'medium', NOW(), true, 'ICT Directorate')
ON CONFLICT (id) DO NOTHING;

-- 10. DOWNLOAD RESOURCES
INSERT INTO public.downloads (id, title, category, file_format, file_size, file_url, version, updated_at) VALUES
('99999999-0000-0000-0000-000000000001', 'Official 2026/2027 University Academic Calendar', 'Academic Calendar', 'PDF', '1.4 MB', '/downloads/academic-calendar-2026.pdf', '2.1', NOW()),
('99999999-0000-0000-0000-000000000002', 'Undergraduate Student Code of Conduct & Handbook', 'Student Handbooks', 'PDF', '3.8 MB', '/downloads/student-handbook-2026.pdf', '1.0', NOW()),
('99999999-0000-0000-0000-000000000003', '2026/2027 Admission Screening Guidelines & Cut-off Marks', 'Application Guidelines', 'PDF', '850 KB', '/downloads/admissions-guidelines-2026.pdf', '1.2', NOW()),
('99999999-0000-0000-0000-000000000004', 'Undergraduate Fee Schedule & Sundry Charges', 'Fee Schedules', 'PDF', '620 KB', '/downloads/approved-fee-schedule-2026.pdf', '1.0', NOW()),
('99999999-0000-0000-0000-000000000005', 'Inter-University Transfer & Direct Entry Verification Form', 'Forms & Templates', 'DOCX', '420 KB', '/downloads/transfer-verification-form.docx', '1.0', NOW())
ON CONFLICT (id) DO NOTHING;

-- 11. FAQS
INSERT INTO public.faqs (id, category, question, answer, sort_order) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', 'Admissions', 'What is the institutional cut-off mark for 2026/2027 admissions?', 'The general minimum cut-off mark is 180 for most programmes, while competitive programmes such as Software Engineering, Nursing Science, and Electrical Engineering require 210 to 240+.', 1),
('aaaaaaaa-0000-0000-0000-000000000002', 'Admissions', 'Can I combine two sittings of WAEC and NECO?', 'Yes, the University accepts a combination of two O-Level sittings (WAEC, NECO, or NABTEB) for all programmes except Nursing Science, which strictly mandates a single sitting.', 2),
('aaaaaaaa-0000-0000-0000-000000000003', 'Tuition & Fees', 'How do I pay my screening or acceptance fees?', 'Payments are processed securely on this portal. After filling the applicant form, an official invoice with a unique RRR/transaction reference is generated. You can pay via debit card, USSD, or at any commercial bank branch.', 3),
('aaaaaaaa-0000-0000-0000-000000000004', 'Portals & Accounts', 'How do I retrieve my applicant or student login credentials?', 'Click the "Forgot Password" link on the login page and enter your registered email address. A password reset token will be dispatched to your inbox immediately.', 4)
ON CONFLICT (id) DO NOTHING;
