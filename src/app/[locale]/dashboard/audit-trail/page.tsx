import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  History, 
  Search, 
  Download, 
  Filter,
  UserCircle,
  Edit,
  Trash2,
  Plus,
  Settings,
  Eye
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock audit log data
const mockAuditLogs = [
  { 
    id: '1', 
    userId: 'user1',
    userName: 'Max Mustermann',
    userEmail: 'admin@ldb-dataguard.de',
    action: 'UPDATE',
    entityType: 'POI',
    entityId: 'poi_123',
    entityName: 'Hotel Seeblick',
    changes: { name: { from: 'Hotel Seeblick GmbH', to: 'Hotel Seeblick' } },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  { 
    id: '2', 
    userId: 'user1',
    userName: 'Max Mustermann',
    userEmail: 'admin@ldb-dataguard.de',
    action: 'CREATE',
    entityType: 'Schedule',
    entityId: 'sched_456',
    entityName: 'Täglich - Hotels',
    changes: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  { 
    id: '3', 
    userId: 'user2',
    userName: 'Lisa Schmidt',
    userEmail: 'editor@ldb-dataguard.de',
    action: 'UPDATE',
    entityType: 'DataField',
    entityId: 'field_789',
    entityName: 'openingHours',
    changes: { isRequired: { from: false, to: true } },
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  { 
    id: '4', 
    userId: 'user1',
    userName: 'Max Mustermann',
    userEmail: 'admin@ldb-dataguard.de',
    action: 'DELETE',
    entityType: 'User',
    entityId: 'user_old',
    entityName: 'test@example.com',
    changes: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  { 
    id: '5', 
    userId: 'user1',
    userName: 'Max Mustermann',
    userEmail: 'admin@ldb-dataguard.de',
    action: 'UPDATE',
    entityType: 'AppConfig',
    entityId: 'config_theme',
    entityName: 'theme.default',
    changes: { value: { from: 'light', to: 'dark' } },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

interface AuditTrailPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AuditTrailPage({ params }: AuditTrailPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isGerman = locale === 'de';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isGerman ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const actionConfig: Record<string, { label: string; variant: 'default' | 'success' | 'destructive' | 'secondary'; icon: React.ElementType }> = {
    CREATE: { label: isGerman ? 'Erstellt' : 'Created', variant: 'success', icon: Plus },
    UPDATE: { label: isGerman ? 'Geändert' : 'Updated', variant: 'default', icon: Edit },
    DELETE: { label: isGerman ? 'Gelöscht' : 'Deleted', variant: 'destructive', icon: Trash2 },
    VIEW: { label: isGerman ? 'Angesehen' : 'Viewed', variant: 'secondary', icon: Eye },
  };

  const entityLabels: Record<string, string> = {
    POI: 'POI',
    User: isGerman ? 'Benutzer' : 'User',
    Schedule: isGerman ? 'Zeitplan' : 'Schedule',
    DataField: isGerman ? 'Datenfeld' : 'Data Field',
    AppConfig: isGerman ? 'Einstellung' : 'Setting',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isGerman ? 'Audit-Trail' : 'Audit Trail'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Vollständiges Protokoll aller Admin-Aktionen' 
              : 'Complete log of all admin actions'}
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {isGerman ? 'Exportieren' : 'Export'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={isGerman ? 'Suchen...' : 'Search...'} 
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {isGerman ? 'Filter' : 'Filters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Heute' : 'Today'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Diese Woche' : 'This Week'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Aktive Benutzer' : 'Active Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Kritische Aktionen' : 'Critical Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Aktivitätsprotokoll' : 'Activity Log'}</CardTitle>
          <CardDescription>
            {isGerman 
              ? 'Alle Änderungen werden für 90 Tage aufbewahrt' 
              : 'All changes are retained for 90 days'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isGerman ? 'Zeitpunkt' : 'Time'}</TableHead>
                <TableHead>{isGerman ? 'Benutzer' : 'User'}</TableHead>
                <TableHead>{isGerman ? 'Aktion' : 'Action'}</TableHead>
                <TableHead>{isGerman ? 'Objekt' : 'Entity'}</TableHead>
                <TableHead>{isGerman ? 'Änderungen' : 'Changes'}</TableHead>
                <TableHead className="text-right">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditLogs.map((log) => {
                const config = actionConfig[log.action];
                const ActionIcon = config.icon;
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{formatRelativeTime(log.createdAt)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{log.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{log.userName}</p>
                          <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <ActionIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline">{entityLabels[log.entityType] || log.entityType}</Badge>
                        <p className="text-sm mt-1">{log.entityName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.changes ? (
                        <div className="text-xs font-mono bg-muted p-2 rounded max-w-xs overflow-hidden">
                          {Object.entries(log.changes).map(([key, value]: [string, any]) => (
                            <div key={key}>
                              <span className="text-muted-foreground">{key}:</span>{' '}
                              <span className="text-red-500 line-through">{value.from}</span>{' '}
                              → <span className="text-green-500">{value.to}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-xs">{log.ipAddress}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
