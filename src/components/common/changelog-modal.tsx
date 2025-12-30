'use client';

import * as React from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: Array<{
    type: 'feature' | 'improvement' | 'fix' | 'breaking';
    description: string;
  }>;
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2024-12-29',
    changes: [
      { type: 'feature', description: 'Keyboard shortcuts for navigation' },
      { type: 'feature', description: 'Notification center with real-time updates' },
      { type: 'feature', description: 'Theme switching (Light/Dark/System)' },
      { type: 'improvement', description: 'Enhanced POI comparison table' },
      { type: 'fix', description: 'Fixed cost calculation for OpenAI API' },
    ],
  },
  {
    version: '1.0.0',
    date: '2024-12-28',
    changes: [
      { type: 'feature', description: 'Initial release' },
      { type: 'feature', description: 'POI management with 50k+ support' },
      { type: 'feature', description: 'AI-powered data auditing' },
      { type: 'feature', description: 'Web scraping with Playwright' },
      { type: 'feature', description: 'Google Places integration' },
      { type: 'feature', description: 'Email notifications' },
      { type: 'feature', description: 'Cost tracking dashboard' },
    ],
  },
];

interface ChangelogModalProps {
  locale?: string;
}

export function ChangelogModal({ locale = 'de' }: ChangelogModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasNewChanges, setHasNewChanges] = React.useState(true);
  const isGerman = locale === 'de';

  const typeConfig = {
    feature: { 
      label: isGerman ? 'Neu' : 'New', 
      variant: 'default' as const,
    },
    improvement: { 
      label: isGerman ? 'Verbessert' : 'Improved', 
      variant: 'secondary' as const,
    },
    fix: { 
      label: 'Fix', 
      variant: 'outline' as const,
    },
    breaking: { 
      label: 'Breaking', 
      variant: 'destructive' as const,
    },
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewChanges(false);
    localStorage.setItem('ldb-changelog-seen', changelog[0].version);
  };

  // Check if there are unseen changes
  React.useEffect(() => {
    const seenVersion = localStorage.getItem('ldb-changelog-seen');
    setHasNewChanges(seenVersion !== changelog[0].version);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="relative gap-2"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isGerman ? "Was ist neu?" : "What's new?"}
        </span>
        {hasNewChanges && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <Card className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 shadow-xl max-h-[80vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {isGerman ? 'Was ist neu?' : "What's New?"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto p-0">
              {changelog.map((entry, idx) => (
                <div
                  key={entry.version}
                  className={`p-4 ${idx !== changelog.length - 1 ? 'border-b' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default" className="font-mono">
                      v{entry.version}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString(isGerman ? 'de-DE' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {idx === 0 && (
                      <Badge variant="secondary">{isGerman ? 'Aktuell' : 'Latest'}</Badge>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {entry.changes.map((change, changeIdx) => (
                      <li key={changeIdx} className="flex items-start gap-2">
                        <Badge
                          variant={typeConfig[change.type].variant}
                          className="text-xs shrink-0 mt-0.5"
                        >
                          {typeConfig[change.type].label}
                        </Badge>
                        <span className="text-sm">{change.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
