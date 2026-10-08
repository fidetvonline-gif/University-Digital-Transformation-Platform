import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../../types/database';
import { demoUserAccounts, SeedUserAccount } from '../supabase/db';

export interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemoUser: (demoUser: SeedUserAccount) => void;
  registerApplicant: (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
  }) => Promise<{ success: boolean; user?: { id: string; email: string }; profile?: Profile; message?: string }>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pfust_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from storage or default to guest
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.profile) {
          // If the profile was super admin, ensure it has Fidelis Sibe's latest details
          if (parsed.profile.role === 'super_admin' || parsed.profile.email === 'fidelissibe@gmail.com') {
            const superAdmin = demoUserAccounts.find((d) => d.role === 'super_admin');
            if (superAdmin) {
              parsed.profile = { ...parsed.profile, ...superAdmin.profile };
              parsed.user = { id: superAdmin.user_id, email: superAdmin.email };
            }
          }
          setUser(parsed.user);
          setProfile(parsed.profile);
          setRole(parsed.profile.role || 'applicant');
          setIsLoading(false);
          return;
        }
      }
      // Default to guest/unauthenticated on first load so public website is natural
      setUser(null);
      setProfile(null);
      setRole(null);
    } catch {
      setUser(null);
      setProfile(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (newUser: { id: string; email: string } | null, newProfile: Profile | null) => {
    setUser(newUser);
    setProfile(newProfile);
    setRole(newProfile?.role || null);
    if (newUser && newProfile) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: newUser, profile: newProfile }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const login = async (email: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      setIsLoading(false);
      return { success: false, message: 'Please provide a valid email address.' };
    }

    // Check against dynamically saved profiles first
    try {
      const savedProfilesRaw = localStorage.getItem('pfust_university_database_v1_profiles');
      if (savedProfilesRaw) {
        const savedProfiles: Profile[] = JSON.parse(savedProfilesRaw);
        const matchedProfile = savedProfiles.find(
          (p) => p && p.email && p.email.toLowerCase() === cleanEmail
        );
        if (matchedProfile) {
          if (matchedProfile.status === 'suspended') {
            setIsLoading(false);
            return { success: false, message: 'This user account has been suspended by the Super Administrator.' };
          }
          saveSession({ id: matchedProfile.user_id, email: matchedProfile.email }, matchedProfile);
          setIsLoading(false);
          return { success: true };
        }
      }
    } catch {
      // ignore parse error
    }

    // Check against demo accounts
    const matchedDemo = demoUserAccounts.find(
      (acc) => acc && acc.email && acc.email.toLowerCase() === cleanEmail
    );

    if (matchedDemo) {
      saveSession({ id: matchedDemo.user_id, email: matchedDemo.email }, matchedDemo.profile);
      setIsLoading(false);
      return { success: true };
    }

    // Otherwise create or sign in custom user
    const customUser = { id: `usr-${Date.now()}`, email: email.trim() };
    const customProfile: Profile = {
      id: `prof-${Date.now()}`,
      user_id: customUser.id,
      email: customUser.email,
      first_name: email.split('@')[0].toUpperCase(),
      last_name: 'USER',
      phone: '+234 800 000 0000',
      gender: 'other',
      nationality: 'Nigerian',
      status: 'active',
      role: email.includes('admin') ? 'super_admin' : email.includes('student') ? 'student' : email.includes('staff') ? 'staff' : 'applicant',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveSession(customUser, customProfile);
    setIsLoading(false);
    return { success: true };
  };

  const loginAsDemoUser = (demoUser: SeedUserAccount) => {
    saveSession({ id: demoUser.user_id, email: demoUser.email }, demoUser.profile);
  };

  const registerApplicant = async (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
  }): Promise<{ success: boolean; user?: { id: string; email: string }; profile?: Profile; message?: string }> => {
    setIsLoading(true);
    const userId = `usr-app-${Date.now()}`;
    const newProfile: Profile = {
      id: `prof-app-${Date.now()}`,
      user_id: userId,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      gender: data.gender,
      nationality: 'Nigerian',
      status: 'active',
      role: 'applicant',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveSession({ id: userId, email: data.email }, newProfile);
    setIsLoading(false);
    return { success: true, user: { id: userId, email: data.email }, profile: newProfile };
  };

  const logout = () => {
    saveSession(null, null);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!role) return false;
    if (role === 'super_admin') return true;
    return allowedRoles.includes(role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!role) return false;
    if (role === 'super_admin') return true;

    // RBAC Capability Map
    const rolePermissions: Record<UserRole, string[]> = {
      super_admin: ['*'],
      management: ['view_reports', 'view_audit_logs', 'view_students', 'view_applications', 'view_payments'],
      registrar: ['view_students', 'create_students', 'edit_students', 'view_applications', 'approve_applications', 'manage_documents'],
      bursar: ['view_payments', 'verify_payments', 'view_reports', 'manage_fees'],
      admissions_officer: ['view_applications', 'review_applications', 'approve_applications', 'reject_applications', 'create_students'],
      ict_admin: ['manage_users', 'manage_roles', 'manage_settings', 'view_audit_logs'],
      registry_officer: ['view_students', 'edit_students', 'manage_documents'],
      faculty_admin: ['view_students', 'view_programmes', 'view_applications'],
      department_admin: ['view_students', 'view_programmes'],
      staff: ['view_own_profile', 'view_department', 'access_m365'],
      student: ['view_own_student', 'pay_fees', 'view_documents', 'access_m365'],
      applicant: ['create_application', 'pay_application_fee', 'view_own_application', 'upload_documents'],
    };

    const permissions = rolePermissions[role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAuthenticated: Boolean(user && profile),
        isLoading,
        login,
        loginAsDemoUser,
        registerApplicant,
        logout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
