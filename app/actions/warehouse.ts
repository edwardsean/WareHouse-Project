"use server";

import { createClient } from "@/lib/supabase";
import { Warehouse, WarehouseZone } from "@/types";

export async function addWarehouse(formData: FormData) {
  const supabase = await createClient();

  try {
    // Get the highest warehouse ID and increment by 1
    const { data: maxId } = await supabase
      .from("warehouse")
      .select("warehouseid")
      .order("warehouseid", { ascending: false })
      .limit(1)
      .single();

    const newWarehouseId = maxId ? maxId.warehouseid + 1 : 1;

    const { error } = await supabase.from("warehouse").insert([
      {
        warehouseid: newWarehouseId,
        warehousename: formData.get("warehousename") as string,
        status: "0", // Initialize with zero zones
        address: formData.get("address") as string,
        city: formData.get("city") as string,
      },
    ]);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

export async function addWarehouseZone(formData: FormData) {
  const supabase = await createClient();

  try {
    const warehouseId = parseInt(formData.get("warehouseid") as string);

    // Insert the new zone
    const { error: insertError } = await supabase.from("warehousezone").insert([
      {
        warehouseid: warehouseId,
        zoneid: formData.get("zoneid") as string,
        inventoryid: formData.get("inventoryid")
          ? parseInt(formData.get("inventoryid") as string)
          : null,
        quantity: formData.get("quantity")
          ? parseInt(formData.get("quantity") as string)
          : 0,
      },
    ]);

    if (insertError) {
      return { error: insertError.message };
    }

    // Count total zones for this warehouse
    const { count, error: countError } = await supabase
      .from("warehousezone")
      .select("*", { count: "exact" })
      .eq("warehouseid", warehouseId);

    if (countError) {
      return { error: countError.message };
    }

    // Update the warehouse status with the new zone count
    const { error: updateError } = await supabase
      .from("warehouse")
      .update({ status: count?.toString() || "0" })
      .eq("warehouseid", warehouseId);

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

export async function getWarehouses() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("warehouse")
      .select("*")
      .order("warehouseid");

    if (error) {
      return { error: error.message };
    }

    return { warehouses: data as Warehouse[] };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

export async function getWarehouseZones(warehouseId: number) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("warehousezone")
      .select("*")
      .eq("warehouseid", warehouseId)
      .order("zoneid");

    if (error) {
      return { error: error.message };
    }

    return { zones: data as WarehouseZone[] };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}
