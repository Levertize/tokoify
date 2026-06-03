"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CartItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  voucherDiscount: number;
  onConfirm: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  voucherDiscount,
  onConfirm,
}: OrderSummaryProps) {
  const displayedItems = items.slice(0, 3);
  const remainingCount = items.length - 3;
  const total = subtotal + shippingCost - voucherDiscount;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Ringkasan Pesanan</h2>

      {/* Product List */}
      <div className="mt-4 space-y-3">
        {displayedItems.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="line-clamp-1 text-sm font-medium text-foreground">
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.variant} · Qty: {item.quantity}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-foreground">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <p className="text-sm text-muted-foreground">
            +{remainingCount} produk lainnya
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-border" />

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Ongkos Kirim</span>
          <span className="text-foreground">
            {shippingCost > 0 ? formatPrice(shippingCost) : "-"}
          </span>
        </div>
        {voucherDiscount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 dark:text-green-400">Diskon Voucher</span>
            <span className="text-green-600 dark:text-green-400">
              -{formatPrice(voucherDiscount)}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-border" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onConfirm}
        className="mt-6 w-full"
        size="lg"
      >
        Konfirmasi Pesanan
      </Button>
    </div>
  );
}
