'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    lowestPrice: number;
    discountPercent: number;
    weight: number;
    avgRating: number;
    reviewCount: number;
    soldCount: number;
    tags: string[];
    isActive: boolean;
    category: { id: string; name: string; slug: string };
    seller: { id: string; name: string; avatar: string | null };
    images: Array<{ id: string; url: string; isPrimary: boolean }>;
    variants: Array<{
      id: string;
      sku: string;
      options: Record<string, string>;
      price: number;
      stock: number;
    }>;
  };
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp')
    .trim();
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(
    product.images.find((img) => img.isPrimary)?.url ||
      product.images[0]?.url ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
  );
  
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const activePrice = selectedVariant ? Number(selectedVariant.price) : product.basePrice;
  const activeStock = selectedVariant ? selectedVariant.stock : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Silakan pilih varian produk terlebih dahulu.');
      return;
    }
    if (activeStock === 0) {
      toast.error('Stok varian ini habis.');
      return;
    }
    
    setIsAddingToCart(true);
    setTimeout(() => {
      setIsAddingToCart(false);
      toast.success(`${product.name} (Varian: ${Object.values(selectedVariant.options).join(', ')}) ditambahkan ke keranjang!`);
    }, 800);
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Left: Gallery Column */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/20">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        
        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className={cn(
                  'relative aspect-square w-20 overflow-hidden rounded-lg border bg-slate-900/20 transition duration-150 hover:opacity-80',
                  activeImage === img.url ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-800'
                )}
              >
                <Image
                  src={img.url}
                  alt={product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Info Column */}
      <div className="flex flex-col gap-6">
        <div>
          {/* Category */}
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {product.category.name}
          </span>
          {/* Title */}
          <h1 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">
            {product.name}
          </h1>
          
          {/* Seller / Store name */}
          <p className="mt-1.5 text-sm text-slate-400">
            Penjual:{' '}
            <span className="font-semibold text-slate-200 hover:text-emerald-400 cursor-pointer">
              {product.seller.name}
            </span>
          </p>
        </div>

        {/* Rating and Sold */}
        <div className="flex items-center gap-4 text-sm border-y border-slate-800/80 py-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-100">{product.avgRating.toFixed(1)}</span>
            <span className="text-slate-500">({product.reviewCount} ulasan)</span>
          </div>
          <span className="h-4 w-px bg-slate-800" />
          <span className="text-slate-400">
            Terjual <strong className="text-slate-200">{product.soldCount}</strong> produk
          </span>
        </div>

        {/* Price Display */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">
              {formatIDR(activePrice)}
            </span>
            {product.discountPercent > 0 && selectedVariant && Number(selectedVariant.price) === product.lowestPrice && (
              <span className="text-base text-slate-500 line-through">
                {formatIDR(product.basePrice)}
              </span>
            )}
            {product.discountPercent > 0 && selectedVariant && Number(selectedVariant.price) === product.lowestPrice && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-bold text-emerald-400">
                Diskon {product.discountPercent}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Harga belum termasuk ongkir</p>
        </div>

        {/* Variant Selector */}
        {product.variants.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Pilih Varian:</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const optionsString = Object.entries(v.options)
                  .map(([key, val]) => `${key}: ${val}`)
                  .join(', ');

                return (
                  <button
                    key={v.id}
                    onClick={() => handleVariantSelect(v)}
                    className={cn(
                      'rounded-xl border px-4 py-2.5 text-xs font-medium transition duration-200 text-left',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400'
                        : 'border-slate-800 bg-slate-900/20 text-slate-300 hover:border-slate-700'
                    )}
                  >
                    <div>{optionsString}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{formatIDR(Number(v.price))}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity & Stock */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Jumlah:</h3>
            <span className="text-xs text-slate-500">
              Stok Tersedia:{' '}
              <strong className={cn(activeStock < 5 ? 'text-amber-500' : 'text-slate-300')}>
                {activeStock}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quantity Counter */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/40 px-2 py-1">
              <button
                type="button"
                disabled={quantity <= 1 || activeStock === 0}
                onClick={() => setQuantity(quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-semibold text-slate-100">
                {activeStock === 0 ? 0 : quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= activeStock || activeStock === 0}
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                +
              </button>
            </div>

            {/* Total Weight Info */}
            <span className="text-xs text-slate-500">
              Total Berat: {((product.weight * quantity) / 1000).toFixed(2)} kg
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-slate-900">
          <button
            type="button"
            disabled={activeStock === 0 || isAddingToCart}
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/10 transition duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isAddingToCart ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Tambah ke Keranjang
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              toast.success(isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist');
            }}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl border transition duration-200 active:scale-[0.95]',
              isWishlisted
                ? 'border-red-500 bg-red-500/10 text-red-500'
                : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700 hover:text-white'
            )}
            aria-label="Wishlist"
          >
            <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-900/20 border border-slate-850 p-4 mt-2 text-center text-[10px] text-slate-400">
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Garansi Orisinal</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Truck className="h-4 w-4 text-emerald-400" />
            <span>Bisa COD</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <RotateCcw className="h-4 w-4 text-emerald-400" />
            <span>7 Hari Retur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
