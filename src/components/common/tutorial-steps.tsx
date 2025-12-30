'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  isCompleted?: boolean;
}

interface TutorialStepsProps {
  steps: Step[];
  currentStep?: string;
  onStepClick?: (stepId: string) => void;
  onComplete?: () => void;
  className?: string;
}

export function TutorialSteps({
  steps,
  currentStep,
  onStepClick,
  onComplete,
  className,
}: TutorialStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const completedSteps = steps.filter((s) => s.isCompleted).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completedSteps} von {steps.length} abgeschlossen
        </span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.isCompleted;

          return (
            <motion.button
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                isActive
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 mt-0.5',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isActive
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground/30'
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isActive ? (
                  <CircleDot className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'font-medium text-sm',
                    isCompleted && 'text-muted-foreground line-through'
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {step.description}
                </p>
              </div>
              <ChevronRight
                className={cn(
                  'h-4 w-4 shrink-0 mt-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground/50'
                )}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Complete Button */}
      {completedSteps === steps.length && onComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button className="w-full" onClick={onComplete}>
            Tutorial abschließen
          </Button>
        </motion.div>
      )}
    </div>
  );
}
