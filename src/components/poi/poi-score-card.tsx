'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreRing } from '@/components/dashboard/score-ring';
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
  AnimatedCardTitle,
} from '@/components/ui/animated-card';

interface POIScoreCardProps {
  poi: {
    id: string;
    name: string;
    category?: string;
    city?: string;
    region?: string;
    website?: string;
    auditScore: number | null;
    auditStatus: string;
    lastAuditAt?: string | null;
  };
  onAuditClick?: () => void;
  onViewClick?: () => void;
}

const statusConfig = {
  COMPLETED: {
    icon: CheckCircle,
    label: 'Abgeschlossen',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
  },
  REVIEW_REQUIRED: {
    icon: AlertTriangle,
    label: 'Review erforderlich',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  PENDING: {
    icon: Clock,
    label: 'Ausstehend',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
  FAILED: {
    icon: XCircle,
    label: 'Fehlgeschlagen',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
  },
};

export function POIScoreCard({ poi, onAuditClick, onViewClick }: POIScoreCardProps) {
  const status = statusConfig[poi.auditStatus as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <AnimatedCard>
      <AnimatedCardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <AnimatedCardTitle className="truncate">{poi.name}</AnimatedCardTitle>
            <div className="flex items-center gap-2 mt-1">
              {poi.category && (
                <Badge variant="secondary" className="text-xs">
                  {poi.category}
                </Badge>
              )}
              {poi.city && (
                <span className="text-xs text-muted-foreground">{poi.city}</span>
              )}
            </div>
          </div>
          <div className={cn('p-1.5 rounded-full', status.bg)}>
            <StatusIcon className={cn('h-4 w-4', status.color)} />
          </div>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent>
        <div className="flex items-center gap-6">
          <ScoreRing
            score={poi.auditScore ?? 0}
            size="sm"
            showLabel={false}
          />
          <div className="flex-1 min-w-0">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={cn('font-medium', status.color)}>
                  {status.label}
                </span>
              </div>
              {poi.lastAuditAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Letzter Audit</span>
                  <span className="font-medium">
                    {new Date(poi.lastAuditAt).toLocaleDateString('de-DE')}
                  </span>
                </div>
              )}
              {poi.website && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Website</span>
                  <a
                    href={poi.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="truncate max-w-[120px]">
                      {new URL(poi.website).hostname}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewClick}
          >
            Details
          </Button>
          <Button size="sm" className="flex-1" onClick={onAuditClick}>
            Audit starten
          </Button>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
