'use client';

import * as React from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  locale?: string;
}

// Mock notifications - in production, fetch from API
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Audit abgeschlossen',
    message: 'Hotel Seeblick hat einen Score von 65 - unter dem Schwellwert.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    actionUrl: '/dashboard/poi/1',
  },
  {
    id: '2',
    type: 'success',
    title: 'Bulk Import erfolgreich',
    message: '250 POIs wurden erfolgreich importiert.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'error',
    title: '3 Jobs fehlgeschlagen',
    message: 'Einige Scraping-Jobs sind fehlgeschlagen.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/dashboard/failed-jobs',
  },
  {
    id: '4',
    type: 'info',
    title: 'Geplante Wartung',
    message: 'System-Update am Sonntag 02:00-04:00 Uhr.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
];

export function NotificationCenter({ locale = 'de' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(mockNotifications);
  
  const isGerman = locale === 'de';
  const unreadCount = notifications.filter(n => !n.read).length;

  const typeConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
    error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return isGerman ? `vor ${days} Tagen` : `${days} days ago`;
    if (hours > 0) return isGerman ? `vor ${hours} Stunden` : `${hours} hours ago`;
    return isGerman ? `vor ${minutes} Minuten` : `${minutes} minutes ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isGerman ? 'Benachrichtigungen' : 'Notifications'}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute right-0 top-full mt-2 w-80 md:w-96 z-50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
              <CardTitle className="text-base">
                {isGerman ? 'Benachrichtigungen' : 'Notifications'}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  {isGerman ? 'Alle gelesen' : 'Mark all read'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {isGerman ? 'Keine Benachrichtigungen' : 'No notifications'}
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => {
                    const config = typeConfig[notification.type];
                    const Icon = config.icon;
                    
                    return (
                      <li
                        key={notification.id}
                        className={cn(
                          'border-b last:border-b-0 p-3 hover:bg-muted/50 transition-colors',
                          !notification.read && config.bg
                        )}
                      >
                        <div className="flex gap-3">
                          <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', config.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => removeNotification(notification.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  {isGerman ? 'Gelesen' : 'Mark read'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
