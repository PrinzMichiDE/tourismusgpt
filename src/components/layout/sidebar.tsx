'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Shield,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  isNew?: boolean;
}

interface NavSection {
  title: { de: string; en: string };
  items: NavItem[];
  collapsible?: boolean;
}

const navSections: NavSection[] = [
  {
    title: { de: 'Übersicht', en: 'Overview' },
    items: [
      {
        href: '/dashboard',
        icon: LayoutDashboard,
        label: { de: 'Dashboard', en: 'Dashboard' },
      },
    ],
  },
  {
    title: { de: 'Datenmanagement', en: 'Data Management' },
    items: [
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
    ],
  },
  {
    title: { de: 'Monitoring', en: 'Monitoring' },
    items: [
      {
        href: '/dashboard/costs',
        icon: DollarSign,
        label: { de: 'Kosten', en: 'Costs' },
        isNew: true,
      },
      {
        href: '/dashboard/outbox',
        icon: Mail,
        label: { de: 'E-Mail-Ausgang', en: 'Mail Outbox' },
        badge: 3,
      },
      {
        href: '/dashboard/failed-jobs',
        icon: AlertCircle,
        label: { de: 'Fehler', en: 'Failed Jobs' },
        badge: 2,
      },
      {
        href: '/dashboard/audit-trail',
        icon: History,
        label: { de: 'Protokoll', en: 'Audit Trail' },
      },
    ],
  },
  {
    title: { de: 'Administration', en: 'Administration' },
    collapsible: true,
    items: [
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
    ],
  },
  {
    title: { de: 'Hilfe & Support', en: 'Help & Support' },
    collapsible: true,
    items: [
      {
        href: '/docs',
        icon: BookOpen,
        label: { de: 'Dokumentation', en: 'Documentation' },
      },
      {
        href: '/api-docs',
        icon: FileCode,
        label: { de: 'API-Referenz', en: 'API Reference' },
      },
    ],
  },
];

function NavLink({
  item,
  isActive,
  onClick,
  locale,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  locale: string;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <item.icon
        className={cn(
          'h-4 w-4 transition-transform group-hover:scale-110',
          isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      <span className="flex-1">{item.label[locale as 'de' | 'en']}</span>
      {item.badge && (
        <Badge
          variant={isActive ? 'secondary' : 'destructive'}
          className="h-5 min-w-5 px-1.5 text-xs"
        >
          {item.badge}
        </Badge>
      )}
      {item.isNew && (
        <Badge className="h-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1.5">
          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
          Neu
        </Badge>
      )}
    </Link>
  );
}

function NavSectionComponent({
  section,
  locale,
  pathname,
  onItemClick,
}: {
  section: NavSection;
  locale: string;
  pathname: string;
  onItemClick?: () => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasActiveItem = section.items.some(
    (item) =>
      pathname === item.href ||
      pathname === `/${locale}${item.href}` ||
      (item.href !== '/dashboard' &&
        (pathname.startsWith(item.href) || pathname.startsWith(`/${locale}${item.href}`)))
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === `/${locale}/dashboard`;
    }
    return pathname.startsWith(href) || pathname.startsWith(`/${locale}${href}`);
  };

  React.useEffect(() => {
    if (hasActiveItem) {
      setIsExpanded(true);
    }
  }, [hasActiveItem]);

  return (
    <div className="mb-4">
      {section.collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        >
          {section.title[locale as 'de' | 'en']}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              isExpanded ? 'rotate-0' : '-rotate-90'
            )}
          />
        </button>
      ) : (
        <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title[locale as 'de' | 'en']}
        </p>
      )}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={onItemClick}
                  locale={locale}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ isOpen = true, onClose, locale = 'de' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background/95 backdrop-blur-sm transition-transform duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Close button (mobile) */}
          <div className="md:hidden flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Navigation</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            {navSections.map((section, index) => (
              <NavSectionComponent
                key={section.title.en}
                section={section}
                locale={locale}
                pathname={pathname}
                onItemClick={onClose}
              />
            ))}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Hilfe benötigt?</p>
                <p className="text-xs text-muted-foreground truncate">
                  support@ldb-dataguard.de
                </p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>LDB-DataGuard</span>
              <Badge variant="outline" className="text-xs">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
