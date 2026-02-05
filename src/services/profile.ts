import { supabase } from "supabase/supabaseClient";
import { uploadAvatar } from "src/features/storage/uploadAvatar";
import { getUserProfileById } from "src/services/auth";
import type { UserProfile } from "src/stores/userStore";

export type UploadAvatarPayload = {
  userId: string;
  fileUri: string;
  fallbackEmail?: string;
  fallbackName?: string;
};

export async function uploadUserAvatar({
  userId,
  fileUri,
  fallbackEmail = "",
  fallbackName = "",
}: UploadAvatarPayload): Promise<UserProfile> {
  // Subimos el archivo y obtenemos la ruta en el bucket
  const path = await uploadAvatar(fileUri, userId);

  // Obtenemos la URL pública del archivo subido
  const { data: publicData } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  // Forzamos cache-busting para que se vea el avatar nuevo
  const publicUrl = publicData?.publicUrl
    ? `${publicData.publicUrl}?ts=${Date.now()}`
    : null;

  // Guardamos la URL del avatar en la tabla profiles
  const { error: updateError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      avatar_url: publicUrl,
    },
    { onConflict: "id" },
  );

  // Intentamos recargar el perfil actualizado
  const profile = await getUserProfileById(userId, fallbackEmail, fallbackName);
  if (!profile) {
    // Si no hay perfil, devolvemos uno mínimo con la URL nueva
    return {
      id: userId,
      name: fallbackName || "Usuario",
      email: fallbackEmail,
      avatarUrl: publicUrl,
      roleName: "NORMAL",
    };
  }

  // Si hay perfil, reemplazamos el avatar con la URL nueva
  return {
    ...profile,
    avatarUrl: publicUrl,
  };
}
