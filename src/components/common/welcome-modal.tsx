'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  MapPin,
  BarChart3,
  Mail,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface WelcomeModalProps {
  onComplete?: () => void;
}

const steps = [
  {
    icon: Shield,
    title: 'Willkommen bei LDB-DataGuard',
    description:
      'Ihre Plattform für automatisierte Qualitätssicherung touristischer POI-Daten.',
    features: [
      'Über 50.000 POIs in Schleswig-Holstein',
      'KI-gestützte Datenvalidierung',
      'Automatische Benachrichtigungen',
    ],
  },
  {
    icon: MapPin,
    title: 'POI-Verwaltung',
    description:
      'Verwalten Sie Points of Interest mit detaillierten Informationen.',
    features: [
      'Import aus verschiedenen Quellen',
      'Schema.org-konforme Datenfelder',
      'Bulk-Operationen für große Datenmengen',
    ],
  },
  {
    icon: BarChart3,
    title: 'Qualitäts-Audits',
    description:
      'Überprüfen Sie die Datenqualität automatisch gegen Web-Quellen.',
    features: [
      'Website-Scraping mit Deep Crawl',
      'Google Maps Integration',
      'Semantischer KI-Vergleich',
    ],
  },
  {
    icon: Mail,
    title: 'Automatische Benachrichtigungen',
    description: 'Informieren Sie Verantwortliche über Diskrepanzen.',
    features: [
      'E-Mail-Templates in DE/EN',
      'Spam-Schutz & Deduplizierung',
      'Konfigurierbare Trigger-Regeln',
    ],
  },
];

export function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('ldb-welcome-seen', false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, [hasSeenWelcome]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setHasSeenWelcome(true);
    setIsOpen(false);
    onComplete?.();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Progress */}
          <div className="flex gap-1 p-4 bg-muted/50">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                <StepIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
              <p className="text-muted-foreground mb-6">{step.description}</p>
              <ul className="text-left space-y-3">
                {step.features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t bg-muted/30">
            <Button variant="ghost" onClick={handleSkip}>
              Überspringen
            </Button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Zurück
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  'Loslegen'
                ) : (
                  <>
                    Weiter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
