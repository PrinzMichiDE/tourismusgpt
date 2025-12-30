'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  delay?: number;
  disabled?: boolean;
}

const variantStyles = {
  default: 'bg-card hover:bg-muted/50 border',
  primary: 'bg-primary/10 hover:bg-primary/20 border-primary/20',
  success: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20',
  warning: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20',
  danger: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
};

const iconStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
};

export function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  variant = 'default',
  delay = 0,
  disabled = false,
}: QuickActionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all',
        variantStyles[variant],
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg bg-background shadow-sm',
          iconStyles[variant]
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
    </motion.button>
  );
}
