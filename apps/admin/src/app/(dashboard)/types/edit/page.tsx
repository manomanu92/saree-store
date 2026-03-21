"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TypeForm } from "@/components/admin/TypeForm";

type TypeRow = {
  id: string;
  name: string;
  slug: string;
  banner_url: string | null;
  sort_order: number;
};

function EditTypePageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [type, setType] = useState<TypeRow | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setType(null);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("types")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) setType(null);
        else setType(data as TypeRow);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (type === undefined) {
    return <div className="text-stone-500 text-sm py-12 text-center">Loading…</div>;
  }
  if (!id || type === null) {
    return <div className="text-stone-600">Type not found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-6">Edit type</h1>
      <TypeForm type={type} />
    </div>
  );
}

export default function EditTypePage() {
  return (
    <Suspense
      fallback={<div className="text-stone-500 text-sm py-12 text-center">Loading…</div>}
    >
      <EditTypePageInner />
    </Suspense>
  );
}
