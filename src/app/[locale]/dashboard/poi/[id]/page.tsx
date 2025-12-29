import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, RefreshCw, ExternalLink, MapPin, Phone, Mail, Globe } from 'lucide-react';
import Link from 'next/link';

// Mock POI data
const mockPoi = {
  id: '1',
  name: 'Restaurant Meeresblick',
  externalId: 'TLDB-12345',
  category: 'Restaurant',
  street: 'Hafenstraße 42',
  postalCode: '24103',
  city: 'Kiel',
  region: 'Schleswig-Holstein',
  country: 'DE',
  latitude: 54.3233,
  longitude: 10.1394,
  phone: '+49 431 12345678',
  email: 'info@meeresblick.de',
  website: 'https://meeresblick.de',
  auditScore: 92,
  auditStatus: 'COMPLETED',
  lastAuditAt: '2024-01-15T10:30:00Z',
};

const mockComparison = [
  {
    field: 'name',
    displayName: 'Name',
    tldb: 'Restaurant Meeresblick',
    website: 'Restaurant Meeresblick',
    maps: 'Restaurant Meeresblick',
    status: 'match',
  },
  {
    field: 'street',
    displayName: 'Straße',
    tldb: 'Hafenstraße 42',
    website: 'Hafenstr. 42',
    maps: 'Hafenstraße 42',
    status: 'partial_match',
  },
  {
    field: 'phone',
    displayName: 'Telefon',
    tldb: '+49 431 12345678',
    website: '0431 12345678',
    maps: '+49 431 12345678',
    status: 'partial_match',
  },
  {
    field: 'openingHours',
    displayName: 'Öffnungszeiten',
    tldb: 'Mo-Fr 9:00-18:00',
    website: 'Mo-Fr 9-17',
    maps: 'Mo-Fr 9:00-17:00',
    status: 'mismatch',
  },
  {
    field: 'email',
    displayName: 'E-Mail',
    tldb: 'info@meeresblick.de',
    website: 'kontakt@meeresblick.de',
    maps: null,
    status: 'mismatch',
  },
];

const statusIcons: Record<string, { icon: string; color: string }> = {
  match: { icon: '✅', color: 'text-green-500' },
  partial_match: { icon: '⚠️', color: 'text-yellow-500' },
  mismatch: { icon: '🔴', color: 'text-red-500' },
  missing_data: { icon: '❓', color: 'text-gray-500' },
};

interface POIDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function POIDetailPage({ params }: POIDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'poi' });

  // In production, fetch from database
  const poi = mockPoi;
  
  if (!poi) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${locale}/dashboard`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{poi.name}</h1>
            <p className="text-muted-foreground">
              {poi.category} • {poi.city}, {poi.region}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={poi.auditScore >= 80 ? 'success' : poi.auditScore >= 60 ? 'warning' : 'destructive'}
            className="text-lg px-3 py-1"
          >
            {poi.auditScore}%
          </Badge>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('startAudit')}
          </Button>
        </div>
      </div>

      {/* POI Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {locale === 'de' ? 'Adresse' : 'Address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{poi.street}</p>
            <p>{poi.postalCode} {poi.city}</p>
            <p>{poi.region}, {poi.country}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {locale === 'de' ? 'Kontakt' : 'Contact'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              {poi.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {poi.email}
            </p>
            <p className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              <a href={poi.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {poi.website}
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {locale === 'de' ? 'Audit-Status' : 'Audit Status'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="text-muted-foreground">{t('status')}:</span>{' '}
              <Badge>{poi.auditStatus}</Badge>
            </p>
            <p>
              <span className="text-muted-foreground">{t('lastAudit')}:</span>{' '}
              {new Date(poi.lastAuditAt).toLocaleDateString(locale)}
            </p>
            <p>
              <span className="text-muted-foreground">ID:</span>{' '}
              {poi.externalId}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('comparison')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">{locale === 'de' ? 'Feld' : 'Field'}</TableHead>
                <TableHead>{t('tldbData')}</TableHead>
                <TableHead>{t('websiteData')}</TableHead>
                <TableHead>{t('mapsData')}</TableHead>
                <TableHead className="w-20 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockComparison.map((row) => (
                <TableRow key={row.field}>
                  <TableCell className="font-medium">{row.displayName}</TableCell>
                  <TableCell>{row.tldb || '-'}</TableCell>
                  <TableCell className={row.status === 'mismatch' && row.website ? 'bg-red-50 dark:bg-red-950' : ''}>
                    {row.website || '-'}
                  </TableCell>
                  <TableCell className={row.status === 'mismatch' && row.maps ? 'bg-red-50 dark:bg-red-950' : ''}>
                    {row.maps || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={statusIcons[row.status]?.color}>
                      {statusIcons[row.status]?.icon}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('history')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {locale === 'de' 
              ? 'Audit-Verlauf wird hier angezeigt...' 
              : 'Audit history will be displayed here...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
