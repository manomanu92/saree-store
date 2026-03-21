"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";

export default function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ready">("loading");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const role = (session.user.app_metadata as { role?: string } | undefined)?.role;
      if (role !== "admin") {
        router.replace("/login?error=access_denied");
        return;
      }
      setUser({ id: session.user.id, email: session.user.email ?? "" });
      setState("ready");
    });
  }, [router]);

  if (state === "loading" || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500 text-sm">
        Loading…
      </div>
    );
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
