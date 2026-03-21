"use client";

import { useEffect } from "react";

const REASON_MESSAGES: Record<string, string> = {
  no_profile_row:
    "No profile row found. The trigger may not have run, or the row was deleted. Insert one: INSERT INTO public.profiles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'YOUR_EMAIL';",
  profile_fetch_error:
    "Profile fetch failed (RLS or missing table). Check Supabase logs and RLS policies for profiles.",
  role_is_customer:
    "Your profile.role is 'customer'. Run: UPDATE public.profiles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');",
  role_is_null:
    "Your profile.role is null. Run: UPDATE public.profiles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');",
};

/** Shown when access_denied has no ?reason= (e.g. JWT app_metadata.role is not admin). */
const APP_METADATA_HINT =
  "This app checks JWT app_metadata.role. In Supabase: Authentication → Users → open your user → App metadata / Raw App Meta Data → {\"role\":\"admin\"}. If the UI has no metadata editor, use SQL on auth.users (see apps/admin/docs/ENVIRONMENT.md). Then sign out and sign back in.";

export function AdminLoginMessage({
  className,
  reason,
}: {
  className?: string;
  reason?: string;
}) {
  const detail = reason
    ? REASON_MESSAGES[reason] ?? `Server reason: ${reason}`
    : APP_METADATA_HINT;

  useEffect(() => {
    console.warn("[Admin] Access denied — reason:", reason ?? "unknown");
    console.warn("[Admin] What to do:", detail);
  }, [reason, detail]);

  return (
    <div
      role="alert"
      className={`rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 ${className ?? ""}`}
    >
      <p className="font-medium">You don’t have admin access.</p>
      <p className="mt-1 text-amber-700">
        Your account is signed in but isn’t an admin.
      </p>
      {reason && (
        <p className="mt-2 text-xs font-mono text-amber-700">
          Reason: <strong>{reason}</strong>
        </p>
      )}
      <p className="mt-2 text-xs text-amber-700 leading-relaxed">{detail}</p>
      {reason && (
        <p className="mt-2 text-xs text-amber-600">
          Open DevTools → Console for more detail (SQL hints for profile-based setups).
        </p>
      )}
    </div>
  );
}
