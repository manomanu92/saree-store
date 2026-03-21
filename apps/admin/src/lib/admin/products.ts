import { createClient } from "@/lib/supabase/client";
import { deleteStorageKeysViaWorker, finalizeTempUploadsViaWorker } from "@/lib/storage-worker-client";
import { getActiveAttributeDefinitions } from "@/lib/data/attribute-definitions";

async function saveProductAttributeValues(
  productId: string,
  formData: FormData,
  definitions: { key: string }[]
): Promise<void> {
  const supabase = createClient();
  for (const def of definitions) {
    const raw = formData.get(`attr_${def.key}`);
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      await supabase
        .from("product_attribute_values")
        .delete()
        .eq("product_id", productId)
        .eq("attribute_key", def.key);
    } else {
      await supabase.from("product_attribute_values").upsert(
        { product_id: productId, attribute_key: def.key, value, updated_at: new Date().toISOString() },
        { onConflict: "product_id,attribute_key" }
      );
    }
  }
}

export async function createProduct(formData: FormData) {
  const supabase = createClient();
  let definitions: Awaited<ReturnType<typeof getActiveAttributeDefinitions>> = [];
  try {
    definitions = await getActiveAttributeDefinitions();
  } catch {
    // attribute_definitions table may not exist yet
  }

  const title = formData.get("title") as string;
  const slug =
    (formData.get("slug") as string) ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const typeId = (formData.get("type_id") as string) || null;
  const sku = (formData.get("sku") as string) || null;
  const priceInr = parseFloat((formData.get("price_inr") as string) || "0");
  const priceAed = parseFloat((formData.get("price_aed") as string) || "0");
  const description = (formData.get("description") as string) || null;
  const stockStatus = (formData.get("stock_status") as string) || "in_stock";
  const featured = formData.get("featured") === "on";
  const newArrival = formData.get("new_arrival") === "on";
  const showOnHomepage = formData.get("show_on_homepage") === "on";
  const attributesStr = formData.get("attributes") as string | null;
  let attributes: Record<string, string | number | boolean> = {};
  if (attributesStr?.trim()) {
    try {
      attributes = JSON.parse(attributesStr);
    } catch {
      // ignore
    }
  }

  // Get uploaded images data from FormData
  const uploadedImagesStr = formData.get("uploaded_images") as string | null;
  let uploadedImages: Array<{
    storage_key: string;
    alt_text?: string;
    is_primary: boolean;
    show_on_homepage: boolean;
  }> = [];
  if (uploadedImagesStr) {
    try {
      uploadedImages = JSON.parse(uploadedImagesStr);
    } catch {
      // ignore
    }
  }

  // Validate: require at least 1 image for submission
  if (uploadedImages.length === 0) {
    return { error: "At least one product image is required" };
  }

  // Validate required attributes before creating product
  if (definitions.length > 0) {
    for (const def of definitions) {
      if (!def.is_required) continue;
      const raw = formData.get(`attr_${def.key}`);
      const value = typeof raw === "string" ? raw.trim() : "";
      if (!value) return { error: `${def.label} is required` };
    }
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      slug,
      type_id: typeId || null,
      sku,
      price_inr: priceInr,
      price_aed: priceAed,
      description,
      stock_status: stockStatus,
      featured,
      new_arrival: newArrival,
      show_on_homepage: showOnHomepage,
      attributes,
      name: title,
      product_code: (sku?.trim() || `P-${slug}`) as string,
      status: "approved",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  const productId = data.id;

  // Link uploaded images to product
  if (uploadedImages.length > 0) {
    // Finalize temp uploads (move from temp/ to product/) via upload-signer Worker
    const tempKeys = uploadedImages.map((img) => img.storage_key);
    const keyMap = await finalizeTempUploadsViaWorker(productId, tempKeys);

    for (let i = 0; i < uploadedImages.length; i++) {
      const img = uploadedImages[i];
      const finalStorageKey = keyMap.get(img.storage_key) || img.storage_key;

      // Insert image record
      await supabase.from("product_images").insert({
        product_id: productId,
        storage_key: finalStorageKey,
        alt_text: img.alt_text || null,
        is_primary: img.is_primary,
        show_on_homepage: img.show_on_homepage,
        sort_order: i,
      });
    }
  }

  // Save attribute values
  if (definitions.length > 0) {
    await saveProductAttributeValues(productId, formData, definitions);
  }

  return { id: data.id };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createClient();
  let definitions: Awaited<ReturnType<typeof getActiveAttributeDefinitions>> = [];
  try {
    definitions = await getActiveAttributeDefinitions();
  } catch {
    // attribute_definitions table may not exist yet
  }

  if (definitions.length > 0) {
    for (const def of definitions) {
      if (!def.is_required) continue;
      const raw = formData.get(`attr_${def.key}`);
      const value = typeof raw === "string" ? raw.trim() : "";
      if (!value) return { error: `${def.label} is required` };
    }
  }

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || "";
  const typeId = (formData.get("type_id") as string) || null;
  const sku = (formData.get("sku") as string) || null;
  const priceInr = parseFloat((formData.get("price_inr") as string) || "0");
  const priceAed = parseFloat((formData.get("price_aed") as string) || "0");
  const description = (formData.get("description") as string) || null;
  const stockStatus = (formData.get("stock_status") as string) || "in_stock";
  const featured = formData.get("featured") === "on";
  const newArrival = formData.get("new_arrival") === "on";
  const showOnHomepage = formData.get("show_on_homepage") === "on";
  const attributesStr = formData.get("attributes") as string | null;
  let attributes: Record<string, string | number | boolean> = {};
  if (attributesStr?.trim()) {
    try {
      attributes = JSON.parse(attributesStr);
    } catch {
      // ignore
    }
  }
  if (definitions.length > 0) {
    attributes = {};
    for (const def of definitions) {
      const raw = formData.get(`attr_${def.key}`);
      const value = typeof raw === "string" ? raw.trim() : "";
      if (value) attributes[def.key] = value;
    }
  }

  const { error } = await supabase
    .from("products")
    .update({
      title,
      slug,
      type_id: typeId || null,
      sku,
      price_inr: priceInr,
      price_aed: priceAed,
      description,
      stock_status: stockStatus,
      featured,
      new_arrival: newArrival,
      show_on_homepage: showOnHomepage,
      attributes,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  if (definitions.length > 0) {
    await saveProductAttributeValues(id, formData, definitions);
  }
  return {};
}

export async function updateProductImageOrder(
  productId: string,
  imageIds: string[]
) {
  const supabase = createClient();
  for (let i = 0; i < imageIds.length; i++) {
    await supabase
      .from("product_images")
      .update({ sort_order: i })
      .eq("id", imageIds[i])
      .eq("product_id", productId);
  }
  return {};
}

export async function deleteProductImage(imageId: string, productId: string) {
  const supabase = createClient();
  
  // First, fetch the image record to get the storage_key
  const { data: imageRecord, error: fetchError } = await supabase
    .from("product_images")
    .select("storage_key")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();
  
  if (fetchError) {
    return { error: fetchError.message };
  }
  
  if (!imageRecord) {
    return { error: "Image not found" };
  }
  
  try {
    await deleteStorageKeysViaWorker([imageRecord.storage_key]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Storage delete failed";
    console.error(`Failed to delete storage object ${imageRecord.storage_key}:`, e);
    return { error: msg };
  }

  // Storage deletion successful, now delete DB row
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);
  
  if (error) {
    console.error(`Storage deleted but DB deletion failed for ${imageRecord.storage_key}:`, error);
    return { error: `Image file deleted but database update failed: ${error.message}` };
  }
  
  // Check if we need to assign a new primary image
  const { data: remainingImages, error: countError } = await supabase
    .from("product_images")
    .select("id, is_primary")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  
  if (!countError && remainingImages && remainingImages.length > 0) {
    // Check if any image is marked as primary
    const hasPrimary = remainingImages.some((img) => img.is_primary);
    
    if (!hasPrimary) {
      // Auto-assign first image as primary
      await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", remainingImages[0].id);
    }
  }
  
  return {};
}

/**
 * Register an image in product_images after client has uploaded directly to R2 (presigned PUT).
 * Call after the browser PUTs the file to the presigned URL.
 */
export async function registerProductImage(
  productId: string,
  storageKey: string
): Promise<{ error?: string }> {
  const supabase = createClient();

  const { data: maxOrder } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxOrder?.sort_order ?? -1) + 1;

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  const isFirst = (count ?? 0) === 0;

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_key: storageKey,
    sort_order: sortOrder,
    is_primary: isFirst,
  });

  if (error) return { error: error.message };
  return {};
}

