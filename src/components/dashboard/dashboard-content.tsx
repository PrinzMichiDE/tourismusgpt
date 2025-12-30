'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StatCard } from './stat-card';
import { ScoreRing } from './score-ring';
import { QuickAction } from './quick-action';
import { ActivityFeed } from './activity-feed';
import { POITable } from './poi-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
} from '@/components/ui/animated-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DashboardContentProps {
  locale: string;
}

// Mock data
const mockMetrics = {
  totalPois: 52847,
  averageScore: 78,
  pendingAudits: 1234,
  discrepancies: 567,
  completedToday: 89,
  emailsSent: 23,
};

const mockActivities = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Audit abgeschlossen',
    description: 'Restaurant Meeresblick - Score: 92',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    type: 'warning' as const,
    title: 'Diskrepanz gefunden',
    description: 'Hotel Strandperle - Öffnungszeiten',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'E-Mail gesendet',
    description: 'Benachrichtigung an café@hafen.de',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '4',
    type: 'success' as const,
    title: 'Scraping abgeschlossen',
    description: '125 Websites verarbeitet',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: '5',
    type: 'error' as const,
    title: 'Job fehlgeschlagen',
    description: 'Google Maps API Rate Limit',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const mockPois = [
  {
    id: 'clx123abc',
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
    id: 'clx456def',
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
    id: 'clx789ghi',
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
    id: 'clx012jkl',
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
    id: 'clx345mno',
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

const categoryDistribution = [
  { name: 'Restaurants', count: 15234, percentage: 29 },
  { name: 'Hotels', count: 8456, percentage: 16 },
  { name: 'Cafés', count: 7123, percentage: 13 },
  { name: 'Museen', count: 5678, percentage: 11 },
  { name: 'Wellness', count: 4532, percentage: 9 },
  { name: 'Sonstige', count: 11824, percentage: 22 },
];

export function DashboardContent({ locale }: DashboardContentProps) {
  const t = useTranslations('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Aktualisieren
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Neuer POI
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gesamt POIs"
          value={mockMetrics.totalPois.toLocaleString('de-DE')}
          subtitle="aktive Einträge"
          icon={MapPin}
          trend={{ value: 5.2, label: 'vs. letzter Monat' }}
          delay={0}
        />
        <StatCard
          title="Durchschnitt Score"
          value={`${mockMetrics.averageScore}%`}
          subtitle="Qualitätsindex"
          icon={TrendingUp}
          trend={{ value: 2.1, label: 'vs. letzter Monat' }}
          iconColor="text-green-600"
          delay={0.1}
        />
        <StatCard
          title="Ausstehende Audits"
          value={mockMetrics.pendingAudits.toLocaleString('de-DE')}
          subtitle="in Warteschlange"
          icon={Clock}
          progress={45}
          iconColor="text-yellow-600"
          delay={0.2}
        />
        <StatCard
          title="Diskrepanzen"
          value={mockMetrics.discrepancies.toLocaleString('de-DE')}
          subtitle="erfordern Review"
          icon={AlertTriangle}
          trend={{ value: -8, label: 'vs. letzte Woche' }}
          iconColor="text-red-600"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score Overview */}
        <AnimatedCard delay={0.4} className="lg:col-span-2">
          <AnimatedCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <AnimatedCardTitle>Qualitäts-Übersicht</AnimatedCardTitle>
                <AnimatedCardDescription>
                  Verteilung der Audit-Scores
                </AnimatedCardDescription>
              </div>
              <Badge variant="outline" className="font-normal">
                <Activity className="mr-1 h-3 w-3" />
                Live
              </Badge>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={mockMetrics.averageScore} size="lg" label="Gesamtbewertung" />
              <div className="flex-1 space-y-4 w-full">
                {[
                  { label: 'Exzellent (80-100)', value: 35, color: 'bg-green-500' },
                  { label: 'Gut (60-79)', value: 28, color: 'bg-yellow-500' },
                  { label: 'Verbesserungswürdig (40-59)', value: 22, color: 'bg-orange-500' },
                  { label: 'Kritisch (0-39)', value: 15, color: 'bg-red-500' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-1"
                  >
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <Progress
                      value={item.value}
                      className="h-2"
                      indicatorClassName={item.color}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Quick Actions */}
        <AnimatedCard delay={0.5}>
          <AnimatedCardHeader>
            <AnimatedCardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Schnellaktionen
            </AnimatedCardTitle>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-3">
            <QuickAction
              icon={RefreshCw}
              label="Audit starten"
              description="Alle ausstehenden POIs"
              variant="primary"
              delay={0.6}
            />
            <QuickAction
              icon={Download}
              label="Report exportieren"
              description="PDF oder CSV"
              delay={0.7}
            />
            <QuickAction
              icon={Filter}
              label="Filter anwenden"
              description="Region: Schleswig-Holstein"
              delay={0.8}
            />
          </AnimatedCardContent>
        </AnimatedCard>
      </div>

      {/* Activity and Categories */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <AnimatedCard delay={0.6}>
          <AnimatedCardHeader>
            <AnimatedCardTitle>Letzte Aktivitäten</AnimatedCardTitle>
            <AnimatedCardDescription>
              Aktuelle Systemereignisse
            </AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <ActivityFeed activities={mockActivities} maxHeight="280px" />
          </AnimatedCardContent>
        </AnimatedCard>

        {/* Category Distribution */}
        <AnimatedCard delay={0.7} className="lg:col-span-2">
          <AnimatedCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <AnimatedCardTitle>Kategorieverteilung</AnimatedCardTitle>
                <AnimatedCardDescription>
                  POIs nach Kategorie
                </AnimatedCardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <PieChart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categoryDistribution.map((cat, index) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="text-2xl font-bold">
                    {cat.count.toLocaleString('de-DE')}
                  </div>
                  <div className="text-sm text-muted-foreground">{cat.name}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={cat.percentage} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {cat.percentage}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </div>

      {/* POI Table */}
      <AnimatedCard delay={0.8} hover={false}>
        <AnimatedCardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <AnimatedCardTitle>POI-Übersicht</AnimatedCardTitle>
              <AnimatedCardDescription>
                {mockMetrics.totalPois.toLocaleString('de-DE')} Einträge
              </AnimatedCardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="POI suchen..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AnimatedCardHeader>
        <AnimatedCardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
              <TabsTrigger value="review">Review erforderlich</TabsTrigger>
              <TabsTrigger value="pending">Ausstehend</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <POITable data={mockPois} locale={locale} />
            </TabsContent>
            <TabsContent value="completed">
              <POITable
                data={mockPois.filter((p) => p.auditStatus === 'COMPLETED')}
                locale={locale}
              />
            </TabsContent>
            <TabsContent value="review">
              <POITable
                data={mockPois.filter((p) => p.auditStatus === 'REVIEW_REQUIRED')}
                locale={locale}
              />
            </TabsContent>
            <TabsContent value="pending">
              <POITable
                data={mockPois.filter((p) => p.auditStatus === 'PENDING')}
                locale={locale}
              />
            </TabsContent>
          </Tabs>
        </AnimatedCardContent>
      </AnimatedCard>
    </div>
  );
}
