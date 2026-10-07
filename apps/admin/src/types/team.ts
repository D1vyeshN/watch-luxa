// GET /superadmin/admins — staff accounts from the users collection. The env
// super admin (SUPER_ADMIN_EMAIL) has no document, so it never appears here.
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}
