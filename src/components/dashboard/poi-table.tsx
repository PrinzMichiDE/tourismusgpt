'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ExternalLink,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface POI {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  region: string | null;
  auditScore: number | null;
  auditStatus: string;
  lastAuditAt: string | null;
  website: string | null;
}

interface POITableProps {
  data: POI[];
  isLoading?: boolean;
  locale?: string;
  onRowClick?: (poi: POI) => void;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  COMPLETED: 'success',
  PENDING: 'default',
  IN_PROGRESS: 'warning',
  FAILED: 'destructive',
  REVIEW_REQUIRED: 'warning',
};

export function POITable({ data, isLoading, locale = 'de', onRowClick }: POITableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const labels = {
    de: {
      search: 'POIs suchen...',
      name: 'Name',
      category: 'Kategorie',
      city: 'Stadt',
      region: 'Region',
      score: 'Score',
      status: 'Status',
      lastAudit: 'Letzter Audit',
      actions: 'Aktionen',
      noResults: 'Keine POIs gefunden',
      page: 'Seite',
      of: 'von',
    },
    en: {
      search: 'Search POIs...',
      name: 'Name',
      category: 'Category',
      city: 'City',
      region: 'Region',
      score: 'Score',
      status: 'Status',
      lastAudit: 'Last Audit',
      actions: 'Actions',
      noResults: 'No POIs found',
      page: 'Page',
      of: 'of',
    },
  };

  const t = labels[locale as 'de' | 'en'];

  const columns = React.useMemo<ColumnDef<POI>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t.name}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/poi/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.getValue('name')}
          </Link>
        ),
      },
      {
        accessorKey: 'category',
        header: t.category,
        cell: ({ row }) => row.getValue('category') || '-',
      },
      {
        accessorKey: 'city',
        header: t.city,
        cell: ({ row }) => row.getValue('city') || '-',
      },
      {
        accessorKey: 'region',
        header: t.region,
        cell: ({ row }) => row.getValue('region') || '-',
      },
      {
        accessorKey: 'auditScore',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t.score}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const score = row.getValue('auditScore') as number | null;
          if (score === null) return '-';
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-16 rounded-full bg-gray-200 overflow-hidden'
                )}
              >
                <div
                  className={cn(
                    'h-full rounded-full',
                    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-sm font-medium">{score.toFixed(0)}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'auditStatus',
        header: t.status,
        cell: ({ row }) => {
          const status = row.getValue('auditStatus') as string;
          return (
            <Badge variant={statusColors[status] || 'default'}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'lastAuditAt',
        header: t.lastAudit,
        cell: ({ row }) => {
          const date = row.getValue('lastAuditAt') as string | null;
          if (!date) return '-';
          return new Date(date).toLocaleDateString(locale);
        },
      },
      {
        id: 'actions',
        header: t.actions,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/poi/${row.original.id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [t, locale]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { rows } = table.getRowModel();
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t.noResults}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t.page} {table.getState().pagination.pageIndex + 1} {t.of}{' '}
          {table.getPageCount()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
