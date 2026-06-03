"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { AddressStep } from "@/components/checkout/address-step";
import { ShippingStep } from "@/components/checkout/shipping-step";
import { PaymentStep } from "@/components/checkout/payment-step";
import { OrderSummary } from "@/components/checkout/order-summary";
import { MidtransModal } from "@/components/checkout/midtrans-modal";

const steps = [
  { id: 1, label: "Alamat" },
  { id: 2, label: "Pengiriman" },
  { id: 3, label: "Pembayaran" },
];

const savedAddresses = [
  {
    id: "addr-1",
    label: "Rumah",
    recipientName: "Sari Indah",
    phone: "+62 812 3456 7890",
    address: "Jl. Sudirman No. 123, Kelurahan Menteng, Kecamatan Menteng, Jakarta Pusat, DKI Jakarta 10310",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Kantor",
    recipientName: "Sari Indah",
    phone: "+62 812 3456 7890",
    address: "Gedung Graha Niaga Lt. 15, Jl. Jend. Sudirman Kav. 58, Jakarta Selatan, DKI Jakarta 12190",
  },
];

const shippingOptions = [
  { id: "jne-reg", courier: "JNE", service: "REG (Reguler)", estimatedDays: "2-3 hari", price: 15000 },
  { id: "jne-yes", courier: "JNE", service: "YES (Yakin Esok Sampai)", estimatedDays: "1 hari", price: 25000 },
  { id: "jt-ez", courier: "J&T", service: "EZ (Economy)", estimatedDays: "3-4 hari", price: 12000 },
  { id: "jt-reg", courier: "J&T", service: "Regular", estimatedDays: "2-3 hari", price: 15000 },
  { id: "sicepat-reg", courier: "SiCepat", service: "REG (Reguler)", estimatedDays: "2-3 hari", price: 14000 },
  { id: "sicepat-best", courier: "SiCepat", service: "BEST (Besok Sampai Tujuan)", estimatedDays: "1 hari", price: 22000 },
];

const paymentOptions = [
  { id: "bca-va", name: "BCA Virtual Account", type: "va" as const },
  { id: "bni-va", name: "BNI Virtual Account", type: "va" as const },
  { id: "mandiri-va", name: "Mandiri Virtual Account", type: "va" as const },
  { id: "gopay", name: "GoPay", type: "ewallet" as const },
  { id: "ovo", name: "OVO", type: "ewallet" as const },
  { id: "dana", name: "DANA", type: "ewallet" as const },
];

const cartItems = [
  {
    id: "item-1",
    name: "Kemeja Linen Premium",
    variant: "Navy, L",
    quantity: 1,
    price: 389000,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop",
  },
  {
    id: "item-2",
    name: "Tas Kulit Klasik",
    variant: "Cokelat",
    quantity: 1,
    price: 599000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop",
  },
  {
    id: "item-3",
    name: "Sneakers Canvas",
    variant: "Putih, 42",
    quantity: 1,
    price: 450000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop",
  },
  {
    id: "item-4",
    name: "Topi Baseball",
    variant: "Hitam",
    quantity: 2,
    price: 150000,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&h=200&fit=crop",
  },
  {
    id: "item-5",
    name: "Kacamata Hitam",
    variant: "Classic",
    quantity: 1,
    price: 275000,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
  },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState("addr-1");
  const [selectedShipping, setSelectedShipping] = useState("jne-reg");
  const [selectedPayment, setSelectedPayment] = useState("bca-va");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderId] = useState(() => `TKK-${Date.now().toString(36).toUpperCase()}`);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shippingOptions.find((o) => o.id === selectedShipping)?.price || 0;
  const voucherDiscount = voucherApplied ? 50000 : 0;

  const handleApplyVoucher = () => {
    if (voucherCode.toLowerCase() === "diskon50k") {
      setVoucherApplied(true);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherApplied(false);
    setVoucherCode("");
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    // Redirect to success page or show success state
    window.location.href = "/";
  };

  // Get current payment method details
  const currentPaymentMethod = paymentOptions.find((o) => o.id === selectedPayment) || paymentOptions[0];
  const total = subtotal + shippingCost - voucherDiscount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
              <span className="text-sm font-bold text-background">T</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Tokoku</span>
          </Link>
          <span className="text-sm text-muted-foreground">Checkout Aman</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Stepper */}
        <div className="mb-8">
          <CheckoutStepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column - Form Steps */}
          <div className="flex-1 space-y-6 lg:w-[60%]">
            {/* Step 1: Address */}
            <div className="rounded-xl border border-border bg-card p-6">
              <AddressStep
                addresses={savedAddresses}
                selectedId={selectedAddress}
                onSelect={setSelectedAddress}
              />
            </div>

            {/* Step 2: Shipping */}
            <div className="rounded-xl border border-border bg-card p-6">
              <ShippingStep
                options={shippingOptions}
                selectedId={selectedShipping}
                onSelect={setSelectedShipping}
              />
            </div>

            {/* Step 3: Payment */}
            <div className="rounded-xl border border-border bg-card p-6">
              <PaymentStep
                options={paymentOptions}
                selectedId={selectedPayment}
                onSelect={setSelectedPayment}
                voucherCode={voucherCode}
                onVoucherChange={setVoucherCode}
                voucherApplied={voucherApplied}
                voucherDiscount={voucherDiscount}
                onApplyVoucher={handleApplyVoucher}
                onRemoveVoucher={handleRemoveVoucher}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Kembali
                </button>
              ) : (
                <div />
              )}
              {currentStep < 3 && (
                <Button onClick={handleNext}>
                  Lanjut
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-[40%]">
            <div className="lg:sticky lg:top-8">
              <OrderSummary
                items={cartItems}
                subtotal={subtotal}
                shippingCost={shippingCost}
                voucherDiscount={voucherDiscount}
                onConfirm={handleConfirm}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Midtrans Payment Modal */}
      <MidtransModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        orderId={orderId}
        total={total}
        paymentMethod={currentPaymentMethod}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
