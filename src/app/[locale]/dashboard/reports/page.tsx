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
import { FileText, Download, Calendar, BarChart3, FileSpreadsheet, Settings } from 'lucide-react';

// Mock reports data
const mockReports = [
  { 
    id: '1', 
    name: 'Monatsbericht Dezember 2024', 
    type: 'monthly',
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    period: { start: '2024-12-01', end: '2024-12-31' },
    summary: { pois: 52340, avgScore: 78.5, issues: 1234 },
    format: 'PDF',
  },
  { 
    id: '2', 
    name: 'Monatsbericht November 2024', 
    type: 'monthly',
    generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    period: { start: '2024-11-01', end: '2024-11-30' },
    summary: { pois: 51890, avgScore: 76.2, issues: 1567 },
    format: 'PDF',
  },
  { 
    id: '3', 
    name: 'Export - Schleswig-Holstein Hotels', 
    type: 'export',
    generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    period: null,
    summary: { pois: 1250, avgScore: null, issues: null },
    format: 'CSV',
  },
  { 
    id: '4', 
    name: 'Kritische POIs Report', 
    type: 'custom',
    generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    period: { start: '2024-12-01', end: '2024-12-29' },
    summary: { pois: 245, avgScore: 42.3, issues: 245 },
    format: 'PDF',
  },
];

interface ReportsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
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

  const typeLabels: Record<string, string> = {
    monthly: isGerman ? 'Monatlich' : 'Monthly',
    export: 'Export',
    custom: isGerman ? 'Benutzerdefiniert' : 'Custom',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isGerman ? 'Berichte' : 'Reports'}
          </h1>
          <p className="text-muted-foreground">
            {isGerman 
              ? 'Qualitätsberichte und Datenexporte' 
              : 'Quality reports and data exports'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {isGerman ? 'Monatsbericht erstellen' : 'Generate Monthly Report'}
              </CardTitle>
              <CardDescription>
                {isGerman ? 'PDF mit Zusammenfassung' : 'PDF with summary'}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-base">
                {isGerman ? 'POI-Export (CSV)' : 'POI Export (CSV)'}
              </CardTitle>
              <CardDescription>
                {isGerman ? 'Alle POIs exportieren' : 'Export all POIs'}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Settings className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base">
                {isGerman ? 'Config-Backup' : 'Config Backup'}
              </CardTitle>
              <CardDescription>
                {isGerman ? 'Einstellungen exportieren' : 'Export settings'}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Berichte gesamt' : 'Total Reports'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Diesen Monat' : 'This Month'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Ø Score' : 'Avg Score'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isGerman ? 'Offene Issues' : 'Open Issues'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">1,234</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Generierte Berichte' : 'Generated Reports'}</CardTitle>
          <CardDescription>
            {isGerman 
              ? 'Alle erstellten Berichte und Exporte' 
              : 'All created reports and exports'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isGerman ? 'Name' : 'Name'}</TableHead>
                <TableHead>{isGerman ? 'Typ' : 'Type'}</TableHead>
                <TableHead>{isGerman ? 'Zeitraum' : 'Period'}</TableHead>
                <TableHead>{isGerman ? 'Zusammenfassung' : 'Summary'}</TableHead>
                <TableHead>{isGerman ? 'Erstellt' : 'Created'}</TableHead>
                <TableHead className="text-right">{isGerman ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {report.format === 'PDF' ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[report.type]}</Badge>
                  </TableCell>
                  <TableCell>
                    {report.period ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {report.period.start} - {report.period.end}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span>{report.summary.pois.toLocaleString()} POIs</span>
                      {report.summary.avgScore && (
                        <span className="text-muted-foreground ml-2">
                          Ø {report.summary.avgScore}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(report.generatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {report.format}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
