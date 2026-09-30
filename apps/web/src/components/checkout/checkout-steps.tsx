import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: 'Address' },
  { number: 2, label: 'Payment' },
  { number: 3, label: 'Confirmation' },
] as const;

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-6">
      {STEPS.map((step, index) => {
        const isActive = step.number === currentStep;
        const isComplete = step.number < currentStep;

        return (
          <div key={step.number} className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  isComplete
                    ? 'bg-forest-900 text-cream-100'
                    : isActive
                      ? 'bg-forest-900 text-cream-100'
                      : 'border border-forest-900/20 text-ink-muted'
                )}
              >
                {isComplete ? '✓' : step.number}
              </div>
              <span
                className={cn(
                  'hidden text-[10px] uppercase tracking-[0.18em] transition-colors md:inline',
                  isActive || isComplete
                    ? 'text-forest-900'
                    : 'text-ink-muted'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-6 transition-colors md:w-12',
                  isComplete ? 'bg-forest-900' : 'bg-forest-900/15'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
