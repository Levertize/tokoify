"use client";

import { Plus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

interface AddressStepProps {
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function AddressStep({ addresses, selectedId, onSelect }: AddressStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Alamat Pengiriman</h2>
      
      <div className="space-y-3">
        {addresses.map((address) => (
          <button
            key={address.id}
            type="button"
            onClick={() => onSelect(address.id)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-all",
              selectedId === address.id
                ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                : "border-border hover:border-foreground/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                  selectedId === address.id
                    ? "border-green-500 bg-green-500"
                    : "border-border"
                )}
              >
                {selectedId === address.id && (
                  <div className="size-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{address.recipientName}</span>
                  {address.isDefault && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      Utama
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
                <p className="text-sm text-foreground">{address.address}</p>
              </div>
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full border-dashed border-border hover:border-foreground/30"
      >
        <Plus className="size-4" />
        Tambah Alamat Baru
      </Button>
    </div>
  );
}
