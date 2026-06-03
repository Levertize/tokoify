"use client";

import { useState } from "react";
import { Building2, Wallet, QrCode, CreditCard, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PaymentOption {
  id: string;
  name: string;
  type: "va" | "ewallet" | "qris" | "card";
}

interface PaymentStepProps {
  options: PaymentOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  voucherCode: string;
  onVoucherChange: (code: string) => void;
  voucherApplied: boolean;
  voucherDiscount: number;
  onApplyVoucher: () => void;
  onRemoveVoucher: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function PaymentStep({
  options,
  selectedId,
  onSelect,
  voucherCode,
  onVoucherChange,
  voucherApplied,
  voucherDiscount,
  onApplyVoucher,
  onRemoveVoucher,
}: PaymentStepProps) {
  const [activeTab, setActiveTab] = useState("va");

  const vaOptions = options.filter((o) => o.type === "va");
  const ewalletOptions = options.filter((o) => o.type === "ewallet");

  const renderOptions = (paymentOptions: PaymentOption[]) => (
    <div className="mt-4 space-y-2">
      {paymentOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
            selectedId === option.id
              ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
              : "border-border hover:border-foreground/20"
          )}
        >
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
          <div className="flex size-8 items-center justify-center rounded bg-muted">
            <Building2 className="size-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">{option.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Metode Pembayaran</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="va" className="flex-1 gap-1.5">
            <Building2 className="size-3.5" />
            <span className="hidden sm:inline">Virtual Account</span>
            <span className="sm:hidden">VA</span>
          </TabsTrigger>
          <TabsTrigger value="ewallet" className="flex-1 gap-1.5">
            <Wallet className="size-3.5" />
            E-Wallet
          </TabsTrigger>
          <TabsTrigger value="qris" className="flex-1 gap-1.5">
            <QrCode className="size-3.5" />
            QRIS
          </TabsTrigger>
          <TabsTrigger value="card" className="flex-1 gap-1.5">
            <CreditCard className="size-3.5" />
            <span className="hidden sm:inline">Kartu Kredit</span>
            <span className="sm:hidden">Kartu</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="va">{renderOptions(vaOptions)}</TabsContent>
        <TabsContent value="ewallet">{renderOptions(ewalletOptions)}</TabsContent>
        <TabsContent value="qris">
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8">
            <QrCode className="size-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              QR Code akan ditampilkan setelah konfirmasi
            </p>
          </div>
        </TabsContent>
        <TabsContent value="card">
          <div className="mt-4 space-y-3">
            <Input placeholder="Nomor Kartu" />
            <div className="flex gap-3">
              <Input placeholder="MM/YY" className="flex-1" />
              <Input placeholder="CVV" className="flex-1" />
            </div>
            <Input placeholder="Nama pada Kartu" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Voucher Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Kode Voucher</h3>
        
        {voucherApplied ? (
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Voucher diterapkan: {formatPrice(voucherDiscount)} diskon
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveVoucher}
              className="text-green-600 hover:text-green-700 dark:text-green-400"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kode voucher"
              value={voucherCode}
              onChange={(e) => onVoucherChange(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={onApplyVoucher}
              disabled={!voucherCode}
            >
              Gunakan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
