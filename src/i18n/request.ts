import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from URL or default to 'de'
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const localeMatch = pathname.match(/^\/(de|en)/);
  const locale = localeMatch ? localeMatch[1] : 'de';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
