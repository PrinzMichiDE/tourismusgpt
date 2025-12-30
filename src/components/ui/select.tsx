'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

interface SelectOptionProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export function Select({
  value,
  onValueChange,
  children,
  placeholder = 'Select...',
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<string>('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isOpen && 'ring-2 ring-ring ring-offset-2'
          )}
        >
          <span className={cn(!value && 'text-muted-foreground')}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
            {React.Children.map(children, (child) => {
              if (React.isValidElement<SelectOptionProps>(child)) {
                return React.cloneElement(child, {
                  ...child.props,
                  // @ts-ignore
                  onSelect: (label: string) => setSelectedLabel(label),
                });
              }
              return child;
            })}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectOption({
  value,
  children,
  disabled = false,
  ...props
}: SelectOptionProps & { onSelect?: (label: string) => void }) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectOption must be used within Select');

  const isSelected = context.value === value;

  // Set initial label
  React.useEffect(() => {
    if (isSelected && (props as any).onSelect) {
      (props as any).onSelect(children?.toString() || '');
    }
  }, [isSelected]);

  const handleClick = () => {
    if (disabled) return;
    context.onValueChange?.(value);
    context.setIsOpen(false);
    if ((props as any).onSelect) {
      (props as any).onSelect(children?.toString() || '');
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        disabled && 'pointer-events-none opacity-50',
        isSelected && 'bg-accent'
      )}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </button>
  );
}

export function SelectGroup({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div>
      {label && (
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
