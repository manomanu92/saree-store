"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMediaUrl } from "@/lib/media-url";

type ProductRow = {
  id: string;
  title: string;
  sku: string | null;
  price_inr: number;
  stock_status: string;
  featured: boolean;
  new_arrival: boolean;
  status?: string;
  is_discontinued?: boolean;
  types: { name?: string } | { name?: string }[] | null;
  product_images?: { storage_key: string; sort_order: number }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select(
        `
      id, slug, title, sku, price_inr, stock_status, featured, new_arrival, show_on_homepage, status, is_discontinued,
      product_images(storage_key, sort_order, is_primary, show_on_homepage),
      types(name)
    `
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts((data as ProductRow[]) ?? []));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
        <Link
          href="/products/new"
          className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded hover:bg-stone-800"
        >
          Add product
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Price (INR)</th>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Flags</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => {
              const img = p.product_images
                ?.sort((a, b) => a.sort_order - b.sort_order)
                .at(0);
              return (
                <tr key={p.id} className="border-b border-stone-100">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-stone-100 rounded overflow-hidden shrink-0">
                        {img?.storage_key ? (
                          <Image
                            src={getMediaUrl(img.storage_key)}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div>
                        <span className="font-medium text-stone-900">{p.title}</span>
                        {p.sku && <span className="block text-stone-500 text-xs">{p.sku}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-stone-600">
                    {Array.isArray(p.types)
                      ? p.types[0]?.name
                      : (p.types as { name?: string } | null)?.name ?? "—"}
                  </td>
                  <td className="p-3 text-stone-600">₹{Number(p.price_inr).toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={
                        p.stock_status === "in_stock"
                          ? "text-green-600"
                          : p.stock_status === "low_stock"
                            ? "text-amber-600"
                            : "text-red-600"
                      }
                    >
                      {p.stock_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-medium text-stone-600">{p.status ?? "—"}</span>
                    {p.is_discontinued && (
                      <span className="block text-xs text-amber-700">Discontinued</span>
                    )}
                  </td>
                  <td className="p-3">
                    {p.featured && (
                      <span className="text-xs bg-stone-200 px-1.5 py-0.5 rounded mr-1">Featured</span>
                    )}
                    {p.new_arrival && (
                      <span className="text-xs bg-stone-200 px-1.5 py-0.5 rounded">New</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/products/edit?id=${encodeURIComponent(p.id)}`}
                      className="text-stone-600 hover:text-stone-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products && products.length === 0 && (
          <p className="p-8 text-center text-stone-500">No products yet.</p>
        )}
      </div>
    </div>
  );
}
