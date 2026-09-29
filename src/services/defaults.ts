import { supabase } from "../supabase";
import { defaultCategories } from "../utils/defaults";

export async function initializeUser(userId: string) {
  const { data: settings } = await supabase
    .from("user_settings")
    .select("setup_version")
    .eq("user_id", userId)
    .single();

  if (settings?.setup_version >= 1) return;

  const categories = defaultCategories.map((c) => ({ ...c, user_id: userId }));

  await supabase.from("categories").upsert(categories, {
    onConflict: "user_id,name",
    ignoreDuplicates: true,
  });

  await supabase
    .from("user_settings")
    .upsert({ user_id: userId, setup_version: 1 })
    .eq("user_id", userId);
}
