// Este archivo es el encargado de gestionar acciones relacionadas con el PERFIL del usuario.
// Como cambiar su nombre o subir una foto nueva.

import { supabase } from "../../supabase/supabaseClient";
import { getUserProfileById } from "./auth";
import type { UserProfile } from "../stores/userStore";
import { uploadAvatar } from "../features/storage/uploadAvatar";

// Tipos de datos para las funciones principales

// Para hacer update en el nombre
type UpdateUserNamePayload = {
  userId: string;
  fullName: string;
  fallbackEmail?: string;
};

// Para subir una nueva foto de perfil
type UploadAvatarPayload = {
  userId: string;
  fileUri: string; // Ruta de la imagen en tu móvil
  fallbackEmail?: string;
  fallbackName?: string;
};

// Función para actualizar el nombre del usuario
export async function updateUserDisplayName({
  userId,
  fullName,
  fallbackEmail = "",
}: UpdateUserNamePayload): Promise<UserProfile> {
  // 1. Limpiamos el nombre
  const nombreLimpio = fullName.trim();

  if (nombreLimpio === "") {
    throw new Error("El nombre no puede estar vacío.");
  }

  // 2. Actualizamos la tabla 'profiles'
  const updateProfiles = await supabase
    .from("profiles")
    .update({ full_name: nombreLimpio })
    .eq("id", userId);

  if (updateProfiles.error) {
    throw new Error("Error al guardar el nombre en el perfil.");
  }

  // 3. Actualizamos también el usuario de Auth (Supabase Auth)
  // Esto es para que en todos lados salga el nuevo nombre.
  const updateAuth = await supabase.auth.updateUser({
    data: { full_name: nombreLimpio },
  });

  if (updateAuth.error) {
    throw new Error("Error al actualizar el nombre en Auth.");
  }

  // 4. Volvemos a pedir el perfil completo para devolverlo actualizado
  const perfilFinal = await getUserProfileById(
    userId,
    fallbackEmail,
    nombreLimpio,
  );

  if (!perfilFinal) {
    throw new Error("Error recuperando el perfil tras actualizar.");
  }

  return perfilFinal;
}

// Función para subir una nueva foto de perfil
export async function uploadUserAvatar({
  userId,
  fileUri,
  fallbackEmail = "",
  fallbackName = "",
}: UploadAvatarPayload): Promise<UserProfile> {
  // 1. Subimos la foto al bucket de Supabase Storage
  // Esta función hace el trabajo de ficheros.
  const rutaImagen = await uploadAvatar(fileUri, userId);

  // 2. Guardamos la ruta de la imagen en la tabla 'profiles'
  const updateRes = await supabase
    .from("profiles")
    .update({ avatar_url: rutaImagen })
    .eq("id", userId);

  if (updateRes.error) {
    throw new Error("Error guardando la ruta del avatar en BD.");
  }

  // 3. Recuperamos el perfil actualizado
  const perfil = await getUserProfileById(userId, fallbackEmail, fallbackName);

  if (!perfil) {
    throw new Error("Error recuperando perfil tras subir avatar.");
  }

  // 4. TRUCO DEL ALMENDRUCO
  // Añadimos un número aleatorio al final de la URL para forzar a que el móvil no use la imagen cacheada. y así actualizarse y usar la nueva foto
  let urlFresta = perfil.avatarUrl;
  if (urlFresta) {
    const timestamp = Date.now();
    if (urlFresta.includes("?")) {
      urlFresta = `${urlFresta}&ts=${timestamp}`;
    } else {
      urlFresta = `${urlFresta}?ts=${timestamp}`;
    }
  }

  // Refrescamos el perfil con la nueva URL
  return {
    ...perfil,
    avatarUrl: urlFresta,
  };
}

// Registrar el token de Expo Push del dispositivo del usuario en su perfil
export async function registerExpoPushToken(token: string): Promise<void> {
  if (!token) return;

  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) return;

  const res = await supabase
    .from("profiles")
    .update({ expo_push_token: token })
    .eq("id", userId);

  if (res.error) {
    console.log("Error guardando expo push token:", res.error);
    throw new Error("No se pudo registrar el token de notificaciones.");
  }

  return;
}
