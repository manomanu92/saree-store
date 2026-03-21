import { createClient } from "@/lib/supabase/client";

type InputType = "text" | "textarea" | "select";

export async function createAttributeDefinition(formData: FormData) {
  const supabase = createClient();
  const key = (formData.get("key") as string)?.trim()?.toLowerCase().replace(/\s+/g, "_");
  if (!key) return { error: "Key is required" };
  const label = (formData.get("label") as string)?.trim();
  if (!label) return { error: "Label is required" };
  const group = (formData.get("group") as string)?.trim() || "Specifications";
  const input_type = (formData.get("input_type") as InputType) || "text";
  const options_json = (formData.get("options_json") as string)?.trim() || null;
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10);
  const is_required = formData.get("is_required") === "on";

  const { error } = await supabase.from("attribute_definitions").insert({
    key,
    label,
    group,
    input_type,
    options_json,
    sort_order,
    is_active: true,
    is_required,
  });
  if (error) return { error: error.message };
  return {};
}

export async function updateAttributeDefinition(key: string, formData: FormData) {
  const supabase = createClient();
  const label = (formData.get("label") as string)?.trim();
  if (!label) return { error: "Label is required" };
  const group = (formData.get("group") as string)?.trim() || "Specifications";
  const input_type = (formData.get("input_type") as InputType) || "text";
  const options_json = (formData.get("options_json") as string)?.trim() || null;
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10);
  const is_active = formData.get("is_active") === "on";
  const is_required = formData.get("is_required") === "on";

  const { error } = await supabase
    .from("attribute_definitions")
    .update({
      label,
      group,
      input_type,
      options_json,
      sort_order,
      is_active,
      is_required,
    })
    .eq("key", key);
  if (error) return { error: error.message };
  return {};
}

export async function deleteAttributeDefinition(_key: string) {
  return {
    error:
      "Attribute definitions cannot be deleted. Disable (set Active = off) instead so existing product values are preserved.",
  };
}
