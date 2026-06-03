"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/api";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/admin/voucher", label: "Voucher", icon: Ticket },
  { href: "/admin/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

interface AdminSidebarProps {
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export function AdminSidebar({ user = { name: "Sari Dewi", role: "Admin" } }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user: loggedInUser, clearAuth } = useAuthStore();

  const currentUser = loggedInUser
    ? {
        name: loggedInUser.name,
        role: loggedInUser.role === "admin" || loggedInUser.role === "super_admin" ? "Admin" : loggedInUser.role,
        avatar: loggedInUser.avatar || undefined,
      }
    : user;

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
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

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-[#18181B]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-white">
          <span className="text-sm font-bold text-zinc-900">T</span>
        </div>
        <span className="text-lg font-semibold text-white">Tokoku</span>
        <Badge className="ml-1 border-zinc-700 bg-zinc-800 text-xs text-zinc-400">
          Admin
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-zinc-700 text-white">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
            <p className="truncate text-xs text-zinc-500">{currentUser.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-zinc-500 hover:bg-zinc-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
