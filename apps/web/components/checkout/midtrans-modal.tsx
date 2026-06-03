"use client";

import { useState, useEffect } from "react";
import { 
  Copy, 
  Check, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Building2,
  Wallet,
  QrCode,
  CreditCard,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MidtransModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  total: number;
  paymentMethod: {
    id: string;
    name: string;
    type: "va" | "ewallet" | "qris" | "cc";
  };
  onPaymentSuccess?: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Generate a mock VA number based on bank
const generateVANumber = (bankId: string) => {
  const prefixes: Record<string, string> = {
    "bca-va": "7770",
    "bni-va": "8810",
    "mandiri-va": "7001",
  };
  const prefix = prefixes[bankId] || "9999";
  const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, "0");
  return prefix + random;
};

const paymentIcons: Record<string, React.ReactNode> = {
  va: <Building2 className="size-5" />,
  ewallet: <Wallet className="size-5" />,
  qris: <QrCode className="size-5" />,
  cc: <CreditCard className="size-5" />,
};

export function MidtransModal({
  open,
  onOpenChange,
  orderId,
  total,
  paymentMethod,
  onPaymentSuccess,
}: MidtransModalProps) {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [status, setStatus] = useState<"pending" | "processing" | "success">("pending");
  const [vaNumber] = useState(() => generateVANumber(paymentMethod.id));

  // Countdown timer
  useEffect(() => {
    if (!open || status === "success") return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, status]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onPaymentSuccess?.();
      }, 2000);
    }, 2000);
  };

  const bankInstructions: Record<string, string[]> = {
    "bca-va": [
      "Login ke BCA Mobile atau KlikBCA",
      "Pilih menu Transfer > BCA Virtual Account",
      "Masukkan nomor Virtual Account",
      "Masukkan jumlah yang harus dibayar",
      "Ikuti instruksi untuk menyelesaikan pembayaran",
    ],
    "bni-va": [
      "Login ke BNI Mobile Banking",
      "Pilih menu Transfer > Virtual Account Billing",
      "Masukkan nomor Virtual Account",
      "Konfirmasi detail pembayaran",
      "Masukkan PIN untuk menyelesaikan",
    ],
    "mandiri-va": [
      "Login ke Livin by Mandiri",
      "Pilih menu Bayar > Multipayment",
      "Masukkan nomor Virtual Account",
      "Konfirmasi detail pembayaran",
      "Masukkan MPIN untuk menyelesaikan",
    ],
  };

  const instructions = bankInstructions[paymentMethod.id] || [
    "Buka aplikasi pembayaran Anda",
    "Masukkan detail pembayaran",
    "Konfirmasi dan selesaikan transaksi",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {/* Header with Midtrans branding */}
        <DialogHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {status === "success" ? "Pembayaran Berhasil" : "Menunggu Pembayaran"}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <ShieldCheck className="size-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-muted-foreground">
              Transaksi aman oleh Midtrans
            </span>
          </div>
        </DialogHeader>

        {status === "success" ? (
          // Success State
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Pembayaran Diterima
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Terima kasih! Pesanan Anda sedang diproses.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Order ID: {orderId}
            </p>
          </div>
        ) : status === "processing" ? (
          // Processing State
          <div className="flex flex-col items-center py-8 text-center">
            <Loader2 className="mb-4 size-12 animate-spin text-amber-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Memverifikasi Pembayaran...
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Mohon tunggu sebentar
            </p>
          </div>
        ) : (
          // Pending State - Main Content
          <>
            {/* Payment Method Badge */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-card">
                {paymentIcons[paymentMethod.type]}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {paymentMethod.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paymentMethod.type === "va" ? "Virtual Account" : 
                   paymentMethod.type === "ewallet" ? "E-Wallet" :
                   paymentMethod.type === "qris" ? "QRIS" : "Kartu Kredit"}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  Bayar sebelum
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-amber-700 dark:text-amber-300">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* VA Number / Payment Code */}
            {paymentMethod.type === "va" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Nomor Virtual Account</p>
                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <span className="font-mono text-lg font-semibold tracking-wider text-foreground">
                    {vaNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(vaNumber)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Total Pembayaran</p>
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(total)}
                </span>
                <button
                  onClick={() => handleCopy(total.toString())}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                  <Copy className="size-4" />
                  Salin
                </button>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Pastikan jumlah transfer sama persis
              </p>
            </div>

            {/* Payment Instructions */}
            <div className="rounded-lg border border-border">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <span className="text-sm font-medium text-foreground">
                  Cara Pembayaran
                </span>
                {showInstructions ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                showInstructions ? "max-h-96" : "max-h-0"
              )}>
                <div className="border-t border-border p-3">
                  <ol className="space-y-2">
                    {instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Order ID */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Order ID: <span className="font-mono">{orderId}</span>
              </p>
            </div>

            {/* Simulate Payment Button (for demo) */}
            <Button onClick={handleSimulatePayment} className="w-full">
              Simulasi Pembayaran Berhasil
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Status pembayaran akan diperbarui otomatis
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
