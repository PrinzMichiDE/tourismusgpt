'use client';

import { useState } from 'react';
import { Search, Filter, Download, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectOption } from '@/components/ui/select';

interface Filter {
  id: string;
  label: string;
  value: string;
}

interface DataTableToolbarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  filters?: Array<{
    id: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  activeFilters?: Filter[];
  onFilterChange?: (filters: Filter[]) => void;
  isLoading?: boolean;
  actions?: React.ReactNode;
}

export function DataTableToolbar({
  searchPlaceholder = 'Suchen...',
  onSearch,
  onExport,
  onRefresh,
  filters = [],
  activeFilters = [],
  onFilterChange,
  isLoading = false,
  actions,
}: DataTableToolbarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const removeFilter = (filterId: string) => {
    onFilterChange?.(activeFilters.filter((f) => f.id !== filterId));
  };

  const clearAllFilters = () => {
    onFilterChange?.([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleSearchChange('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Filters */}
          {filters.length > 0 && (
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                  {activeFilters.length > 0 && (
                    <Badge className="ml-1 h-5 px-1.5">{activeFilters.length}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filter</h4>
                    {activeFilters.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={clearAllFilters}
                      >
                        Alle zurücksetzen
                      </Button>
                    )}
                  </div>
                  {filters.map((filter) => (
                    <div key={filter.id} className="space-y-1.5">
                      <label className="text-sm font-medium">{filter.label}</label>
                      <Select
                        value={activeFilters.find((f) => f.id === filter.id)?.value || ''}
                        onValueChange={(value) => {
                          if (value) {
                            const newFilters = activeFilters.filter(
                              (f) => f.id !== filter.id
                            );
                            newFilters.push({
                              id: filter.id,
                              label: filter.label,
                              value,
                            });
                            onFilterChange?.(newFilters);
                          } else {
                            removeFilter(filter.id);
                          }
                        }}
                        placeholder="Auswählen..."
                      >
                        {filter.options.map((option) => (
                          <SelectOption key={option.value} value={option.value}>
                            {option.label}
                          </SelectOption>
                        ))}
                      </Select>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Refresh */}
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          )}

          {/* Export */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="pl-2 pr-1 py-1 gap-1"
              >
                <span className="text-xs">
                  {filter.label}: {filter.value}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filter.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={clearAllFilters}
            >
              Alle zurücksetzen
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