/** Legacy server upload — disabled in static admin; use presigned PUT + registerProductImage. */
export async function uploadProductImage(_productId: string, _formData: FormData) {
  return { error: "Use the browser uploader with presigned URLs." };
}

export async function setPrimaryProductImage(imageId: string, productId: string) {
  const supabase = createClient();
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("product_id", productId);
  if (error) return { error: error.message };
  return {};
}

export async function updateProductImage(
  imageId: string,
  productId: string,
  payload: { alt_text?: string | null; show_on_homepage?: boolean }
) {
  const supabase = createClient();
  if (payload.show_on_homepage === true) {
    await supabase
      .from("product_images")
      .update({ show_on_homepage: false })
      .eq("product_id", productId);
  }
  const { error } = await supabase
    .from("product_images")
    .update(payload)
    .eq("id", imageId)
    .eq("product_id", productId);
  if (error) return { error: error.message };
  return {};
}

/** Discontinue product (soft hide from customers). */
export async function discontinueProduct(
  productId: string,
  reason: string | null
) {
  const supabase = createClient();
  const { data: row, error: fetchErr } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();
  const { error } = await supabase
    .from("products")
    .update({
      is_discontinued: true,
      discontinued_at: new Date().toISOString(),
      discontinued_reason: reason?.trim() || null,
    })
    .eq("id", productId);
  if (error) return { error: error.message };
  const slug = row ? (row as { slug?: string }).slug : undefined;
  return {};
}

