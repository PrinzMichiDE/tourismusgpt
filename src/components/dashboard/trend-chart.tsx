'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendChartProps {
  title: string;
  description?: string;
  data: Array<{ label: string; value: number }>;
  format?: 'number' | 'percent' | 'currency';
  trend?: number;
  locale?: string;
}

export function TrendChart({
  title,
  description,
  data,
  format = 'number',
  trend,
  locale = 'de',
}: TrendChartProps) {
  const isGerman = locale === 'de';
  const maxValue = Math.max(...data.map((d) => d.value));

  const formatValue = (value: number) => {
    switch (format) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(value);
      default:
        return value.toLocaleString(isGerman ? 'de-DE' : 'en-US');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {trend !== undefined && (
          <Badge
            variant={trend >= 0 ? 'success' : 'destructive'}
            className="gap-1"
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{formatValue(item.value)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
