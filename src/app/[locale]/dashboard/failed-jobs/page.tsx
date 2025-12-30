import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AlertTriangle, RefreshCw, Trash2, Eye, Clock, XCircle } from 'lucide-react';

// Mock failed jobs data
const mockFailedJobs = [
  { 
    id: '1', 
    queue: 'scraper-queue',
    jobId: 'job_abc123',
    poiName: 'Restaurant Meeresblick',
    error: 'TimeoutError: Navigation timeout of 30000 ms exceeded',
    failedAt: new Date(Date.now() - 30 * 60 * 1000),
    attempts: 3,
    canRetry: true,
  },
  { 
    id: '2', 
    queue: 'maps-queue',
    jobId: 'job_def456',
    poiName: 'Hotel Strandperle',
    error: 'GooglePlacesError: OVER_QUERY_LIMIT',
    failedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    attempts: 3,
    canRetry: false,
  },
  { 
    id: '3', 
    queue: 'audit-queue',
    jobId: 'job_ghi789',
    poiName: 'Ferienwohnung Dünenblick',
    error: 'OpenAIError: Rate limit exceeded',
    failedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    attempts: 3,
    canRetry: true,
  },
  { 
    id: '4', 
    queue: 'scraper-queue',
    jobId: 'job_jkl012',
    poiName: 'Camping Waldrand',
    error: 'Error: net::ERR_NAME_NOT_RESOLVED at https://camping-waldrand.invalid',
    failedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    attempts: 3,
    canRetry: false,
  },
  { 
    id: '5', 
    queue: 'mail-queue',
    jobId: 'job_mno345',
    poiName: 'Museum Heimatgeschichte',
    error: 'SMTPError: 550 Mailbox not found',
    failedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    attempts: 3,
    canRetry: false,
  },
];

interface FailedJobsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FailedJobsPage({ params }: FailedJobsPageProps) {
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
    
    if (hours > 0) {
      return isGerman ? `vor ${hours} Stunden` : `${hours} hours ago`;
    }
    return isGerman ? `vor ${minutes} Minuten` : `${minutes} minutes ago`;
  };

  const queueLabels: Record<string, { label: string; color: string }> = {
    'scraper-queue': { label: 'Scraper', color: 'bg-blue-500' },
    'maps-queue': { label: 'Maps', color: 'bg-green-500' },
    'audit-queue': { label: 'Audit', color: 'bg-purple-500' },
    'mail-queue': { label: 'Mail', color: 'bg-orange-500' },
  };

  const stats = {
    total: mockFailedJobs.length,
    retryable: mockFailedJobs.filter(j => j.canRetry).length,
    byQueue: Object.fromEntries(
      ['scraper-queue', 'maps-queue', 'audit-queue', 'mail-queue'].map(q => [
        q,
        mockFailedJobs.filter(j => j.queue === q).length
      ])
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isGerman ? 'Fehlgeschlagene Jobs' : 'Failed Jobs'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Überprüfen und verwalten Sie fehlgeschlagene Hintergrundjobs' 
              : 'Review and manage failed background jobs'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {isGerman ? 'Alle erneut versuchen' : 'Retry All'}
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            {isGerman ? 'Alle löschen' : 'Clear All'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Gesamt' : 'Total'}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.total}</div>
          </CardContent>
        </Card>
        {Object.entries(queueLabels).map(([queue, config]) => (
          <Card key={queue}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byQueue[queue] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Failed Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Fehler-Übersicht' : 'Error Overview'}</CardTitle>
          <CardDescription>
            {isGerman 
              ? 'Jobs die nach 3 Versuchen fehlgeschlagen sind' 
              : 'Jobs that failed after 3 attempts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue</TableHead>
                <TableHead>Job ID</TableHead>
                <TableHead>POI</TableHead>
                <TableHead>{isGerman ? 'Fehler' : 'Error'}</TableHead>
                <TableHead>{isGerman ? 'Fehlgeschlagen' : 'Failed'}</TableHead>
                <TableHead className="text-right">{isGerman ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFailedJobs.map((job) => {
                const queueConfig = queueLabels[job.queue];
                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <div className={`w-2 h-2 rounded-full ${queueConfig.color}`} />
                        {queueConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{job.jobId}</TableCell>
                    <TableCell className="font-medium">{job.poiName}</TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm text-red-600 truncate" title={job.error}>
                          {job.error}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {job.attempts} {isGerman ? 'Versuche' : 'attempts'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatRelativeTime(job.failedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title={isGerman ? 'Details' : 'Details'}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {job.canRetry && (
                          <Button variant="ghost" size="sm" title={isGerman ? 'Erneut versuchen' : 'Retry'}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
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

      {/* Error Categories */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Häufige Fehlertypen' : 'Common Error Types'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Timeout</span>
              </div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">
                {isGerman ? 'Zeitüberschreitungen' : 'Timeouts'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Rate Limit</span>
              </div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">
                {isGerman ? 'API-Limits erreicht' : 'API limits reached'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">DNS</span>
              </div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">
                {isGerman ? 'Domain nicht gefunden' : 'Domain not found'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-purple-500" />
                <span className="font-medium">SMTP</span>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">
                {isGerman ? 'E-Mail-Fehler' : 'Email errors'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
