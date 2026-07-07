import { supabase } from "../services/supabase";

export const uploadToSupabase = async (file) => {
  if (!file) return null;

  const fileName =
  `${Date.now()}_${file.name}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  const { error } = await supabase.storage
    .from("lessons")
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("lessons")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
