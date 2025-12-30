'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyboard, X } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
    action?: () => void;
  }>;
}

interface KeyboardShortcutsProps {
  locale?: string;
}

export function KeyboardShortcuts({ locale = 'de' }: KeyboardShortcutsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const isGerman = locale === 'de';

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: isGerman ? 'Navigation' : 'Navigation',
      shortcuts: [
        { keys: ['g', 'd'], description: isGerman ? 'Zum Dashboard' : 'Go to Dashboard', action: () => router.push(`/${locale}/dashboard`) },
        { keys: ['g', 'f'], description: isGerman ? 'Zu Datenfeldern' : 'Go to Fields', action: () => router.push(`/${locale}/dashboard/fields`) },
        { keys: ['g', 's'], description: isGerman ? 'Zu Zeitplänen' : 'Go to Schedules', action: () => router.push(`/${locale}/dashboard/schedules`) },
        { keys: ['g', 'r'], description: isGerman ? 'Zu Berichten' : 'Go to Reports', action: () => router.push(`/${locale}/dashboard/reports`) },
        { keys: ['g', 'c'], description: isGerman ? 'Zu Kosten' : 'Go to Costs', action: () => router.push(`/${locale}/dashboard/costs`) },
        { keys: ['g', 'u'], description: isGerman ? 'Zu Benutzern' : 'Go to Users', action: () => router.push(`/${locale}/dashboard/users`) },
      ],
    },
    {
      title: isGerman ? 'Aktionen' : 'Actions',
      shortcuts: [
        { keys: ['/'], description: isGerman ? 'Suche öffnen' : 'Open search' },
        { keys: ['n'], description: isGerman ? 'Neuer POI' : 'New POI' },
        { keys: ['Escape'], description: isGerman ? 'Schließen' : 'Close' },
      ],
    },
    {
      title: isGerman ? 'Hilfe' : 'Help',
      shortcuts: [
        { keys: ['?'], description: isGerman ? 'Tastenkürzel anzeigen' : 'Show shortcuts', action: () => setIsOpen(true) },
        { keys: ['g', 'h'], description: isGerman ? 'Zur Dokumentation' : 'Go to Docs', action: () => router.push(`/${locale}/docs`) },
      ],
    },
  ];

  // Keyboard event handler
  React.useEffect(() => {
    let keySequence: string[] = [];
    let keyTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Clear sequence after delay
      clearTimeout(keyTimer);
      keyTimer = setTimeout(() => {
        keySequence = [];
      }, 500);

      // Toggle help with ?
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Add to sequence
      keySequence.push(key);

      // Check for matches
      for (const group of shortcutGroups) {
        for (const shortcut of group.shortcuts) {
          if (
            shortcut.action &&
            shortcut.keys.length === keySequence.length &&
            shortcut.keys.every((k, i) => k.toLowerCase() === keySequence[i])
          ) {
            e.preventDefault();
            shortcut.action();
            keySequence = [];
            return;
          }
        }
      }

      // Focus search with /
      if (key === '/' && keySequence.length === 1) {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
        keySequence = [];
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keyTimer);
    };
  }, [router, locale]);

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        title={isGerman ? 'Tastenkürzel (?)' : 'Keyboard shortcuts (?)'}
      >
        <Keyboard className="h-5 w-5" />
      </Button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dialog */}
          <Card className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                {isGerman ? 'Tastenkürzel' : 'Keyboard Shortcuts'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {shortcutGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                      {group.title}
                    </h3>
                    <div className="space-y-2">
                      {group.shortcuts.map((shortcut, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1"
                        >
                          <span className="text-sm">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, keyIdx) => (
                              <React.Fragment key={keyIdx}>
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                                  {key}
                                </kbd>
                                {keyIdx < shortcut.keys.length - 1 && (
                                  <span className="text-muted-foreground">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
