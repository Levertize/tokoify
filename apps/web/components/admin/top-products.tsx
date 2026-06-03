"use client";

import Image from "next/image";

const products = [
  {
    rank: 1,
    name: "Kemeja Linen Premium",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop",
    sold: 127,
    revenue: 15875000,
    maxRevenue: 15875000,
  },
  {
    rank: 2,
    name: "Tas Kulit Vintage",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop",
    sold: 89,
    revenue: 12460000,
    maxRevenue: 15875000,
  },
  {
    rank: 3,
    name: "Sneakers Putih Classic",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop",
    sold: 76,
    revenue: 9880000,
    maxRevenue: 15875000,
  },
  {
    rank: 4,
    name: "Celana Chino Slim",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100&h=100&fit=crop",
    sold: 64,
    revenue: 7680000,
    maxRevenue: 15875000,
  },
  {
    rank: 5,
    name: "Jam Tangan Minimalis",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100&h=100&fit=crop",
    sold: 52,
    revenue: 6760000,
    maxRevenue: 15875000,
  },
];

const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function TopProducts() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div>
        <h3 className="text-base font-medium text-foreground">Produk Terlaris</h3>
        <p className="text-sm text-muted-foreground">Top 5 produk bulan ini</p>
      </div>
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <div key={product.rank} className="flex items-center gap-3">
            <span className="w-5 text-center text-sm font-medium text-muted-foreground">
              {product.rank}
            </span>
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {product.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {product.sold} terjual
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{
                    width: `${(product.revenue / product.maxRevenue) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