/** Re-enable a discontinued product. */
export async function reEnableProduct(productId: string) {
  const supabase = createClient();
  const { data: row } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();
  const { error } = await supabase
    .from("products")
    .update({
      is_discontinued: false,
      discontinued_at: null,
      discontinued_reason: null,
    })
    .eq("id", productId);
  if (error) return { error: error.message };
  const slug = row ? (row as { slug?: string }).slug : undefined;
  return {};
}

/** Permanently delete product (admin only). Requires confirmation = product_code or "DELETE". */
export async function deleteProductPermanently(
  productId: string,
  productCode: string,
  confirmation: string
) {
  const trimmed = confirmation?.trim();
  if (trimmed !== productCode && trimmed !== "DELETE")
    return { error: "Type the product code or DELETE to confirm" };

  const supabase = createClient();
  const { data: images } = await supabase
    .from("product_images")
    .select("storage_key")
    .eq("product_id", productId);

  await supabase.from("product_drafts").delete().eq("product_id", productId);
  await supabase.from("product_attribute_values").delete().eq("product_id", productId);
  await supabase.from("product_images").delete().eq("product_id", productId);
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };

  const keys = (images ?? []).map((r) => (r as { storage_key: string }).storage_key);
  if (keys.length) {
    try {
      await deleteStorageKeysViaWorker(keys);
    } catch {
      // best-effort storage cleanup
    }
  }

  return { deleted: true };
}
