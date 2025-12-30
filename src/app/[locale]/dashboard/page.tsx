import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import DashboardLoading from './loading';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent locale={locale} />
    </Suspense>
  );
}
