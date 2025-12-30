'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
} from '@/components/ui/animated-card';
import { Progress } from '@/components/ui/progress';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  progress?: number;
  iconColor?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  progress,
  iconColor = 'text-primary',
  delay = 0,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-600 dark:text-green-400';
    if (trend.value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const TrendIcon = getTrendIcon();

  return (
    <AnimatedCard delay={delay} className="overflow-hidden">
      <AnimatedCardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('rounded-lg bg-primary/10 p-2', iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.3 }}
        >
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        </motion.div>

        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && TrendIcon && (
              <span className={cn('flex items-center text-xs', getTrendColor())}>
                <TrendIcon className="mr-0.5 h-3 w-3" />
                {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
            {trend && (
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}

        {progress !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.4 }}
            className="mt-3"
          >
            <Progress value={progress} className="h-1.5" />
          </motion.div>
        )}
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
