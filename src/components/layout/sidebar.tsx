'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Database,
  Calendar,
  FileText,
  DollarSign,
  Mail,
  AlertCircle,
  History,
  Users,
  Settings,
  BookOpen,
  FileCode,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  locale?: string;
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: { de: string; en: string };
  badge?: number;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: { de: 'Dashboard', en: 'Dashboard' },
  },
  {
    href: '/dashboard/fields',
    icon: Database,
    label: { de: 'Datenfelder', en: 'Data Fields' },
  },
  {
    href: '/dashboard/schedules',
    icon: Calendar,
    label: { de: 'Zeitpläne', en: 'Schedules' },
  },
  {
    href: '/dashboard/reports',
    icon: FileText,
    label: { de: 'Berichte', en: 'Reports' },
  },
  {
    href: '/dashboard/costs',
    icon: DollarSign,
    label: { de: 'Kosten', en: 'Costs' },
  },
  {
    href: '/dashboard/outbox',
    icon: Mail,
    label: { de: 'E-Mail-Ausgang', en: 'Mail Outbox' },
  },
  {
    href: '/dashboard/failed-jobs',
    icon: AlertCircle,
    label: { de: 'Fehler', en: 'Failed Jobs' },
  },
  {
    href: '/dashboard/audit-trail',
    icon: History,
    label: { de: 'Protokoll', en: 'Audit Trail' },
  },
];

const adminItems: NavItem[] = [
  {
    href: '/dashboard/users',
    icon: Users,
    label: { de: 'Benutzer', en: 'Users' },
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: { de: 'Einstellungen', en: 'Settings' },
  },
];

const docsItems: NavItem[] = [
  {
    href: '/docs',
    icon: BookOpen,
    label: { de: 'Dokumentation', en: 'Documentation' },
  },
  {
    href: '/api-docs',
    icon: FileCode,
    label: { de: 'API-Docs', en: 'API Docs' },
  },
];

export function Sidebar({ isOpen = true, onClose, locale = 'de' }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === `/${locale}/dashboard`;
    }
    return pathname.startsWith(href) || pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col gap-2 p-4">
          {/* Close button (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 md:hidden"
            onClick={onClose}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Main Navigation */}
          <nav className="flex-1 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {locale === 'de' ? 'Navigation' : 'Navigation'}
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={onClose}
              >
                <item.icon className="h-4 w-4" />
                {item.label[locale as 'de' | 'en']}
                {item.badge && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Admin Section */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">
              {locale === 'de' ? 'Administration' : 'Administration'}
            </p>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={onClose}
              >
                <item.icon className="h-4 w-4" />
                {item.label[locale as 'de' | 'en']}
              </Link>
            ))}

            {/* Docs Section */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">
              {locale === 'de' ? 'Hilfe' : 'Help'}
            </p>
            {docsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={onClose}
              >
                <item.icon className="h-4 w-4" />
                {item.label[locale as 'de' | 'en']}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center">
              LDB-DataGuard v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
