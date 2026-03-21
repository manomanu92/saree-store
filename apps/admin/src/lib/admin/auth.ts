import { createClient } from "@/lib/supabase/client";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const password = formData.get("password") as string;
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password" };
  }

  return { ok: true as const };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return { ok: true as const };
}

export async function changePassword(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const newPassword = (formData.get("newPassword") as string)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

  if (!newPassword || newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation do not match" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
