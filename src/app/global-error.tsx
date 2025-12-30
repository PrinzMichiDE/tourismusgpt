'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error('Global error:', error);
    
    // Send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      (window as unknown as { Sentry: { captureException: (error: Error) => void } }).Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kritischer Fehler
          </h1>
          
          <p className="text-gray-600 mb-6">
            Ein unerwarteter Fehler ist aufgetreten. Unser Team wurde benachrichtigt.
          </p>
          
          {error.digest && (
            <p className="text-xs text-gray-400 mb-4 font-mono">
              Fehler-ID: {error.digest}
            </p>
          )}
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Erneut versuchen
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              Startseite
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
