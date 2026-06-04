"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  ShoppingCart,
  Menu,
  X,
  Home,
  Grid3X3,
  User,
  Package,
  Heart,
  LogOut,
  Shirt,
  Laptop,
  Sofa,
  Dumbbell,
  Sparkles,
  Baby,
  BookOpen,
  UtensilsCrossed,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  };
  notificationCount?: number;
  cartCount?: number;
}

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/jelajahi", label: "Jelajahi" },
  { href: "/jelajahi", label: "Kategori", hasMegaMenu: true },
];

const categories = [
  { icon: Shirt, label: "Fashion", href: "/jelajahi?category=fashion", color: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
  { icon: Laptop, label: "Elektronik", href: "/jelajahi?category=elektronik", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { icon: Sofa, label: "Rumah Tangga", href: "/jelajahi?category=rumah-tangga", color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  { icon: Dumbbell, label: "Olahraga", href: "/jelajahi?category=olahraga", color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
  { icon: Sparkles, label: "Kecantikan", href: "/jelajahi?category=kecantikan", color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
  { icon: Baby, label: "Ibu & Anak", href: "/jelajahi?category=ibu-anak", color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  { icon: BookOpen, label: "Buku", href: "/jelajahi?category=buku", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  { icon: UtensilsCrossed, label: "Makanan", href: "/jelajahi?category=makanan", color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
  { icon: Package, label: "Lainnya", href: "/jelajahi?category=lainnya", color: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400" },
];

export function Navbar({
  user = {
    name: "Budi Santoso",
    email: "budi@email.com",
    initials: "BS",
  },
  notificationCount = 3,
  cartCount = 2,
}: NavbarProps) {
  const { user: loggedInUser, clearAuth } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const totalCartItems = useCartStore((state) => state.totalItems());
  const cartBadgeCount = loggedInUser ? totalCartItems : 0;

  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const mobileSuggestionsRef = React.useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const currentUser = loggedInUser
    ? {
        name: loggedInUser.name,
        email: loggedInUser.email,
        avatar: loggedInUser.avatar || undefined,
        initials: getInitials(loggedInUser.name),
      }
    : user;

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const megaMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/jelajahi?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuth();
      window.location.href = "/login";
    }
  };

  React.useEffect(() => {
    if (loggedInUser) {
      fetchCart();
      fetchWishlist();
    }
  }, [loggedInUser, fetchCart, fetchWishlist]);

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res: any = await apiClient.get(`/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res?.success && Array.isArray(res.data)) {
          setSuggestions(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const formatBadgeCount = (count: number) => {
    if (count > 99) return "99+";
    return count.toString();
  };

  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 150);
  };

  return (
    <>
      {/* Desktop & Mobile Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-300",
          isScrolled
            ? "bg-card/80 backdrop-blur-md"
            : "bg-card"
        )}
      >
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded bg-foreground">
              <span className="text-xs font-bold text-background">T</span>
            </div>
            <span className="text-xl font-semibold text-foreground">
              Tokoku
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) =>
              link.hasMegaMenu ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <button
                    className="group relative flex items-center gap-1 text-sm text-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ChevronDown className={cn(
                      "size-3.5 transition-transform duration-200",
                      isMegaMenuOpen && "rotate-180"
                    )} />
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
                  </button>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group relative text-sm text-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            )}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block relative" ref={suggestionsRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Cari produk..."
                className="h-9 w-70 rounded-full border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
              />
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-70 rounded-lg border border-border bg-card p-1 shadow-lg z-50">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                      router.push(`/jelajahi?q=${encodeURIComponent(suggestion)}`);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm rounded-md hover:bg-muted text-foreground transition-colors"
                  >
                    <Search className="mr-2 size-3.5 text-muted-foreground" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Right Icons */}
          <div className="hidden items-center gap-1 md:flex">
            {/* Notification Bell */}
            <button className="relative rounded-full p-2 text-foreground transition-colors hover:bg-muted">
              <Bell className="size-5" />
              {notificationCount > 0 && (
                <span className="absolute right-1 top-1 flex size-2 items-center justify-center rounded-full bg-destructive" />
              )}
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative rounded-full p-2 text-foreground transition-colors hover:bg-muted">
              <ShoppingCart className="size-5" />
              {cartBadgeCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                  {formatBadgeCount(cartBadgeCount)}
                </span>
              )}
            </Link>

            {/* User Avatar Dropdown or Login/Register Buttons */}
            {loggedInUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 focus:ring-offset-background">
                    <Avatar className="size-8">
                      {currentUser.avatar && <AvatarImage src={currentUser.avatar} alt={currentUser.name} />}
                      <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
                        {currentUser.initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Package className="size-4" />
                    Pesanan Saya
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="flex w-full items-center gap-2">
                      <Heart className="size-4" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Icons */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="rounded-full p-2 text-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-5" />
            </button>
            <Link href="/cart" className="relative rounded-full p-2 text-foreground transition-colors hover:bg-muted">
              <ShoppingCart className="size-5" />
              {cartBadgeCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                  {formatBadgeCount(cartBadgeCount)}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full p-2 text-foreground transition-colors hover:bg-muted"
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mega Menu Dropdown */}
        <div
          className={cn(
            "absolute left-0 right-0 top-full overflow-hidden border-b border-border bg-card transition-all duration-300 ease-out",
            isMegaMenuOpen
              ? "visible max-h-80 opacity-100"
              : "invisible max-h-0 opacity-0"
          )}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Semua Kategori</h3>
              <Link
                href="/jelajahi"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-all duration-200 hover:border-border hover:bg-muted/50"
                    onClick={() => setIsMegaMenuOpen(false)}
                  >
                    <div className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
                      category.color
                    )}>
                      <Icon className="size-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{category.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div
          className={cn(
            "overflow-hidden border-t border-border transition-all duration-300 md:hidden",
            isMobileSearchOpen ? "max-h-[300px]" : "max-h-0 border-t-0"
          )}
        >
          <div className="px-4 py-3" ref={mobileSuggestionsRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Cari produk..."
                className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
              />
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-2 rounded-lg border border-border bg-card p-1 shadow-lg z-50">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                      setIsMobileSearchOpen(false);
                      router.push(`/jelajahi?q=${encodeURIComponent(suggestion)}`);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm rounded-md hover:bg-muted text-foreground transition-colors"
                  >
                    <Search className="mr-2 size-3.5 text-muted-foreground" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "overflow-hidden border-t border-border transition-all duration-300 md:hidden",
            isMobileMenuOpen ? "max-h-96" : "max-h-0 border-t-0"
          )}
        >
          <div className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="py-3 text-sm text-foreground transition-colors hover:text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {loggedInUser ? (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    {currentUser.avatar && <AvatarImage src={currentUser.avatar} alt={currentUser.name} />}
                    <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
                      {currentUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-destructive hover:underline"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 py-3">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Masuk</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Daftar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
        <div className="flex h-16 items-center justify-around px-4">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-foreground"
          >
            <Home className="size-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href="/jelajahi"
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <Grid3X3 className="size-5" />
            <span className="text-xs">Kategori</span>
          </Link>
          <Link
            href="/cart"
            className="relative flex flex-col items-center gap-1 text-muted-foreground"
          >
            <div className="relative">
              <ShoppingCart className="size-5" />
              {cartBadgeCount > 0 && (
                <span className="absolute -right-2 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                  {cartBadgeCount}
                </span>
              )}
            </div>
            <span className="text-xs">Keranjang</span>
          </Link>
          <Link
            href="/profil"
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <User className="size-5" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-14 md:h-16" />
    </>
  );
}
