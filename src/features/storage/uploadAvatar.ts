// enn este archivo hacemos la funcion para subir la foto del avatar a Supabase Storage,
// y también una función auxiliar para sacar la extensión de la foto a partir de su URI (jpg, png, etc.)

import { supabase } from "supabase/supabaseClient";

function getExtFromUri(uri: string) {
  // Partimos la dirección por cada punto "." para quedarnos
  // con el último trozo, que es la extensión del archivo.
  // Por ejemplo, "foto.perfil.png" → ["foto", "perfil", "png"]
  const parts = uri.split(".");

  // Tomamos el último elemento del array, que será la extensión.
  const ext = parts[parts.length - 1];

  // Lo pasamos a minúsculas para uniformidad.
  // Si por algún motivo no hubiera extensión, usamos "jpg"
  // como valor por defecto (es el formato más común de fotos).
  return ext?.toLowerCase() || "jpg";
}

// Función principal para subir la foto del avatar a Supabase Storage.
export async function uploadAvatar(uri: string, userId: string) {
  // Averiguamos la extensión de la foto (jpg, png, etc.)
  const ext = getExtFromUri(uri);

  // Construimos la ruta donde se guardará la foto dentro del bucket "avatars".
  // Usamos el userId para organizar las fotos por usuario, y un timestamp
  // para asegurarnos de que cada foto tenga un nombre único
  const path = `${userId}/${Date.now()}.${ext}`;

  // Leemos el archivo de la foto usando fetch. La URI puede ser algo
  const res = await fetch(uri);

  // Convertimos la respuesta a un array de bytes, que es el formato que Supabase Storage espera para subir archivos.
  const arrayBuffer = await res.arrayBuffer();

  // Subimos la foto a Supabase Storage usando la función "upload" del bucket "avatars".
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Si la subida fue exitosa, devolvemos la ruta donde se guardó la foto. Esta ruta se guardará en la ficha del cliente para mostrar su avatar.
  return data.path;
}
