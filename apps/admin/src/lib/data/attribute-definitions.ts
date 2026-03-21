import { createClient } from "@/lib/supabase/client";
import type { AttributeDefinition } from "./attribute-definitions-shared";

export type { AttributeDefinition } from "./attribute-definitions-shared";
export { parseSelectOptions } from "./attribute-definitions-shared";

export async function getActiveAttributeDefinitions(): Promise<AttributeDefinition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attribute_definitions")
    .select("key, label, group, input_type, options_json, sort_order, is_active, is_required")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as AttributeDefinition[];
}

export async function getAllAttributeDefinitions(): Promise<AttributeDefinition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attribute_definitions")
    .select("key, label, group, input_type, options_json, sort_order, is_active, is_required")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as AttributeDefinition[];
}

export async function getProductAttributeSpecs(productId: string): Promise<Record<string, string>> {
  const supabase = createClient();
  const [defsRes, valuesRes] = await Promise.all([
    supabase.from("attribute_definitions").select("key, label").eq("is_active", true),
    supabase.from("product_attribute_values").select("attribute_key, value").eq("product_id", productId),
  ]);
  const defs = (defsRes.data ?? []) as { key: string; label: string }[];
  const values = (valuesRes.data ?? []) as { attribute_key: string; value: string | null }[];
  const keyToLabel = Object.fromEntries(defs.map((d) => [d.key, d.label]));
  const out: Record<string, string> = {};
  for (const row of values) {
    const v = row.value?.trim();
    if (!v) continue;
    const label = keyToLabel[row.attribute_key] ?? row.attribute_key;
    out[label] = v;
  }
  return out;
}

export async function getProductSpecsForDisplay(
  productId: string,
  productAttributes?: Record<string, string | number | boolean> | null
): Promise<Record<string, string>> {
  const fromTable = await getProductAttributeSpecs(productId);
  if (Object.keys(fromTable).length > 0) return fromTable;
  if (!productAttributes || Object.keys(productAttributes).length === 0) return {};
  const defs = await getActiveAttributeDefinitions();
  const keyToLabel = Object.fromEntries(defs.map((d) => [d.key, d.label]));
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(productAttributes)) {
    const v = val === undefined || val === null ? "" : String(val).trim();
    if (!v) continue;
    out[keyToLabel[key] ?? key] = v;
  }
  return out;
}
