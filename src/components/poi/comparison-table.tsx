'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, AlertTriangle, XCircle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonRow {
  field: string;
  fieldLabel: string;
  tldbValue: string | null;
  websiteValue: string | null;
  mapsValue: string | null;
  status: 'match' | 'warning' | 'mismatch' | 'missing';
}

interface ComparisonTableProps {
  data: ComparisonRow[];
  locale?: string;
}

export function ComparisonTable({ data, locale = 'de' }: ComparisonTableProps) {
  const isGerman = locale === 'de';

  const statusConfig = {
    match: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950/20',
      label: isGerman ? 'Übereinstimmung' : 'Match',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      label: isGerman ? 'Abweichung' : 'Warning',
    },
    mismatch: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950/20',
      label: isGerman ? 'Fehler' : 'Mismatch',
    },
    missing: {
      icon: Minus,
      color: 'text-muted-foreground',
      bg: 'bg-muted/50',
      label: isGerman ? 'Fehlend' : 'Missing',
    },
  };

  const renderValue = (value: string | null, isHighlighted: boolean = false) => {
    if (!value) {
      return <span className="text-muted-foreground italic">-</span>;
    }
    return (
      <span
        className={cn(
          'text-sm',
          isHighlighted && 'font-medium text-red-600 dark:text-red-400'
        )}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[180px]">
              {isGerman ? 'Feld' : 'Field'}
            </TableHead>
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                <Badge variant="default">TLDB</Badge>
                <span className="text-xs text-muted-foreground">
                  ({isGerman ? 'Master' : 'Master'})
                </span>
              </div>
            </TableHead>
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Website</Badge>
              </div>
            </TableHead>
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Google Maps</Badge>
              </div>
            </TableHead>
            <TableHead className="w-[100px] text-center">
              {isGerman ? 'Status' : 'Status'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const config = statusConfig[row.status];
            const StatusIcon = config.icon;
            const isMismatch = row.status === 'mismatch' || row.status === 'warning';

            return (
              <TableRow key={row.field} className={cn(config.bg)}>
                <TableCell className="font-medium">{row.fieldLabel}</TableCell>
                <TableCell>{renderValue(row.tldbValue)}</TableCell>
                <TableCell>
                  {renderValue(
                    row.websiteValue,
                    isMismatch && row.websiteValue !== row.tldbValue
                  )}
                </TableCell>
                <TableCell>
                  {renderValue(
                    row.mapsValue,
                    isMismatch && row.mapsValue !== row.tldbValue
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <StatusIcon className={cn('h-4 w-4', config.color)} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
