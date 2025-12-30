'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/dashboard' }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isHome = index === 0 && showHome;

        return (
          <div key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {isHome && <Home className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="text-muted-foreground">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
