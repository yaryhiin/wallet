import { supabase } from "../supabase";
import type { Category, CategoryDB } from "../types/categories";
import { getCurrentUserId } from "./auth";

export async function getCategories(): Promise<CategoryDB[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching categorys:", error);
    throw error;
  }

  return data || [];
}

export async function createCategory(category: Category): Promise<CategoryDB> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...category, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    throw error;
  }

  return data;
}

export async function updateCategory(
  category: Category,
  categoryId: string,
): Promise<CategoryDB> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", categoryId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating category:`, error.message);
    throw error;
  }

  return data;
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) {
    console.error(`Error deleting category:`, error.message);
    return false;
  }

  return true;
}
