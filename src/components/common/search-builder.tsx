'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search, Filter } from 'lucide-react';

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SearchBuilderProps {
  fields: Array<{ key: string; label: string; type: 'text' | 'number' | 'select'; options?: string[] }>;
  onSearch: (query: string, filters: FilterCondition[]) => void;
  placeholder?: string;
  locale?: string;
}

export function SearchBuilder({
  fields,
  onSearch,
  placeholder,
  locale = 'de',
}: SearchBuilderProps) {
  const isGerman = locale === 'de';
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<FilterCondition[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);

  const operators = [
    { key: 'eq', label: '=' },
    { key: 'neq', label: '≠' },
    { key: 'contains', label: isGerman ? 'enthält' : 'contains' },
    { key: 'gt', label: '>' },
    { key: 'gte', label: '≥' },
    { key: 'lt', label: '<' },
    { key: 'lte', label: '≤' },
  ];

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        id: Math.random().toString(36).slice(2),
        field: fields[0]?.key || '',
        operator: 'eq',
        value: '',
      },
    ]);
    setShowFilters(true);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters(
      filters.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const clearAll = () => {
    setQuery('');
    setFilters([]);
    onSearch('', []);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || (isGerman ? 'Suchen...' : 'Search...')}
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          {isGerman ? 'Filter' : 'Filters'}
          {filters.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {filters.length}
            </Badge>
          )}
        </Button>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          {isGerman ? 'Suchen' : 'Search'}
        </Button>
      </div>

      {showFilters && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          {filters.map((filter) => (
            <div key={filter.id} className="flex gap-2 items-center">
              <select
                value={filter.field}
                onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {fields.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm w-24"
              >
                {operators.map((op) => (
                  <option key={op.key} value={op.key}>
                    {op.label}
                  </option>
                ))}
              </select>
              <Input
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                placeholder={isGerman ? 'Wert' : 'Value'}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(filter.id)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addFilter}>
              <Plus className="h-4 w-4 mr-2" />
              {isGerman ? 'Filter hinzufügen' : 'Add Filter'}
            </Button>
            {(filters.length > 0 || query) && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                {isGerman ? 'Alle löschen' : 'Clear All'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
