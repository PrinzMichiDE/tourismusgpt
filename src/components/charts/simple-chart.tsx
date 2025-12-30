'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  maxValue?: number;
  showValues?: boolean;
  className?: string;
  animated?: boolean;
}

export function SimpleBarChart({
  data,
  maxValue,
  showValues = true,
  className,
  animated = true,
}: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100;

        return (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              {showValues && (
                <span className="font-medium">{item.value.toLocaleString('de-DE')}</span>
              )}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: animated ? index * 0.1 : 0 }}
                className={cn(
                  'h-full rounded-full',
                  item.color || 'bg-primary'
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SimplePieChartProps {
  data: DataPoint[];
  size?: number;
  showLegend?: boolean;
  className?: string;
}

export function SimplePieChart({
  data,
  size = 120,
  showLegend = true,
  className,
}: SimplePieChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let cumulativePercent = 0;

  const defaultColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const segments = data.map((item, index) => {
    const percent = (item.value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    const startAngle = (startPercent / 100) * 360;
    const endAngle = (cumulativePercent / 100) * 360;

    const largeArcFlag = percent > 50 ? 1 : 0;
    const startX = 50 + 40 * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const startY = 50 + 40 * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const endX = 50 + 40 * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const endY = 50 + 40 * Math.sin((Math.PI * (endAngle - 90)) / 180);

    const pathData =
      percent === 100
        ? `M 50 10 A 40 40 0 1 1 49.99 10`
        : `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

    return {
      ...item,
      path: pathData,
      color: item.color || defaultColors[index % defaultColors.length],
      percent,
    };
  });

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        {segments.map((segment, index) => (
          <motion.path
            key={segment.label}
            d={segment.path}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="transition-opacity hover:opacity-80"
          />
        ))}
        <circle cx="50" cy="50" r="25" fill="hsl(var(--background))" />
      </svg>
      {showLegend && (
        <div className="space-y-2 flex-1">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-muted-foreground truncate flex-1">
                {segment.label}
              </span>
              <span className="font-medium">{Math.round(segment.percent)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SimpleLineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  showDots?: boolean;
  color?: string;
  className?: string;
}

export function SimpleLineChart({
  data,
  labels,
  height = 60,
  showDots = true,
  color = 'hsl(var(--primary))',
  className,
}: SimpleLineChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return { x, y, value };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaD}
          fill="url(#lineGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        {showDots &&
          points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill={color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </svg>
      {labels && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
