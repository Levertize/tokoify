'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ProductCard, type Product } from '@/components/product-card';
import { FilterSidebar } from '@/components/explore/filter-sidebar';
import { ViewControls } from '@/components/explore/view-controls';
import { Pagination } from '@/components/explore/pagination';
import apiClient from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12;

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: loggedInUser } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);

  const searchQuery = searchParams.get('q') || '';
  const categoryQuery = searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState<string[]>(() => {
    return categoryQuery ? [categoryQuery] : [];
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [stockOnly, setStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync category state when URL search query changes
  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory([categoryQuery]);
    } else {
      setSelectedCategory([]);
    }
  }, [categoryQuery]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    async function getCategories() {
      try {
        const res: any = await apiClient.get('/categories');
        setCategoriesList(res.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    getCategories();
  }, []);

  // Fetch products when query parameters change
  useEffect(() => {
    async function getProducts() {
      setIsLoading(true);
      try {
        // Map category slug to cuid ID if selected
        let categoryId = '';
        if (selectedCategory.length > 0) {
          const matched = categoriesList.find(c => 
            c.slug === selectedCategory[0] || 
            c.name.toLowerCase().replace(/\s+/g, '-') === selectedCategory[0]
          );
          if (matched) {
            categoryId = matched.id;
          }
        }

        // Map sorting option to API params
        let apiSortBy = 'createdAt';
        let apiSortOrder = 'desc';
        if (sortBy === 'price-low') {
          apiSortBy = 'price';
          apiSortOrder = 'asc';
        } else if (sortBy === 'price-high') {
          apiSortBy = 'price';
          apiSortOrder = 'desc';
        } else if (sortBy === 'popular') {
          apiSortBy = 'soldCount';
          apiSortOrder = 'desc';
        } else if (sortBy === 'rating') {
          apiSortBy = 'rating';
          apiSortOrder = 'desc';
        }

        const params: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sortBy: apiSortBy,
          sortOrder: apiSortOrder,
        };

        if (categoryId) params.categoryId = categoryId;
        if (searchQuery) params.q = searchQuery;

        const res: any = await apiClient.get('/products', { params });
        const apiProducts = res.data || [];
        const meta = res.meta || { total: 0 };

        const formatted = apiProducts.map((p: any) => ({
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
          stock: 10,
        }));

        setProducts(formatted);
        setTotalProducts(meta.total || formatted.length);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    getProducts();
  }, [selectedCategory, priceRange, selectedRating, stockOnly, sortBy, currentPage, searchQuery, categoriesList]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const handleAddToCart = async (prod: Product) => {
    if (!loggedInUser) {
      toast.error('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.');
      router.push('/login');
      return;
    }
    try {
      const res: any = await apiClient.get(`/products/${prod.slug}`);
      const variants = res.data?.variants || [];
      if (variants.length === 0) {
        toast.error('Varian produk tidak tersedia.');
        return;
      }
      await addToCart(variants[0].id, 1);
      toast.success('Produk berhasil ditambahkan ke keranjang');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menambahkan produk ke keranjang');
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!loggedInUser) {
      toast.error('Silakan login terlebih dahulu untuk menyimpan produk.');
      router.push('/login');
      return;
    }
    try {
      const wish = isWishlisted(productId);
      await toggleWishlist(productId);
      toast.success(
        wish
          ? 'Produk dihapus dari wishlist'
          : 'Produk ditambahkan ke wishlist'
      );
    } catch (err) {
      toast.error('Gagal mengubah wishlist');
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b border-border bg-card px-4 py-8 md:px-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Jelajahi Produk
            </h1>
            <p className="mt-2 text-muted-foreground">
              Temukan produk pilihan dengan filter dan sort yang sesuai kebutuhan Anda
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="px-4 py-8 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
              {/* Sidebar */}
              <div className="hidden md:block">
                <div className="sticky top-24 space-y-6">
                  <FilterSidebar
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                    selectedRating={selectedRating}
                    onRatingChange={setSelectedRating}
                    stockOnly={stockOnly}
                    onStockOnlyChange={setStockOnly}
                  />
                </div>
              </div>

              {/* Main Area */}
              <div className="space-y-6">
                {/* View Controls */}
                <ViewControls
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  totalResults={totalProducts}
                />

                {/* Products Grid/List */}
                {isLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : products.length > 0 ? (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                        : 'space-y-4'
                    }
                  >
                    {products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={() => handleAddToCart(product)}
                        onToggleWishlist={() => handleToggleWishlist(product.id)}
                        isWishlisted={isWishlisted(product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-foreground">Produk tidak ditemukan</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Coba ubah filter atau cari produk lainnya
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 font-sans text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
