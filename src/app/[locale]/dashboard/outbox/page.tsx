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
import { Mail, Send, Clock, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';

// Mock mail outbox data
const mockEmails = [
  { 
    id: '1', 
    to: 'manager@hotel-seeblick.de',
    subject: 'Datenabweichung festgestellt - Hotel Seeblick',
    poiName: 'Hotel Seeblick',
    status: 'SENT',
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    attempts: 1,
  },
  { 
    id: '2', 
    to: 'info@restaurant-hafenkante.de',
    subject: 'Datenabweichung festgestellt - Restaurant Hafenkante',
    poiName: 'Restaurant Hafenkante',
    status: 'SENT',
    sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    attempts: 1,
  },
  { 
    id: '3', 
    to: 'contact@camping-strand.de',
    subject: 'Datenabweichung festgestellt - Camping am Strand',
    poiName: 'Camping am Strand',
    status: 'PENDING',
    sentAt: null,
    attempts: 0,
  },
  { 
    id: '4', 
    to: 'invalid@email',
    subject: 'Datenabweichung festgestellt - Museum Meeresgeschichte',
    poiName: 'Museum für Meeresgeschichte',
    status: 'FAILED',
    sentAt: null,
    attempts: 3,
    error: 'Invalid email address',
  },
  { 
    id: '5', 
    to: 'reservation@hotel-duene.de',
    subject: 'Datenabweichung festgestellt - Hotel Düne',
    poiName: 'Hotel Düne',
    status: 'SKIPPED',
    sentAt: null,
    attempts: 0,
    reason: 'Spam protection: Email sent 15 days ago',
  },
];

interface OutboxPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OutboxPage({ params }: OutboxPageProps) {
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

  const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'destructive' | 'secondary' | 'outline'; icon: React.ElementType }> = {
    PENDING: { label: isGerman ? 'Wartend' : 'Pending', variant: 'outline', icon: Clock },
    SENT: { label: isGerman ? 'Gesendet' : 'Sent', variant: 'success', icon: CheckCircle },
    FAILED: { label: isGerman ? 'Fehlgeschlagen' : 'Failed', variant: 'destructive', icon: XCircle },
    SKIPPED: { label: isGerman ? 'Übersprungen' : 'Skipped', variant: 'secondary', icon: RefreshCw },
  };

  const stats = {
    total: mockEmails.length,
    sent: mockEmails.filter(e => e.status === 'SENT').length,
    pending: mockEmails.filter(e => e.status === 'PENDING').length,
    failed: mockEmails.filter(e => e.status === 'FAILED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isGerman ? 'E-Mail Ausgang' : 'Email Outbox'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Überwachen Sie gesendete und ausstehende E-Mails' 
              : 'Monitor sent and pending emails'}
          </p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          {isGerman ? 'Wartende senden' : 'Send Pending'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Gesamt' : 'Total'}
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Gesendet' : 'Sent'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Wartend' : 'Pending'}
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Fehlgeschlagen' : 'Failed'}
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Email Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'E-Mail Queue' : 'Email Queue'}</CardTitle>
          <CardDescription>
            {isGerman 
              ? 'Alle E-Mails der letzten 30 Tage' 
              : 'All emails from the last 30 days'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isGerman ? 'Empfänger' : 'Recipient'}</TableHead>
                <TableHead>{isGerman ? 'Betreff' : 'Subject'}</TableHead>
                <TableHead>POI</TableHead>
                <TableHead>{isGerman ? 'Status' : 'Status'}</TableHead>
                <TableHead>{isGerman ? 'Gesendet' : 'Sent'}</TableHead>
                <TableHead className="text-right">{isGerman ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmails.map((email) => {
                const config = statusConfig[email.status];
                const StatusIcon = config.icon;
                return (
                  <TableRow key={email.id}>
                    <TableCell className="font-mono text-sm">{email.to}</TableCell>
                    <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                    <TableCell>{email.poiName}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      {email.status === 'FAILED' && email.attempts > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({email.attempts} {isGerman ? 'Versuche' : 'attempts'})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(email.sentAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title={isGerman ? 'Vorschau' : 'Preview'}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(email.status === 'FAILED' || email.status === 'PENDING') && (
                          <Button variant="ghost" size="sm" title={isGerman ? 'Erneut senden' : 'Retry'}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Spam Protection Info */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Spam-Schutz' : 'Spam Protection'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">{isGerman ? '30-Tage-Regel' : '30-Day Rule'}</h4>
                <p className="text-sm text-muted-foreground">
                  {isGerman 
                    ? 'Max. 1 E-Mail pro POI alle 30 Tage' 
                    : 'Max. 1 email per POI every 30 days'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">{isGerman ? 'Content-Hash' : 'Content Hash'}</h4>
                <p className="text-sm text-muted-foreground">
                  {isGerman 
                    ? 'Duplikat-Check für identische E-Mails' 
                    : 'Duplicate check for identical emails'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">{isGerman ? 'Auto-Retry' : 'Auto Retry'}</h4>
                <p className="text-sm text-muted-foreground">
                  {isGerman 
                    ? 'Max. 3 Versuche bei Fehlern' 
                    : 'Max. 3 attempts on errors'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
