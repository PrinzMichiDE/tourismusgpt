'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe,
  Menu,
  LogOut,
  User,
  Settings,
  Shield,
  Command,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationCenter } from './notification-center';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { KeyboardShortcuts } from '@/components/common/keyboard-shortcuts';

interface TopNavProps {
  user?: {
    name?: string | null;
    email?: string;
    image?: string | null;
    role?: string;
  };
  locale?: string;
  onMenuClick?: () => void;
}

export function TopNav({ user, locale = 'de', onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2.5 font-bold shrink-0 group"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25"
          >
            <Shield className="h-5 w-5" />
          </motion.div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-bold leading-tight">LDB-DataGuard</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Quality Assurance Platform
            </span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <motion.div
            className="relative"
            animate={{
              scale: isSearchFocused ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={locale === 'de' ? 'POIs, Regionen oder Kategorien suchen...' : 'Search POIs, regions or categories...'}
              className="pl-9 pr-20 h-10 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              data-search-input
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              <kbd className="pointer-events-none h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 flex">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </motion.div>
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Keyboard Shortcuts */}
          <KeyboardShortcuts locale={locale} />

          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={switchLocale}
            className="gap-1.5 px-2"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">{locale}</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationCenter locale={locale} />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 pl-2 pr-1 h-10 ml-1"
              >
                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                  <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium leading-none">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground leading-none mt-0.5">
                    {user?.role || 'Admin'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/dashboard/settings`}>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/dashboard/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
