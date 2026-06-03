"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: number;
}

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                  isCompleted && "border-foreground bg-foreground text-background",
                  isCurrent && "border-foreground bg-foreground text-background",
                  !isCompleted && !isCurrent && "border-border bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-4 h-0.5 flex-1 transition-colors",
                  isCompleted ? "bg-foreground" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
