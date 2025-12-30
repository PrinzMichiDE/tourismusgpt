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
import { Plus, Play, Pause, Edit, Trash2, Clock, CalendarDays } from 'lucide-react';

// Mock data for schedules
const mockSchedules = [
  { 
    id: '1', 
    name: 'Täglich - Schleswig-Holstein', 
    cronExpression: '0 2 * * *', 
    isActive: true,
    filterRegion: 'Schleswig-Holstein',
    filterCategory: null,
    lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 16 * 60 * 60 * 1000),
    jobsQueued: 1250,
  },
  { 
    id: '2', 
    name: 'Wöchentlich - Restaurants', 
    cronExpression: '0 3 * * 1', 
    isActive: true,
    filterRegion: null,
    filterCategory: 'Restaurant',
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    jobsQueued: 850,
  },
  { 
    id: '3', 
    name: 'Monatlich - Alle Hotels', 
    cronExpression: '0 4 1 * *', 
    isActive: true,
    filterRegion: null,
    filterCategory: 'Hotel',
    lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    jobsQueued: 420,
  },
  { 
    id: '4', 
    name: 'Test - Kritische POIs', 
    cronExpression: '0 6 * * *', 
    isActive: false,
    filterRegion: null,
    filterCategory: null,
    lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextRun: null,
    jobsQueued: 0,
  },
];

interface SchedulesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SchedulesPage({ params }: SchedulesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isGerman = locale === 'de';

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString(isGerman ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return '-';
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (diff < 0) {
      if (days > 0) return isGerman ? `vor ${days} Tagen` : `${days} days ago`;
      return isGerman ? `vor ${hours} Stunden` : `${hours} hours ago`;
    } else {
      if (days > 0) return isGerman ? `in ${days} Tagen` : `in ${days} days`;
      return isGerman ? `in ${hours} Stunden` : `in ${hours} hours`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isGerman ? 'Zeitpläne' : 'Schedules'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Automatische Audit-Zeitpläne konfigurieren' 
              : 'Configure automatic audit schedules'}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {isGerman ? 'Neuer Zeitplan' : 'New Schedule'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Gesamt' : 'Total'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSchedules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Aktiv' : 'Active'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockSchedules.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Jobs heute' : 'Jobs Today'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockSchedules.filter(s => s.isActive).reduce((acc, s) => acc + s.jobsQueued, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Nächste Ausführung' : 'Next Run'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {formatRelativeTime(mockSchedules.find(s => s.isActive && s.nextRun)?.nextRun || null)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Konfigurierte Zeitpläne' : 'Configured Schedules'}</CardTitle>
          <CardDescription>
            {isGerman 
              ? 'Verwalten Sie automatische Audit-Zeitpläne mit Cron-Expressions' 
              : 'Manage automatic audit schedules with cron expressions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isGerman ? 'Name' : 'Name'}</TableHead>
                <TableHead>Cron</TableHead>
                <TableHead>{isGerman ? 'Filter' : 'Filters'}</TableHead>
                <TableHead>{isGerman ? 'Letzte Ausführung' : 'Last Run'}</TableHead>
                <TableHead>{isGerman ? 'Nächste Ausführung' : 'Next Run'}</TableHead>
                <TableHead className="text-center">{isGerman ? 'Status' : 'Status'}</TableHead>
                <TableHead className="text-right">{isGerman ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    <Badge variant="outline">{schedule.cronExpression}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {schedule.filterRegion && (
                        <Badge variant="secondary">{schedule.filterRegion}</Badge>
                      )}
                      {schedule.filterCategory && (
                        <Badge variant="secondary">{schedule.filterCategory}</Badge>
                      )}
                      {!schedule.filterRegion && !schedule.filterCategory && (
                        <span className="text-muted-foreground text-sm">
                          {isGerman ? 'Alle POIs' : 'All POIs'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatRelativeTime(schedule.lastRun)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatRelativeTime(schedule.nextRun)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
                      {schedule.isActive ? (isGerman ? 'Aktiv' : 'Active') : (isGerman ? 'Pausiert' : 'Paused')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" title={schedule.isActive ? 'Pause' : 'Start'}>
                        {schedule.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cron Expression Helper */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Cron-Expression Hilfe' : 'Cron Expression Help'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">{isGerman ? 'Format' : 'Format'}</h4>
              <code className="block bg-muted p-3 rounded text-sm">
                ┌───────────── {isGerman ? 'Minute' : 'minute'} (0-59)<br/>
                │ ┌───────────── {isGerman ? 'Stunde' : 'hour'} (0-23)<br/>
                │ │ ┌───────────── {isGerman ? 'Tag' : 'day'} (1-31)<br/>
                │ │ │ ┌───────────── {isGerman ? 'Monat' : 'month'} (1-12)<br/>
                │ │ │ │ ┌───────────── {isGerman ? 'Wochentag' : 'weekday'} (0-6)<br/>
                * * * * *
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">{isGerman ? 'Beispiele' : 'Examples'}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">0 2 * * *</code>
                  <span>{isGerman ? 'Täglich um 02:00' : 'Daily at 02:00'}</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">0 3 * * 1</code>
                  <span>{isGerman ? 'Montags um 03:00' : 'Mondays at 03:00'}</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">0 4 1 * *</code>
                  <span>{isGerman ? 'Monatlich am 1.' : 'Monthly on 1st'}</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">0 */6 * * *</code>
                  <span>{isGerman ? 'Alle 6 Stunden' : 'Every 6 hours'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
