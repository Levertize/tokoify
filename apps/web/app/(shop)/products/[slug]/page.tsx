import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { ProductDetailClient } from '@/components/product-detail-client';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchProduct(slug: string) {
  const url = `http://localhost:3001/api/v1/products/${slug}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Gagal memuat detail produk');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Fetch product detail error:', err);
    return null;
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-450 border-b border-slate-900 pb-4">
            <Link href="/" className="hover:text-emerald-400 transition">
              Home
            </Link>
            <span className="text-slate-650">/</span>
            <Link href="/products" className="hover:text-emerald-400 transition">
              Produk
            </Link>
            <span className="text-slate-650">/</span>
            <Link
              href={`/products?categoryId=${product.category.id}`}
              className="hover:text-emerald-400 transition"
            >
              {product.category.name}
            </Link>
            <span className="text-slate-650">/</span>
            <span className="text-slate-300 truncate max-w-[200px]">{product.name}</span>
          </div>

          {/* Interactive Client Section */}
          <ProductDetailClient product={product} />

          {/* Description Section */}
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/10 p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-800">
              Deskripsi Produk
            </h2>
            <div
              className="prose prose-invert prose-sm max-w-none text-slate-350 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
