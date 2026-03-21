"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-stone-400 text-sm">
      Redirecting…
    </div>
  );
}
