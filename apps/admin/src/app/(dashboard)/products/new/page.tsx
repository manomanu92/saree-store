"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "@/components/admin/ProductForm";
import { getActiveAttributeDefinitions } from "@/lib/data/attribute-definitions";

export default function NewProductPage() {
  const [types, setTypes] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState<Awaited<
    ReturnType<typeof getActiveAttributeDefinitions>
  >>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("types").select("id, name, slug").order("sort_order", { ascending: true }),
      getActiveAttributeDefinitions().catch(() => []),
    ]).then(([typesRes, defs]) => {
      setTypes((typesRes.data as { id: string; name: string; slug: string }[]) ?? []);
      setAttributeDefinitions(defs);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="text-stone-500 text-sm py-12 text-center">Loading…</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-6">New product</h1>
      <ProductForm types={types} attributeDefinitions={attributeDefinitions} attributeValues={{}} />
    </div>
  );
}
