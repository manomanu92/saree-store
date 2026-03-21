import { createClient } from "@/lib/supabase/client";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
};

export async function getSession(): Promise<SessionUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") return null;

  return {
    id: user.id,
    email: user.email || "",
    role: "admin",
  };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}
