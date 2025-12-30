import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import '../globals.css';

export const metadata: Metadata = {
  title: 'LDB-DataGuard',
  description: 'Enterprise POI Quality Assurance Platform',
};

const locales = ['de', 'en'];

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Load messages
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="system">
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster 
              position="bottom-right" 
              richColors 
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
