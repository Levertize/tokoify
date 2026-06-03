"use client";

import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  estimatedDays: string;
  price: number;
}

interface ShippingStepProps {
  options: ShippingOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function ShippingStep({ options, selectedId, onSelect }: ShippingStepProps) {
  // Group options by courier
  const groupedOptions = options.reduce((acc, option) => {
    if (!acc[option.courier]) {
      acc[option.courier] = [];
    }
    acc[option.courier].push(option);
    return acc;
  }, {} as Record<string, ShippingOption[]>);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Pilih Pengiriman</h2>
      
      <div className="space-y-4">
        {Object.entries(groupedOptions).map(([courier, courierOptions]) => (
          <div key={courier} className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <div className="flex size-8 items-center justify-center rounded bg-muted">
                <Truck className="size-4 text-muted-foreground" />
              </div>
              {courier}
            </div>
            <div className="space-y-2 pl-10">
              {courierOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all",
                    selectedId === option.id
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : "border-border hover:border-foreground/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                        selectedId === option.id
                          ? "border-green-500 bg-green-500"
                          : "border-border"
                      )}
                    >
                      {selectedId === option.id && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{option.service}</p>
                      <p className="text-xs text-muted-foreground">
                        Estimasi {option.estimatedDays}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatPrice(option.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
