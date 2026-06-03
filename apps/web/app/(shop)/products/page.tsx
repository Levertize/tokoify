import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Navbar } from '@/components/navbar';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

async function fetchProducts(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const url = `http://localhost:3001/api/v1/products?${query}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal memuat produk');
    return await res.json();
  } catch (err) {
    console.error('Fetch products error:', err);
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

async function fetchCategories() {
  const url = 'http://localhost:3001/api/v1/categories';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal memuat kategori');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Fetch categories error:', err);
    return [];
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Format params for API call
  const queryParams: Record<string, string> = {
    page: resolvedParams.page || '1',
    limit: resolvedParams.limit || '12',
    sortBy: resolvedParams.sortBy || 'createdAt',
    sortOrder: resolvedParams.sortOrder || 'desc',
  };
  
  if (resolvedParams.categoryId) queryParams.categoryId = resolvedParams.categoryId;
  if (resolvedParams.minPrice) queryParams.minPrice = resolvedParams.minPrice;
  if (resolvedParams.maxPrice) queryParams.maxPrice = resolvedParams.maxPrice;
  if (resolvedParams.q) queryParams.q = resolvedParams.q;

  // Parallel fetch products and categories
  const [productsData, categories] = await Promise.all([
    fetchProducts(queryParams),
    fetchCategories(),
  ]);

  const productsList = productsData.data || [];
  const meta = productsData.meta || { page: 1, limit: 12, total: 0, totalPages: 1 };

  // Map API products to ProductCard props format
  const formattedProducts = productsList.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category?.name || 'Umum',
    price: p.lowestPrice,
    originalPrice: p.basePrice,
    discountPercent: p.discountPercent,
    imageUrl: p.primaryImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    avgRating: p.avgRating || 0,
    reviewCount: p.reviewCount || 0,
    stock: 10, // Default fallback
  }));

  // Build helper to generate URLs for query parameters
  const getFilterUrl = (newParams: Record<string, string | null>) => {
    const nextParams = { ...resolvedParams, ...newParams };
    const search = new URLSearchParams();
    
    Object.entries(nextParams).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        search.set(key, val);
      }
    });
    
    return `/products?${search.toString()}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Top Bar / Search and Breadcrumbs */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Katalog Produk</h1>
              <p className="mt-1 text-sm text-slate-400">Temukan barang impian Anda dengan harga terbaik</p>
            </div>
            
            {/* Search Form */}
            <form action="/products" method="GET" className="relative flex w-full max-w-md items-center gap-2">
              {resolvedParams.categoryId && (
                <input type="hidden" name="categoryId" value={resolvedParams.categoryId} />
              )}
              {resolvedParams.sortBy && (
                <input type="hidden" name="sortBy" value={resolvedParams.sortBy} />
              )}
              {resolvedParams.sortOrder && (
                <input type="hidden" name="sortOrder" value={resolvedParams.sortOrder} />
              )}
              <input
                type="text"
                name="q"
                defaultValue={resolvedParams.q || ''}
                placeholder="Cari sepatu, kemeja, celana..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition duration-150 hover:brightness-110"
              >
                Cari
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            
            {/* Filters Sidebar */}
            <aside className="space-y-6">
              {/* Category Filter */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Kategori</h3>
                <div className="space-y-2 text-sm">
                  <Link
                    href="/products"
                    className={`block py-1 hover:text-emerald-400 transition ${
                      !resolvedParams.categoryId ? 'text-emerald-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Semua Kategori
                  </Link>
                  
                  {categories.map((cat: any) => (
                    <div key={cat.id} className="space-y-1">
                      <Link
                        href={getFilterUrl({ categoryId: cat.id, page: '1' })}
                        className={`block py-1 hover:text-emerald-400 transition ${
                          resolvedParams.categoryId === cat.id ? 'text-emerald-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {cat.name}
                      </Link>
                      
                      {/* Render child categories */}
                      {cat.children && cat.children.length > 0 && (
                        <div className="pl-4 space-y-1 border-l border-slate-800">
                          {cat.children.map((sub: any) => (
                            <Link
                              key={sub.id}
                              href={getFilterUrl({ categoryId: sub.id, page: '1' })}
                              className={`block text-xs py-1 hover:text-emerald-400 transition ${
                                resolvedParams.categoryId === sub.id ? 'text-emerald-400 font-bold' : 'text-slate-400'
                              }`}
                            >
                              {sub.name} ({sub.productCount || 0})
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter Form */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Filter Harga</h3>
                <form action="/products" method="GET" className="space-y-3">
                  {resolvedParams.categoryId && (
                    <input type="hidden" name="categoryId" value={resolvedParams.categoryId} />
                  )}
                  {resolvedParams.q && (
                    <input type="hidden" name="q" value={resolvedParams.q} />
                  )}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Harga Min</label>
                    <input
                      type="number"
                      name="minPrice"
                      defaultValue={resolvedParams.minPrice || ''}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Harga Maks</label>
                    <input
                      type="number"
                      name="maxPrice"
                      defaultValue={resolvedParams.maxPrice || ''}
                      placeholder="9999999"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 text-xs font-bold transition duration-150"
                  >
                    Terapkan
                  </button>
                </form>
              </div>
            </aside>

            {/* Product Grid Area */}
            <main className="lg:col-span-3 space-y-6">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/20 px-6 py-4">
                <span className="text-sm text-slate-400">
                  Menampilkan <strong className="text-white">{productsList.length}</strong> dari{' '}
                  <strong className="text-white">{meta.total}</strong> produk
                </span>
                
                {/* Sorting options */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Urutkan:</span>
                  <select
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split(':');
                      if (sortBy && sortOrder) {
                        window.location.href = getFilterUrl({ sortBy, sortOrder, page: '1' });
                      }
                    }}
                    value={`${resolvedParams.sortBy || 'createdAt'}:${resolvedParams.sortOrder || 'desc'}`}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  >
                    <option value="createdAt:desc">Terbaru</option>
                    <option value="price:asc">Harga Terendah</option>
                    <option value="price:desc">Harga Tertinggi</option>
                    <option value="rating:desc">Rating Tertinggi</option>
                    <option value="soldCount:desc">Terlaris</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {formattedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-16 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-12 w-12 text-slate-600 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                  </svg>
                  <h3 className="text-lg font-bold text-slate-300">Produk Tidak Ditemukan</h3>
                  <p className="mt-1 text-sm text-slate-500">Coba ganti kata kunci atau filter pencarian Anda</p>
                  <Link
                    href="/products"
                    className="mt-6 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
                  >
                    Reset Semua Filter
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {formattedProducts.map((p: any) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onAddToCart={() => console.log('Add to cart:', p.id)}
                      onToggleWishlist={() => console.log('Toggle wishlist:', p.id)}
                      isWishlisted={false}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  {/* Prev */}
                  {meta.page > 1 && (
                    <Link
                      href={getFilterUrl({ page: String(meta.page - 1) })}
                      className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold hover:border-slate-700 transition"
                    >
                      Sebelumnya
                    </Link>
                  )}
                  
                  {/* Page numbers */}
                  {Array.from({ length: meta.totalPages }).map((_, i) => {
                    const pNum = String(i + 1);
                    const isActivePage = meta.page === i + 1;
                    return (
                      <Link
                        key={pNum}
                        href={getFilterUrl({ page: pNum })}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                          isActivePage
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/10'
                            : 'border border-slate-800 bg-slate-900/20 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {pNum}
                      </Link>
                    );
                  })}

                  {/* Next */}
                  {meta.page < meta.totalPages && (
                    <Link
                      href={getFilterUrl({ page: String(meta.page + 1) })}
                      className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold hover:border-slate-700 transition"
                    >
                      Selanjutnya
                    </Link>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
