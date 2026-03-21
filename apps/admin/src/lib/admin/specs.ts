import { getProductSpecsForDisplay } from "@/lib/data/attribute-definitions";

export async function getProductSpecsForDisplayAction(
  productId: string,
  productAttributes?: Record<string, string | number | boolean> | null
): Promise<Record<string, string>> {
  return getProductSpecsForDisplay(productId, productAttributes);
}
