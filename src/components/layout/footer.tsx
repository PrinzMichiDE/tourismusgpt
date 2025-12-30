'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export function Footer() {
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const isGerman = locale === 'de';

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} LDB-DataGuard. {isGerman ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
        </p>
        <nav className="flex items-center gap-4 text-sm">
          <Link 
            href={`/${locale}/impressum`} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isGerman ? 'Impressum' : 'Legal Notice'}
          </Link>
          <Link 
            href={`/${locale}/datenschutz`} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isGerman ? 'Datenschutz' : 'Privacy Policy'}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
