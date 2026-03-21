"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<{ products: number; types: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("types").select("*", { count: "exact", head: true }),
    ]).then(([p, t]) => {
      setCounts({
        products: p.count ?? 0,
        types: t.count ?? 0,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/products"
          className="p-6 bg-white rounded-lg border border-stone-200 hover:border-stone-300 transition"
        >
          <h2 className="font-medium text-stone-900">Products</h2>
          <p className="text-2xl font-light text-stone-600 mt-1">
            {counts === null ? "…" : counts.products}
          </p>
        </Link>
        <Link
          href="/types"
          className="p-6 bg-white rounded-lg border border-stone-200 hover:border-stone-300 transition"
        >
          <h2 className="font-medium text-stone-900">Types</h2>
          <p className="text-2xl font-light text-stone-600 mt-1">
            {counts === null ? "…" : counts.types}
          </p>
        </Link>
        <Link
          href="/attributes"
          className="p-6 bg-white rounded-lg border border-stone-200 hover:border-stone-300 transition"
        >
          <h2 className="font-medium text-stone-900">Attribute definitions</h2>
          <p className="text-sm text-stone-500 mt-1">Product specs & form fields</p>
        </Link>
        <Link
          href="/settings"
          className="p-6 bg-white rounded-lg border border-stone-200 hover:border-stone-300 transition"
        >
          <h2 className="font-medium text-stone-900">Settings</h2>
          <p className="text-sm text-stone-500 mt-1">Store & site settings</p>
        </Link>
      </div>
    </div>
  );
}
