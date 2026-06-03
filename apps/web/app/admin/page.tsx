import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/admin/kpi-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { RecentOrders } from "@/components/admin/recent-orders";
import { TopProducts } from "@/components/admin/top-products";
import {
  Wallet,
  ShoppingBag,
  Package,
  UserPlus,
  Download,
} from "lucide-react";

const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = () => {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Selamat datang, Sari
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate()}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="size-4" />
          Export Laporan
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Pendapatan"
          value={formatIDR(48250000)}
          trend={{ value: 12 }}
          icon={<Wallet className="size-4" />}
        />
        <KpiCard
          label="Total Pesanan"
          value="342"
          trend={{ value: 8 }}
          icon={<ShoppingBag className="size-4" />}
        />
        <KpiCard
          label="Produk Aktif"
          value="89"
          icon={<Package className="size-4" />}
        />
        <KpiCard
          label="Pelanggan Baru"
          value="47"
          trend={{ value: 3 }}
          icon={<UserPlus className="size-4" />}
        />
      </div>

      {/* Sales Chart */}
      <SalesChart />

      {/* Two Column Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentOrders />
        </div>
        <div className="lg:col-span-2">
          <TopProducts />
        </div>
      </div>
    </div>
  );
}
