'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  formatFn = (v) => Math.round(v).toLocaleString('de-DE'),
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => formatFn(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on('change', (latest) => {
      setDisplayValue(parseFloat(latest.replace(/[^\d.-]/g, '')) || 0);
    });
  }, [display]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {formatFn(displayValue)}
    </motion.span>
  );
}

interface AnimatedPercentageProps {
  value: number;
  className?: string;
}

export function AnimatedPercentage({ value, className }: AnimatedPercentageProps) {
  return (
    <AnimatedCounter
      value={value}
      formatFn={(v) => `${Math.round(v)}%`}
      className={className}
    />
  );
}

interface AnimatedCurrencyProps {
  value: number;
  currency?: string;
  className?: string;
}

export function AnimatedCurrency({
  value,
  currency = 'EUR',
  className,
}: AnimatedCurrencyProps) {
  return (
    <AnimatedCounter
      value={value}
      formatFn={(v) =>
        new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
        }).format(v)
      }
      className={className}
    />
  );
}
