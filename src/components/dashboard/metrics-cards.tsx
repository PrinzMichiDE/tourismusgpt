'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className 
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend && (
              <>
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={cn(
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                )}>
                  {trend.value}%
                </span>
              </>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

interface MetricsCardsProps {
  data?: {
    totalPois: number;
    averageScore: number;
    pendingAudits: number;
    discrepancies: number;
    trends?: {
      pois: number;
      score: number;
      audits: number;
      discrepancies: number;
    };
  };
  isLoading?: boolean;
  locale?: string;
}

export function MetricsCards({ data, isLoading, locale = 'de' }: MetricsCardsProps) {
  const labels = {
    de: {
      totalPois: 'Gesamt POIs',
      averageScore: 'Durchschn. Score',
      pendingAudits: 'Ausstehende Audits',
      discrepancies: 'Abweichungen',
      vsLastMonth: 'vs. letzter Monat',
    },
    en: {
      totalPois: 'Total POIs',
      averageScore: 'Average Score',
      pendingAudits: 'Pending Audits',
      discrepancies: 'Discrepancies',
      vsLastMonth: 'vs. last month',
    },
  };

  const t = labels[locale as 'de' | 'en'];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title={t.totalPois}
        value={data?.totalPois?.toLocaleString(locale) || '0'}
        icon={MapPin}
        trend={data?.trends ? { 
          value: data.trends.pois, 
          isPositive: data.trends.pois >= 0 
        } : undefined}
        description={t.vsLastMonth}
      />
      <MetricCard
        title={t.averageScore}
        value={`${data?.averageScore?.toFixed(1) || '0'}%`}
        icon={TrendingUp}
        trend={data?.trends ? { 
          value: data.trends.score, 
          isPositive: data.trends.score >= 0 
        } : undefined}
        description={t.vsLastMonth}
        className={cn(
          data?.averageScore && data.averageScore < 70 && 'border-yellow-500'
        )}
      />
      <MetricCard
        title={t.pendingAudits}
        value={data?.pendingAudits?.toLocaleString(locale) || '0'}
        icon={Clock}
        trend={data?.trends ? { 
          value: Math.abs(data.trends.audits), 
          isPositive: data.trends.audits <= 0 
        } : undefined}
        description={t.vsLastMonth}
      />
      <MetricCard
        title={t.discrepancies}
        value={data?.discrepancies?.toLocaleString(locale) || '0'}
        icon={AlertTriangle}
        trend={data?.trends ? { 
          value: Math.abs(data.trends.discrepancies), 
          isPositive: data.trends.discrepancies <= 0 
        } : undefined}
        description={t.vsLastMonth}
        className={cn(
          data?.discrepancies && data.discrepancies > 100 && 'border-red-500'
        )}
      />
    </div>
  );
}
