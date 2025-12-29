import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { MetricsCards } from '@/components/dashboard/metrics-cards';
import { POITable } from '@/components/dashboard/poi-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - in production this comes from the database
const mockMetrics = {
  totalPois: 52847,
  averageScore: 78.5,
  pendingAudits: 1234,
  discrepancies: 567,
  trends: {
    pois: 5.2,
    score: 2.1,
    audits: -15,
    discrepancies: -8,
  },
};

const mockPois = [
  {
    id: '1',
    name: 'Restaurant Meeresblick',
    category: 'Restaurant',
    city: 'Kiel',
    region: 'Schleswig-Holstein',
    auditScore: 92,
    auditStatus: 'COMPLETED',
    lastAuditAt: '2024-01-15T10:30:00Z',
    website: 'https://meeresblick.de',
  },
  {
    id: '2',
    name: 'Hotel Strandperle',
    category: 'Hotel',
    city: 'Lübeck',
    region: 'Schleswig-Holstein',
    auditScore: 65,
    auditStatus: 'REVIEW_REQUIRED',
    lastAuditAt: '2024-01-14T14:20:00Z',
    website: 'https://strandperle.de',
  },
  {
    id: '3',
    name: 'Café am Hafen',
    category: 'Café',
    city: 'Flensburg',
    region: 'Schleswig-Holstein',
    auditScore: 88,
    auditStatus: 'COMPLETED',
    lastAuditAt: '2024-01-13T09:15:00Z',
    website: 'https://cafe-hafen.de',
  },
  {
    id: '4',
    name: 'Museum für Stadtgeschichte',
    category: 'Museum',
    city: 'Husum',
    region: 'Schleswig-Holstein',
    auditScore: 45,
    auditStatus: 'REVIEW_REQUIRED',
    lastAuditAt: '2024-01-12T16:45:00Z',
    website: 'https://museum-husum.de',
  },
  {
    id: '5',
    name: 'Wellness-Spa Ostsee',
    category: 'Wellness',
    city: 'Travemünde',
    region: 'Schleswig-Holstein',
    auditScore: null,
    auditStatus: 'PENDING',
    lastAuditAt: null,
    website: 'https://spa-ostsee.de',
  },
];

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Metrics */}
      <Suspense fallback={<MetricsCards isLoading locale={locale} />}>
        <MetricsCards data={mockMetrics} locale={locale} />
      </Suspense>

      {/* POI Table */}
      <Card>
        <CardHeader>
          <CardTitle>POIs</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <POITable data={mockPois} locale={locale} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
