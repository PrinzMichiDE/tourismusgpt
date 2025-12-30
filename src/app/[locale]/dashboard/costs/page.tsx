import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Bot, Map, Globe, Mail } from 'lucide-react';

// Mock cost data
const mockCostSummary = {
  currentMonth: 847.32,
  lastMonth: 723.45,
  projected: 1245.00,
  budget: 1500.00,
  byType: {
    OPENAI: 523.45,
    GOOGLE_PLACES: 298.12,
    SCRAPING: 18.50,
    EMAIL: 7.25,
  },
  byDay: [
    { date: '2024-12-23', amount: 28.50 },
    { date: '2024-12-24', amount: 32.15 },
    { date: '2024-12-25', amount: 15.20 },
    { date: '2024-12-26', amount: 41.80 },
    { date: '2024-12-27', amount: 38.95 },
    { date: '2024-12-28', amount: 45.60 },
    { date: '2024-12-29', amount: 52.30 },
  ],
  topPois: [
    { poiId: '1', poiName: 'Hotel Seeblick', amount: 12.45 },
    { poiId: '2', poiName: 'Restaurant Hafenkante', amount: 9.80 },
    { poiId: '3', poiName: 'Camping am Strand', amount: 8.65 },
    { poiId: '4', poiName: 'Museum für Meeresgeschichte', amount: 7.20 },
    { poiId: '5', poiName: 'Ferienwohnung Dünenblick', amount: 6.95 },
  ],
};

interface CostsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CostsPage({ params }: CostsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isGerman = locale === 'de';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const percentChange = ((mockCostSummary.currentMonth - mockCostSummary.lastMonth) / mockCostSummary.lastMonth) * 100;
  const budgetUsed = (mockCostSummary.currentMonth / mockCostSummary.budget) * 100;

  const typeIcons = {
    OPENAI: Bot,
    GOOGLE_PLACES: Map,
    SCRAPING: Globe,
    EMAIL: Mail,
  };

  const typeLabels = {
    OPENAI: 'OpenAI API',
    GOOGLE_PLACES: 'Google Places',
    SCRAPING: isGerman ? 'Web-Scraping' : 'Web Scraping',
    EMAIL: 'E-Mail',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isGerman ? 'Kosten-Dashboard' : 'Cost Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {isGerman 
            ? 'Überwachen Sie API-Kosten und Budgetauslastung' 
            : 'Monitor API costs and budget utilization'}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Aktueller Monat' : 'Current Month'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockCostSummary.currentMonth)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {percentChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className={percentChange > 0 ? 'text-red-500' : 'text-green-500'}>
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </span>
              <span className="ml-1">
                {isGerman ? 'vs. Vormonat' : 'vs. last month'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Prognose' : 'Projection'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockCostSummary.projected)}</div>
            <p className="text-xs text-muted-foreground">
              {isGerman ? 'Erwartete Monatskosten' : 'Expected monthly costs'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Budget' : 'Budget'}
            </CardTitle>
            {budgetUsed > 80 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockCostSummary.budget)}</div>
            <div className="mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {budgetUsed.toFixed(1)}% {isGerman ? 'genutzt' : 'used'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGerman ? 'Vormonat' : 'Last Month'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockCostSummary.lastMonth)}</div>
            <p className="text-xs text-muted-foreground">
              {isGerman ? 'Abgeschlossen' : 'Completed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost by Type */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{isGerman ? 'Kosten nach Typ' : 'Cost by Type'}</CardTitle>
            <CardDescription>
              {isGerman ? 'Aufschlüsselung der API-Kosten' : 'Breakdown of API costs'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(mockCostSummary.byType).map(([type, amount]) => {
                const Icon = typeIcons[type as keyof typeof typeIcons];
                const percentage = (amount / mockCostSummary.currentMonth) * 100;
                return (
                  <div key={type} className="flex items-center">
                    <Icon className="h-5 w-5 text-muted-foreground mr-3" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {typeLabels[type as keyof typeof typeLabels]}
                        </span>
                        <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isGerman ? 'Top POIs nach Kosten' : 'Top POIs by Cost'}</CardTitle>
            <CardDescription>
              {isGerman ? 'POIs mit den höchsten API-Kosten' : 'POIs with highest API costs'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isGerman ? 'POI' : 'POI'}</TableHead>
                  <TableHead className="text-right">{isGerman ? 'Kosten' : 'Cost'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCostSummary.topPois.map((poi, index) => (
                  <TableRow key={poi.poiId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{poi.poiName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(poi.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Daily Costs Chart (Simple Bar Representation) */}
      <Card>
        <CardHeader>
          <CardTitle>{isGerman ? 'Tägliche Kosten' : 'Daily Costs'}</CardTitle>
          <CardDescription>
            {isGerman ? 'Kostenentwicklung der letzten 7 Tage' : 'Cost trend over the last 7 days'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 gap-2">
            {mockCostSummary.byDay.map((day) => {
              const maxAmount = Math.max(...mockCostSummary.byDay.map(d => d.amount));
              const heightPercent = (day.amount / maxAmount) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <span className="text-xs font-medium mb-1">{formatCurrency(day.amount)}</span>
                  <div 
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    {new Date(day.date).toLocaleDateString(isGerman ? 'de-DE' : 'en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
