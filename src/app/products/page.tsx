"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Plus, Trash2, Download } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";

type SearchResult = {
  tiktokId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  commission?: number;
  category?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  async function loadProducts() {
    const data = await apiFetch<{ products: Product[] }>("/api/products");
    setProducts(data.products);
  }

  useEffect(() => {
    loadProducts()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch() {
    setSearching(true);
    try {
      const data = await apiFetch<{ results: SearchResult[] }>(
        `/api/products/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(data.results);
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  }

  async function handleImport(tiktokId: string) {
    setImporting(tiktokId);
    try {
      await apiFetch("/api/products/import", {
        method: "POST",
        body: JSON.stringify({ tiktokId }),
      });
      await loadProducts();
      setSearchResults((prev) => prev.filter((item) => item.tiktokId !== tiktokId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setImporting(null);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("ต้องการลบสินค้านี้?")) return;

    try {
      await apiFetch(`/api/products/${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สินค้า</h1>
        <p className="text-sm text-gray-500">ค้นหาและนำเข้าสินค้าจาก TikTok</p>
      </div>

      <div className="card mb-8">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">ค้นหาสินค้า TikTok</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-10"
              placeholder="ค้นหาชื่อสินค้า หรือหมวดหมู่..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="btn-primary" disabled={searching}>
            {searching ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {searchResults.map((item) => (
              <div
                key={item.tiktokId}
                className="flex gap-4 rounded-xl border border-gray-100 p-4"
              >
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-green-600 font-semibold">
                    ฿{item.price.toLocaleString()}
                  </p>
                  {item.commission && (
                    <p className="text-xs text-gray-500">คอมมิชชั่น {item.commission}%</p>
                  )}
                  <button
                    onClick={() => handleImport(item.tiktokId)}
                    className="btn-primary mt-2 !px-3 !py-1.5 !text-xs"
                    disabled={importing === item.tiktokId}
                  >
                    <Download className="h-3 w-3" />
                    {importing === item.tiktokId ? "กำลังนำเข้า..." : "นำเข้า"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          สินค้าที่นำเข้าแล้ว ({products.length})
        </h3>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            ยังไม่มีสินค้า — ค้นหาและนำเข้าจาก TikTok ด้านบน
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 rounded-xl border border-gray-100 p-4"
              >
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm font-semibold text-green-600">
                    ฿{product.price.toLocaleString()}
                  </p>
                  {product.category && (
                    <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {product.category}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" /> ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
