'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Mail,
  FileText,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'pending';
  title: string;
  description?: string;
  timestamp: Date;
  icon?: LucideIcon;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxHeight?: string;
  emptyMessage?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
  },
  info: {
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  pending: {
    icon: Clock,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
};

export function ActivityFeed({
  activities,
  maxHeight = '400px',
  emptyMessage = 'Keine Aktivitäten',
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <RefreshCw className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }}>
      <div className="space-y-3 pr-4">
        {activities.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = activity.icon || config.icon;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3"
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  config.bg
                )}
              >
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium leading-tight">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
