'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Globe,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from './notification-center';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { KeyboardShortcuts } from '@/components/common/keyboard-shortcuts';

interface TopNavProps {
  user?: {
    name?: string | null;
    email?: string;
    image?: string | null;
  };
  locale?: string;
  onMenuClick?: () => void;
}

export function TopNav({ user, locale = 'de', onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const switchLocale = () => {
    const newLocale = locale === 'de' ? 'en' : 'de';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-bold">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm">
            LDB
          </div>
          <span className="hidden sm:inline-block">DataGuard</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={locale === 'de' ? 'POIs suchen...' : 'Search POIs...'}
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-search-input
            />
          </div>
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {/* Keyboard Shortcuts */}
          <KeyboardShortcuts locale={locale} />

          {/* Language Switcher */}
          <Button variant="ghost" size="icon" onClick={switchLocale}>
            <Globe className="h-5 w-5" />
            <span className="sr-only">
              {locale === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
            </span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationCenter locale={locale} />

          {/* User Menu */}
          <div className="flex items-center gap-2 pl-2 border-l ml-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-sm">
              <p className="font-medium leading-none">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
