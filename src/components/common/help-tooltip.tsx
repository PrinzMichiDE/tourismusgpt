'use client';

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  title?: string;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HelpTooltip({
  title,
  content,
  side = 'top',
  className,
}: HelpTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6 text-muted-foreground hover:text-foreground', className)}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Hilfe</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-80">
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        <p className="text-sm text-muted-foreground">{content}</p>
      </PopoverContent>
    </Popover>
  );
}

interface FeatureHighlightProps {
  children: React.ReactNode;
  title: string;
  description: string;
  isNew?: boolean;
}

export function FeatureHighlight({
  children,
  title,
  description,
  isNew = false,
}: FeatureHighlightProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer">
          {children}
          {isNew && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{title}</h4>
            {isNew && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                Neu
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
