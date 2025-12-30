import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Rocket, Code, FileText } from 'lucide-react';

interface DocsPageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
}

// Simple docs page - in production, use Fumadocs with MDX
export default async function DocsPage({ params }: DocsPageProps) {
  const { locale, slug } = await params;
  
  const isGerman = locale === 'de';
  
  // Determine which page to show
  const page = slug?.join('/') || 'index';
  
  const content = getDocContent(page, isGerman);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {isGerman ? 'Dokumentation' : 'Documentation'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isGerman 
              ? 'Alles was Sie über LDB-DataGuard wissen müssen' 
              : 'Everything you need to know about LDB-DataGuard'}
          </p>
        </div>
        
        {/* Navigation */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <NavCard
            href={`/${locale}/docs`}
            icon={BookOpen}
            title={isGerman ? 'Übersicht' : 'Overview'}
            active={page === 'index'}
          />
          <NavCard
            href={`/${locale}/docs/setup`}
            icon={Rocket}
            title={isGerman ? 'Setup Guide' : 'Setup Guide'}
            active={page === 'setup'}
          />
          <NavCard
            href={`/${locale}/docs/architecture`}
            icon={Code}
            title={isGerman ? 'Architektur' : 'Architecture'}
            active={page === 'architecture'}
          />
          <NavCard
            href={`/${locale}/api-docs`}
            icon={FileText}
            title="API Docs"
            active={false}
          />
        </div>
        
        {/* Content */}
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none p-8">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </CardContent>
        </Card>
        
        {/* Back to Dashboard */}
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/dashboard`}>
              ← {isGerman ? 'Zurück zum Dashboard' : 'Back to Dashboard'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function NavCard({ 
  href, 
  icon: Icon, 
  title, 
  active 
}: { 
  href: string; 
  icon: React.ElementType; 
  title: string; 
  active: boolean;
}) {
  return (
    <Link href={href}>
      <Card className={`hover:border-primary transition-colors ${active ? 'border-primary bg-primary/5' : ''}`}>
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}

function getDocContent(page: string, isGerman: boolean): string {
  const docs: Record<string, { de: string; en: string }> = {
    index: {
      de: `
        <h2>Willkommen bei LDB-DataGuard</h2>
        <p>LDB-DataGuard ist eine Enterprise-Plattform zur automatisierten Qualitätssicherung touristischer POI-Daten.</p>
        
        <h3>Hauptfunktionen</h3>
        <ul>
          <li><strong>POI-Management</strong>: Verwaltung von über 50.000 Points of Interest</li>
          <li><strong>Web-Scraping</strong>: Automatisierte Datenextraktion mit Playwright</li>
          <li><strong>Google Maps Integration</strong>: Abgleich mit Google Places API</li>
          <li><strong>KI-Audit</strong>: Semantischer Vergleich mittels OpenAI-kompatibler LLMs</li>
          <li><strong>E-Mail-Benachrichtigungen</strong>: Automatische Alerts bei Datenabweichungen</li>
        </ul>
        
        <h3>Schnellstart</h3>
        <pre><code>npm install
npm run db:migrate
npm run db:seed
npm run dev</code></pre>
        
        <h3>Standard-Login</h3>
        <p>E-Mail: <code>admin@ldb-dataguard.de</code><br>Passwort: <code>admin123</code></p>
      `,
      en: `
        <h2>Welcome to LDB-DataGuard</h2>
        <p>LDB-DataGuard is an enterprise platform for automated quality assurance of tourist POI data.</p>
        
        <h3>Key Features</h3>
        <ul>
          <li><strong>POI Management</strong>: Handle 50,000+ Points of Interest</li>
          <li><strong>Web Scraping</strong>: Automated data extraction with Playwright</li>
          <li><strong>Google Maps Integration</strong>: Sync with Google Places API</li>
          <li><strong>AI Audit</strong>: Semantic comparison using OpenAI-compatible LLMs</li>
          <li><strong>Email Notifications</strong>: Automatic alerts for data discrepancies</li>
        </ul>
        
        <h3>Quick Start</h3>
        <pre><code>npm install
npm run db:migrate
npm run db:seed
npm run dev</code></pre>
        
        <h3>Default Login</h3>
        <p>Email: <code>admin@ldb-dataguard.de</code><br>Password: <code>admin123</code></p>
      `,
    },
    setup: {
      de: `
        <h2>Setup Guide</h2>
        
        <h3>Voraussetzungen</h3>
        <ul>
          <li>Node.js 22+</li>
          <li>PostgreSQL 16+</li>
          <li>Redis 7+</li>
        </ul>
        
        <h3>1. Installation</h3>
        <pre><code>git clone https://github.com/your-org/ldb-dataguard.git
cd ldb-dataguard
npm install</code></pre>
        
        <h3>2. Umgebungsvariablen</h3>
        <pre><code>cp .env.example .env.local</code></pre>
        <p>Wichtige Variablen:</p>
        <ul>
          <li><code>DATABASE_URL</code> - PostgreSQL Connection String</li>
          <li><code>REDIS_URL</code> - Redis Connection String</li>
          <li><code>NEXTAUTH_SECRET</code> - Session Secret</li>
          <li><code>OPENAI_API_KEY</code> - API Key für KI-Funktionen</li>
        </ul>
        
        <h3>3. Datenbank</h3>
        <pre><code>npm run db:generate
npm run db:migrate
npm run db:seed</code></pre>
        
        <h3>4. Starten</h3>
        <pre><code># Entwicklungsserver
npm run dev

# Worker (separates Terminal)
npm run worker</code></pre>
        
        <h3>Docker</h3>
        <pre><code>cd docker
docker-compose up -d</code></pre>
      `,
      en: `
        <h2>Setup Guide</h2>
        
        <h3>Prerequisites</h3>
        <ul>
          <li>Node.js 22+</li>
          <li>PostgreSQL 16+</li>
          <li>Redis 7+</li>
        </ul>
        
        <h3>1. Installation</h3>
        <pre><code>git clone https://github.com/your-org/ldb-dataguard.git
cd ldb-dataguard
npm install</code></pre>
        
        <h3>2. Environment Variables</h3>
        <pre><code>cp .env.example .env.local</code></pre>
        <p>Important variables:</p>
        <ul>
          <li><code>DATABASE_URL</code> - PostgreSQL connection string</li>
          <li><code>REDIS_URL</code> - Redis connection string</li>
          <li><code>NEXTAUTH_SECRET</code> - Session secret</li>
          <li><code>OPENAI_API_KEY</code> - API key for AI features</li>
        </ul>
        
        <h3>3. Database</h3>
        <pre><code>npm run db:generate
npm run db:migrate
npm run db:seed</code></pre>
        
        <h3>4. Start</h3>
        <pre><code># Development server
npm run dev

# Worker (separate terminal)
npm run worker</code></pre>
        
        <h3>Docker</h3>
        <pre><code>cd docker
docker-compose up -d</code></pre>
      `,
    },
    architecture: {
      de: `
        <h2>Architektur</h2>
        
        <h3>Systemübersicht</h3>
        <pre><code>┌─────────────────────────────────────┐
│          Next.js Application        │
├─────────────────────────────────────┤
│  Dashboard │ API Routes │ Actions   │
├─────────────────────────────────────┤
│            Prisma ORM               │
├─────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  Workers   │
└─────────────────────────────────────┘</code></pre>
        
        <h3>Komponenten</h3>
        <table>
          <tr><th>Komponente</th><th>Technologie</th></tr>
          <tr><td>Frontend</td><td>Next.js 16, React 19, shadcn/ui</td></tr>
          <tr><td>Backend</td><td>Next.js API Routes, Server Actions</td></tr>
          <tr><td>Datenbank</td><td>PostgreSQL 16, Prisma ORM</td></tr>
          <tr><td>Queue</td><td>Redis 7, BullMQ</td></tr>
          <tr><td>Scraping</td><td>Playwright</td></tr>
          <tr><td>KI</td><td>OpenAI API (konfigurierbar)</td></tr>
        </table>
        
        <h3>Datenfluss</h3>
        <ol>
          <li>POI wird für Audit markiert</li>
          <li>Scraper crawlt Website (bis Tiefe 3)</li>
          <li>Google Places API liefert Maps-Daten</li>
          <li>KI vergleicht alle drei Quellen</li>
          <li>Bei Abweichungen: E-Mail-Benachrichtigung</li>
        </ol>
      `,
      en: `
        <h2>Architecture</h2>
        
        <h3>System Overview</h3>
        <pre><code>┌─────────────────────────────────────┐
│          Next.js Application        │
├─────────────────────────────────────┤
│  Dashboard │ API Routes │ Actions   │
├─────────────────────────────────────┤
│            Prisma ORM               │
├─────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  Workers   │
└─────────────────────────────────────┘</code></pre>
        
        <h3>Components</h3>
        <table>
          <tr><th>Component</th><th>Technology</th></tr>
          <tr><td>Frontend</td><td>Next.js 16, React 19, shadcn/ui</td></tr>
          <tr><td>Backend</td><td>Next.js API Routes, Server Actions</td></tr>
          <tr><td>Database</td><td>PostgreSQL 16, Prisma ORM</td></tr>
          <tr><td>Queue</td><td>Redis 7, BullMQ</td></tr>
          <tr><td>Scraping</td><td>Playwright</td></tr>
          <tr><td>AI</td><td>OpenAI API (configurable)</td></tr>
        </table>
        
        <h3>Data Flow</h3>
        <ol>
          <li>POI is marked for audit</li>
          <li>Scraper crawls website (depth 3)</li>
          <li>Google Places API provides Maps data</li>
          <li>AI compares all three sources</li>
          <li>On discrepancy: Email notification sent</li>
        </ol>
      `,
    },
  };
  
  return docs[page]?.[isGerman ? 'de' : 'en'] || docs.index[isGerman ? 'de' : 'en'];
}
