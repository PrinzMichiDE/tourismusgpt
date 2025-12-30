import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions {
  description?: string;
  duration?: number;
  id?: string;
}

/**
 * Show a toast notification
 */
export function toast(
  message: string,
  type: ToastType = 'info',
  options?: ToastOptions
) {
  const config = {
    description: options?.description,
    duration: options?.duration || 5000,
    id: options?.id,
  };

  switch (type) {
    case 'success':
      return sonnerToast.success(message, config);
    case 'error':
      return sonnerToast.error(message, config);
    case 'warning':
      return sonnerToast.warning(message, config);
    case 'loading':
      return sonnerToast.loading(message, config);
    default:
      return sonnerToast(message, config);
  }
}

/**
 * Show a promise toast
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return sonnerToast.promise(promise, messages);
}

/**
 * Dismiss a toast by ID
 */
export function dismissToast(id?: string) {
  sonnerToast.dismiss(id);
}

/**
 * Pre-configured toast functions
 */
export const notify = {
  success: (message: string, options?: ToastOptions) =>
    toast(message, 'success', options),
  
  error: (message: string, options?: ToastOptions) =>
    toast(message, 'error', options),
  
  warning: (message: string, options?: ToastOptions) =>
    toast(message, 'warning', options),
  
  info: (message: string, options?: ToastOptions) =>
    toast(message, 'info', options),
  
  loading: (message: string, options?: ToastOptions) =>
    toast(message, 'loading', options),
  
  promise: toastPromise,
  dismiss: dismissToast,

  // Specific notifications
  saved: () => toast('Änderungen gespeichert', 'success'),
  deleted: () => toast('Erfolgreich gelöscht', 'success'),
  copied: () => toast('In Zwischenablage kopiert', 'success'),
  loginSuccess: () => toast('Erfolgreich angemeldet', 'success'),
  logoutSuccess: () => toast('Erfolgreich abgemeldet', 'info'),
  networkError: () =>
    toast('Netzwerkfehler', 'error', {
      description: 'Bitte überprüfen Sie Ihre Internetverbindung.',
    }),
  serverError: () =>
    toast('Serverfehler', 'error', {
      description: 'Ein unerwarteter Fehler ist aufgetreten.',
    }),
  validationError: (message: string) =>
    toast('Validierungsfehler', 'warning', { description: message }),
  unauthorized: () =>
    toast('Nicht autorisiert', 'error', {
      description: 'Bitte melden Sie sich erneut an.',
    }),
};
