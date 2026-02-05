import { supabase } from "supabase/supabaseClient";

function getExtFromUri(uri: string) {
  // Extraemos la extensión del archivo a partir de la URI
  const parts = uri.split(".");
  const ext = parts[parts.length - 1];
  return ext?.toLowerCase() || "jpg";
}

export async function uploadAvatar(uri: string, userId: string) {
  const ext = getExtFromUri(uri);
  const path = `${userId}/${Date.now()}.${ext}`;

  // Leemos el archivo local como ArrayBuffer para subirlo
  const res = await fetch(uri);
  const arrayBuffer = await res.arrayBuffer();

  // Subimos el archivo al bucket "avatars"
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: false,
    });

  // Si Supabase devuelve error, lo propagamos
  if (error) {
    throw error;
  }

  // Devolvemos la ruta guardada en el bucket
  return data.path;
}
