"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const orders = [
  {
    id: "ORD-2024-1247",
    customer: "Budi Santoso",
    total: 1250000,
    status: "dibayar",
    date: "28 Des 2024",
  },
  {
    id: "ORD-2024-1246",
    customer: "Dewi Lestari",
    total: 875000,
    status: "diproses",
    date: "28 Des 2024",
  },
  {
    id: "ORD-2024-1245",
    customer: "Ahmad Fauzi",
    total: 2340000,
    status: "dikirim",
    date: "27 Des 2024",
  },
  {
    id: "ORD-2024-1244",
    customer: "Siti Nurhaliza",
    total: 560000,
    status: "selesai",
    date: "27 Des 2024",
  },
  {
    id: "ORD-2024-1243",
    customer: "Rudi Hartono",
    total: 1890000,
    status: "dibayar",
    date: "26 Des 2024",
  },
];

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  dibayar: {
    label: "Dibayar",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  diproses: {
    label: "Diproses",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  dikirim: {
    label: "Dikirim",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  selesai: {
    label: "Selesai",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
};

const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function RecentOrders() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-foreground">Pesanan Terbaru</h3>
          <p className="text-sm text-muted-foreground">5 pesanan terakhir</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-medium text-muted-foreground">No. Order</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Pelanggan</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Total</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Tanggal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/30">
              <TableCell className="text-sm font-medium text-foreground">
                {order.id}
              </TableCell>
              <TableCell className="text-sm text-foreground">{order.customer}</TableCell>
              <TableCell className="text-sm text-foreground">
                {formatIDR(order.total)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    statusConfig[order.status].className
                  )}
                >
                  {statusConfig[order.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {order.date}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
