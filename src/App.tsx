import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth/AuthContext';
import { UniversityDataProvider } from './lib/supabase/UniversityDataContext';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { AuthModal } from './components/auth/AuthModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

// Public Views
import { HomeView } from './views/public/HomeView';
import { AboutView, ManagementView } from './views/public/AboutView';
import { FacultiesView, ProgrammesView } from './views/public/FacultiesView';
import { AdmissionsView, AdmissionStatusView } from './views/public/AdmissionsView';
import { ApplicationFormView } from './views/public/ApplicationFormView';
import { NewsView, DownloadsView, ContactView } from './views/public/NewsView';

// Admin View
import { AdminLayout } from './views/admin/AdminLayout';
import { OverviewTab } from './views/admin/OverviewTab';
import { ApplicationsTab } from './views/admin/ApplicationsTab';
import { StudentsTab, StaffTab } from './views/admin/StudentsTab';
import { AcademicsTab, FinanceTab } from './views/admin/AcademicsTab';
import { CmsTab, AuditLogsTab } from './views/admin/CmsTab';
import { SettingsTab } from './views/admin/SettingsTab';
import { RolesTab } from './views/admin/RolesTab';

// Dedicated Portals
import { ApplicantPortalView } from './views/portal/ApplicantPortalView';
import { StudentPortalView } from './views/portal/StudentPortalView';
import { StaffPortalView } from './views/portal/StaffPortalView';

function MainAppContent() {
  const { user, profile, role, isAuthenticated, hasRole } = useAuth();

  const [currentView, setCurrentView] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<string>('overview');
  const [viewParams, setViewParams] = useState<any>({});

  // Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const handleNavigate = (view: string, params?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setViewParams(params || {});

    // Route protection and canonical route normalization
    let targetView = view;
    if (view === 'apply') targetView = 'application-form';
    if (view === 'admission-status') targetView = 'check-status';
    if (view === 'events') targetView = 'news';

    // Route Protection Checks
    if (targetView === 'admin') {
      if (!isAuthenticated || !hasRole(['super_admin', 'vc', 'admissions_officer', 'bursar', 'registrar'])) {
        setIsAuthModalOpen(true);
        return;
      }
    }

    if (targetView === 'applicant-portal') {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
      }
    }

    if (targetView === 'student-portal') {
      if (!isAuthenticated || !hasRole(['student', 'super_admin'])) {
        setIsAuthModalOpen(true);
        return;
      }
    }

    if (targetView === 'staff-portal') {
      if (!isAuthenticated || !hasRole(['staff', 'vc', 'super_admin'])) {
        setIsAuthModalOpen(true);
        return;
      }
    }

    setCurrentView(targetView);
  };

  const isPublicPage = ![
    'admin',
    'applicant-portal',
    'student-portal',
    'staff-portal',
  ].includes(currentView);

  // Render Admin Tabs
  const renderAdminContent = () => {
    switch (adminTab) {
      case 'overview':
        return <OverviewTab onTabChange={setAdminTab} />;
      case 'applications':
        return <ApplicationsTab />;
      case 'students':
        return <StudentsTab />;
      case 'staff':
        return <StaffTab />;
      case 'academics':
        return <AcademicsTab />;
      case 'finance':
        return <FinanceTab />;
      case 'cms':
        return <CmsTab />;
      case 'roles':
        return <RolesTab />;
      case 'audit-logs':
        return <AuditLogsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab onTabChange={setAdminTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-200 selection:text-slate-900">
      {/* Public Navigation */}
      {isPublicPage && (
        <PublicNavbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />
      )}

      {/* View Routing Engine */}
      <div className="flex-1">
        {/* Public Views */}
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
        {currentView === 'about' && <AboutView onNavigate={handleNavigate} />}
        {currentView === 'management' && <ManagementView onNavigate={handleNavigate} />}
        {currentView === 'faculties' && (
          <FacultiesView
            onNavigate={handleNavigate}
            selectedFacultyId={viewParams.facultyId}
          />
        )}
        {currentView === 'programmes' && (
          <ProgrammesView
            onNavigate={handleNavigate}
            initialFacultyId={viewParams.facultyId}
          />
        )}
        {currentView === 'admissions' && <AdmissionsView onNavigate={handleNavigate} />}
        {(currentView === 'check-status' || currentView === 'admission-status') && (
          <AdmissionStatusView onNavigate={handleNavigate} />
        )}
        {(currentView === 'application-form' || currentView === 'apply') && (
          <ApplicationFormView
            onNavigate={handleNavigate}
            preSelectedProgrammeId={viewParams.programmeId}
          />
        )}
        {(currentView === 'news' || currentView === 'events') && (
          <NewsView
            onNavigate={handleNavigate}
            selectedArticleId={viewParams.articleId}
          />
        )}
        {currentView === 'downloads' && <DownloadsView />}
        {currentView === 'contact' && <ContactView />}

        {/* Administration Console */}
        {currentView === 'admin' && (
          <AdminLayout
            currentTab={adminTab}
            onTabChange={setAdminTab}
            onNavigatePublic={handleNavigate}
          >
            {renderAdminContent()}
          </AdminLayout>
        )}

        {/* Dedicated User Portals */}
        {currentView === 'applicant-portal' && (
          <div>
            <div className="bg-[#0F2137] px-4 py-3 text-xs text-white border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold">Candidate Portal • Premised on JAMB CAPS Protocol</span>
              <button
                onClick={() => handleNavigate('home')}
                className="text-amber-300 hover:underline font-semibold cursor-pointer"
              >
                ← Return to University Main Site
              </button>
            </div>
            <ApplicantPortalView onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'student-portal' && (
          <div>
            <div className="bg-[#0F2137] px-4 py-3 text-xs text-white border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold">Undergraduate Scholar Workspace • Integrated SIS & Bursary</span>
              <button
                onClick={() => handleNavigate('home')}
                className="text-amber-300 hover:underline font-semibold cursor-pointer"
              >
                ← Return to University Main Site
              </button>
            </div>
            <StudentPortalView onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'staff-portal' && (
          <div>
            <div className="bg-[#0F2137] px-4 py-3 text-xs text-white border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold">Academic Staff & Faculty Workspace • Examination Board</span>
              <button
                onClick={() => handleNavigate('home')}
                className="text-amber-300 hover:underline font-semibold cursor-pointer"
              >
                ← Return to University Main Site
              </button>
            </div>
            <StaffPortalView onNavigate={handleNavigate} />
          </div>
        )}
      </div>

      {/* Public Footer */}
      {isPublicPage && (
        <PublicFooter
          onNavigate={handleNavigate}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(userRole) => {
          setIsAuthModalOpen(false);
          if (
            ['super_admin', 'vc', 'admissions_officer', 'bursar', 'registrar'].includes(
              userRole
            )
          ) {
            setCurrentView('admin');
          } else if (userRole === 'student') {
            setCurrentView('student-portal');
          } else if (userRole === 'staff') {
            setCurrentView('staff-portal');
          } else {
            setCurrentView('applicant-portal');
          }
        }}
      />

      {/* Global Instant Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={(view, params) => {
          setIsSearchModalOpen(false);
          handleNavigate(view, params);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UniversityDataProvider>
        <MainAppContent />
      </UniversityDataProvider>
    </AuthProvider>
  );
}
