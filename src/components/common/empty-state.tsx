'use client';

import * as React from 'react';
import { LucideIcon, FileQuestion, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface NoSearchResultsProps {
  query: string;
  onClear?: () => void;
  locale?: string;
}

export function NoSearchResults({ query, onClear, locale = 'de' }: NoSearchResultsProps) {
  const isGerman = locale === 'de';

  return (
    <EmptyState
      icon={Search}
      title={isGerman ? 'Keine Ergebnisse' : 'No Results'}
      description={
        isGerman
          ? `Keine Ergebnisse für "${query}" gefunden. Versuchen Sie einen anderen Suchbegriff.`
          : `No results found for "${query}". Try a different search term.`
      }
      action={
        onClear
          ? {
              label: isGerman ? 'Suche zurücksetzen' : 'Clear Search',
              onClick: onClear,
            }
          : undefined
      }
    />
  );
}
