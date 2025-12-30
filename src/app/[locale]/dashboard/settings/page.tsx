import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Palette, 
  Globe, 
  Database, 
  Shield, 
  Bell,
  Save,
  Download,
  Upload,
  Trash2,
  Clock,
  DollarSign,
  Mail
} from 'lucide-react';

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isGerman = locale === 'de';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isGerman ? 'Einstellungen' : 'Settings'}
        </h1>
        <p className="text-muted-foreground">
          {isGerman 
            ? 'Konfigurieren Sie die Anwendungseinstellungen' 
            : 'Configure application settings'}
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>{isGerman ? 'Allgemein' : 'General'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'Grundlegende Anwendungseinstellungen' 
              : 'Basic application settings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appName">{isGerman ? 'Anwendungsname' : 'Application Name'}</Label>
              <Input id="appName" defaultValue="LDB-DataGuard" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{isGerman ? 'Zeitzone' : 'Timezone'}</Label>
              <Input id="timezone" defaultValue="Europe/Berlin" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>{isGerman ? 'Erscheinungsbild' : 'Appearance'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'Passen Sie das Aussehen der Anwendung an' 
              : 'Customize the look of the application'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">{isGerman ? 'Farbschema' : 'Color Scheme'}</Label>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  ☀️ {isGerman ? 'Hell' : 'Light'}
                </Button>
                <Button variant="outline" className="flex-1">
                  🌙 {isGerman ? 'Dunkel' : 'Dark'}
                </Button>
                <Button variant="default" className="flex-1">
                  💻 System
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>{isGerman ? 'Sprache' : 'Language'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'Spracheinstellungen für die Benutzeroberfläche' 
              : 'Language settings for the user interface'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant={isGerman ? 'default' : 'outline'} className="flex-1">
              🇩🇪 Deutsch
            </Button>
            <Button variant={!isGerman ? 'default' : 'outline'} className="flex-1">
              🇺🇸 English
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>{isGerman ? 'Datenaufbewahrung' : 'Data Retention'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'Konfigurieren Sie die Aufbewahrungsfristen für verschiedene Datentypen' 
              : 'Configure retention periods for different data types'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{isGerman ? 'Audit-Logs' : 'Audit Logs'}</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="90" className="w-20" />
                <span className="text-sm text-muted-foreground">{isGerman ? 'Tage' : 'days'}</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{isGerman ? 'Extrahierte Werte' : 'Extracted Values'}</span>
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="365" className="w-20" />
                <span className="text-sm text-muted-foreground">{isGerman ? 'Tage' : 'days'}</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{isGerman ? 'Fehlgeschlagene Jobs' : 'Failed Jobs'}</span>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="30" className="w-20" />
                <span className="text-sm text-muted-foreground">{isGerman ? 'Tage' : 'days'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle>{isGerman ? 'Budget' : 'Budget'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'API-Kosten-Budgets und Warnungen' 
              : 'API cost budgets and alerts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthlyBudget">{isGerman ? 'Monatliches Budget (USD)' : 'Monthly Budget (USD)'}</Label>
              <Input id="monthlyBudget" type="number" defaultValue="1500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertThreshold">{isGerman ? 'Warnung bei (%)' : 'Alert at (%)'}</Label>
              <Input id="alertThreshold" type="number" defaultValue="80" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>{isGerman ? 'E-Mail-Einstellungen' : 'Email Settings'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'SMTP-Konfiguration und Benachrichtigungen' 
              : 'SMTP configuration and notifications'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input id="smtpHost" defaultValue="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input id="smtpPort" type="number" defaultValue="587" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">{isGerman ? 'Absender E-Mail' : 'From Email'}</Label>
              <Input id="fromEmail" type="email" defaultValue="noreply@ldb-dataguard.de" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">{isGerman ? 'Absender Name' : 'From Name'}</Label>
              <Input id="fromName" defaultValue="LDB-DataGuard" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>{isGerman ? 'Benachrichtigungen' : 'Notifications'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'E-Mail-Benachrichtigungsregeln' 
              : 'Email notification rules'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{isGerman ? 'Audit-Score Warnung' : 'Audit Score Alert'}</p>
                <p className="text-sm text-muted-foreground">
                  {isGerman 
                    ? 'E-Mail senden wenn Score unter Schwellwert' 
                    : 'Send email when score below threshold'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Score &lt;</span>
                <Input type="number" defaultValue="80" className="w-20" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{isGerman ? 'Spam-Schutz' : 'Spam Protection'}</p>
                <p className="text-sm text-muted-foreground">
                  {isGerman 
                    ? 'Mindestabstand zwischen E-Mails pro POI' 
                    : 'Minimum interval between emails per POI'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="30" className="w-20" />
                <span className="text-sm">{isGerman ? 'Tage' : 'days'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>{isGerman ? 'Import / Export' : 'Import / Export'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'Konfiguration sichern und wiederherstellen' 
              : 'Backup and restore configuration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              {isGerman ? 'Konfiguration exportieren' : 'Export Configuration'}
            </Button>
            <Button variant="outline" className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              {isGerman ? 'Konfiguration importieren' : 'Import Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">{isGerman ? 'Gefahrenzone' : 'Danger Zone'}</CardTitle>
          </div>
          <CardDescription>
            {isGerman 
              ? 'Irreversible Aktionen - mit Vorsicht verwenden' 
              : 'Irreversible actions - use with caution'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
              <div>
                <p className="font-medium">{isGerman ? 'Cache leeren' : 'Clear Cache'}</p>
                <p className="text-sm text-muted-foreground">
                  {isGerman 
                    ? 'Alle gecachten Daten werden gelöscht' 
                    : 'All cached data will be deleted'}
                </p>
              </div>
              <Button variant="outline" className="text-red-500 border-red-200">
                {isGerman ? 'Cache leeren' : 'Clear Cache'}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
              <div>
                <p className="font-medium">{isGerman ? 'Alle Audits zurücksetzen' : 'Reset All Audits'}</p>
                <p className="text-sm text-muted-foreground">
                  {isGerman 
                    ? 'Alle Audit-Ergebnisse werden gelöscht' 
                    : 'All audit results will be deleted'}
                </p>
              </div>
              <Button variant="destructive">
                {isGerman ? 'Zurücksetzen' : 'Reset'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isGerman ? 'Einstellungen speichern' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
