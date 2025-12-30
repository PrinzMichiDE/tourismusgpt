import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Mail,
  Key,
  MoreHorizontal
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock users data
const mockUsers = [
  { 
    id: '1', 
    name: 'Max Mustermann',
    email: 'admin@ldb-dataguard.de',
    role: 'ADMIN',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastLoginAt: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  { 
    id: '2', 
    name: 'Lisa Schmidt',
    email: 'editor@ldb-dataguard.de',
    role: 'EDITOR',
    status: 'ACTIVE',
    twoFactorEnabled: false,
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  { 
    id: '3', 
    name: 'Thomas Meier',
    email: 'viewer@ldb-dataguard.de',
    role: 'VIEWER',
    status: 'ACTIVE',
    twoFactorEnabled: false,
    lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  { 
    id: '4', 
    name: 'Anna Weber',
    email: 'anna.weber@example.com',
    role: 'EDITOR',
    status: 'INACTIVE',
    twoFactorEnabled: false,
    lastLoginAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
  },
];

interface UsersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isGerman = locale === 'de';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isGerman ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return isGerman ? `vor ${days} Tagen` : `${days} days ago`;
    if (hours > 0) return isGerman ? `vor ${hours} Stunden` : `${hours} hours ago`;
    return isGerman ? `vor ${minutes} Minuten` : `${minutes} minutes ago`;
  };

  const roleConfig: Record<string, { label: string; variant: 'default' | 'success' | 'secondary'; icon: React.ElementType }> = {
    ADMIN: { label: 'Admin', variant: 'default', icon: ShieldAlert },
    EDITOR: { label: 'Editor', variant: 'success', icon: ShieldCheck },
    VIEWER: { label: 'Viewer', variant: 'secondary', icon: Shield },
  };

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'ACTIVE').length,
    admins: mockUsers.filter(u => u.role === 'ADMIN').length,
    with2FA: mockUsers.filter(u => u.twoFactorEnabled).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isGerman ? 'Benutzerverwaltung' : 'User Management'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Verwalten Sie Benutzerkonten und Berechtigungen' 
              : 'Manage user accounts and permissions'}
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          {isGerman ? 'Benutzer anlegen' : 'Add User'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Gesamt' : 'Total'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Aktiv' : 'Active'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Administratoren' : 'Administrators'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Mit 2FA' : 'With 2FA'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.with2FA}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Benutzer' : 'Users'}</CardTitle>
          <CardDescription>
            {isGerman 
              ? 'Alle registrierten Benutzer der Plattform' 
              : 'All registered users of the platform'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isGerman ? 'Benutzer' : 'User'}</TableHead>
                <TableHead>{isGerman ? 'Rolle' : 'Role'}</TableHead>
                <TableHead>{isGerman ? 'Status' : 'Status'}</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>{isGerman ? 'Letzter Login' : 'Last Login'}</TableHead>
                <TableHead>{isGerman ? 'Erstellt' : 'Created'}</TableHead>
                <TableHead className="text-right">{isGerman ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => {
                const config = roleConfig[user.role];
                const RoleIcon = config.icon;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <RoleIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {user.status === 'ACTIVE' 
                          ? (isGerman ? 'Aktiv' : 'Active') 
                          : (isGerman ? 'Inaktiv' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.twoFactorEnabled ? (
                        <Badge variant="outline" className="text-green-600">
                          <Key className="h-3 w-3 mr-1" />
                          {isGerman ? 'Aktiviert' : 'Enabled'}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatRelativeTime(user.lastLoginAt)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(user.createdAt)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title={isGerman ? 'Bearbeiten' : 'Edit'}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title={isGerman ? 'Passwort zurücksetzen' : 'Reset Password'}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" title={isGerman ? 'Löschen' : 'Delete'}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Rollen & Berechtigungen' : 'Roles & Permissions'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <span className="font-medium">Admin</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ {isGerman ? 'Vollzugriff auf alle Funktionen' : 'Full access to all features'}</li>
                <li>✓ {isGerman ? 'Benutzerverwaltung' : 'User management'}</li>
                <li>✓ {isGerman ? 'Systemeinstellungen' : 'System settings'}</li>
                <li>✓ {isGerman ? 'Daten löschen' : 'Delete data'}</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span className="font-medium">Editor</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ {isGerman ? 'POIs bearbeiten' : 'Edit POIs'}</li>
                <li>✓ {isGerman ? 'Audits starten' : 'Start audits'}</li>
                <li>✓ {isGerman ? 'Felder konfigurieren' : 'Configure fields'}</li>
                <li>✗ {isGerman ? 'Keine Benutzerverwaltung' : 'No user management'}</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Viewer</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ {isGerman ? 'Dashboard ansehen' : 'View dashboard'}</li>
                <li>✓ {isGerman ? 'Berichte einsehen' : 'View reports'}</li>
                <li>✗ {isGerman ? 'Keine Bearbeitung' : 'No editing'}</li>
                <li>✗ {isGerman ? 'Keine Konfiguration' : 'No configuration'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
