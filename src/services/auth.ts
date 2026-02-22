// Aquí tenemos todas las funciones relacionadas con la autenticación

import { supabase } from "../../supabase/supabaseClient";
import { sendNewClientNotification } from "./notifications";
import { type RoleName, type UserProfile } from "../stores/userStore";

// Cuando iniciamos sesión, devolvemos esto:
export type AuthResult = {
  user: UserProfile; // La ficha completa del usuario
};

// Cuando nos registramos, devolvemos esto:
export type SignUpResult = {};

// Funcion para crar un avatar por defecto usando la primera letra del nombre
function buildDefaultAvatar(name: string) {
  const cleanName = name.trim();

  let initial = "";
  if (cleanName.length > 0) {
    initial = cleanName[0]; // Cogemos la primera letra del nombre
  }

  // Construimos la URL mágica usando una herramienta llamada "ui-avatars" que genera avatares con letras
  return `https://ui-avatars.com/api/?background=E5E7EB&color=111827&size=256&name=${encodeURIComponent(initial)}`;
}

// Función para normalizar el rol del usuario, asegurando que siempre sea "SUPERVISOR" o "NORMAL"
function normalizarRol(rolSucio: any): RoleName {
  if (typeof rolSucio === "string") {
    const rolMayus = rolSucio.toUpperCase();

    if (rolMayus === "SUPERVISOR") {
      return "SUPERVISOR";
    }
  }

  // Si no es supervisor (o es null), por defecto es NORMAL.
  return "NORMAL";
}

// Funciones principales que exportamos para usar en la app

// Funcion para iniciar sesión con email y contraseña
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  //Limpiamos el email por si acaso
  const cleanEmail = email.trim();

  // Preguntamos a Supabase (el servidor)
  // "await" significa: espera aquí quieto hasta que el servidor responda.
  const respuesta = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: password,
  });

  // Comprobamos si hubo error
  if (respuesta.error) {
    throw respuesta.error;
  }

  // Si no hay usuario en la respuesta, algo raro pasó
  if (!respuesta.data.user) {
    throw new Error("Error desconocido: No se recibieron datos del usuario.");
  }

  // Ahora buscamos la ficha completa del usuario (con foto, nombre, etc.)
  const usuarioLogueado = respuesta.data.user;

  //Intentamos leer su ficha de la tabla 'profiles'
  const perfil = await getUserProfileById(
    usuarioLogueado.id,
    cleanEmail,
    "", // No sabemos el nombre aún
    "NORMAL", // Rol por defecto
  );

  // Devolvemos el usuario completo y feliz
  return {
    user: perfil,
  };
}

// Función para registrarse con email y contraseña
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<SignUpResult> {
  const cleanEmail = email.trim();
  const cleanName = fullName.trim();

  // Guardamos el nombre para no perderlo.
  const respuesta = await supabase.auth.signUp({
    email: cleanEmail,
    password: password,
    options: {
      data: {
        full_name: cleanName,
      },
    },
  });

  // Errores de registro
  if (respuesta.error) {
    throw respuesta.error;
  }

  if (!respuesta.data.user) {
    throw new Error("No se pudo crear el usuario. Inténtalo de nuevo.");
  }

  // Si el usuario ya existía le indidicamos que inicie sesión en lugar de registrarse
  if (
    respuesta.data.user.identities &&
    respuesta.data.user.identities.length === 0
  ) {
    throw new Error("Este correo ya está registrado. Prueba a iniciar sesión.");
  }

  // Si el registro fue exitoso, Supabase ya creó el usuario en la tabla "auth.users",
  // pero no creó su perfil en la tabla "profiles". Lo hacemos nosotros ahora.
  await supabase.from("profiles").upsert({
    id: respuesta.data.user.id,
    full_name: cleanName,
    email: cleanEmail,
  });

  // Enviar notificación a todos los usuarios informando del nuevo signup.
  // No bloqueamos el flujo de registro si falla el envío.
  try {
    const publicEndpoint = process.env.EXPO_PUBLIC_SEND_NEW_CLIENT_URL;
    if (publicEndpoint) {
      try {
        await fetch(publicEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: cleanName }),
        });
      } catch (err) {
        console.log(
          "Error enviando notificación al endpoint público tras signup:",
          err,
        );
      }
    } else {
      try {
        await sendNewClientNotification(cleanName);
      } catch (err) {
        console.log("Error enviando notificación tras signup:", err);
      }
    }
  } catch (err) {
    console.log("Error en el flujo de notificaciones tras signup:", err);
  }

  return {};
}

// Función para cerrar sesión
export async function clearSession() {
  await supabase.auth.signOut();
}

// Función para restaurar la sesión al iniciar la app (si el usuario ya estaba logueado)
export async function restoreSession() {
  const respuesta = await supabase.auth.getSession();

  if (respuesta.error) {
    return null;
  }

  return respuesta.data.session;
}

// Función para obtener la ficha completa de un usuario por su ID
export async function getUserProfileById(
  userId: string,
  emailFallback: string,
  nameFallback: string,
  roleFallback: RoleName = "NORMAL",
): Promise<UserProfile | null> {
  // Pedimos los datos a la tabla
  const consulta = await supabase
    .from("profiles")
    .select("*") // Traeme TODO
    .eq("id", userId) //donde el ID sea este.
    .single(); // Solo espero un resultado.

  // procesamos los datos
  const datos = consulta.data;

  // Aseguramos el nombre
  let nombreFinal = datos.full_name;
  if (!nombreFinal) {
    nombreFinal = nameFallback || "Usuario";
  }

  // Aseguramos el rol
  const rolFinal = normalizarRol(datos.role);

  // Aseguramos el avatar
  let avatarFinal = datos.avatar_url;
  if (!avatarFinal) {
    // si no tiene foto generamos una con su inicial
    avatarFinal = buildDefaultAvatar(nombreFinal);
  } else {
    // Si tiene foto, comprobamos si es una URL completa
    // o una ruta interna de Supabase Storage.
    if (!avatarFinal.startsWith("http")) {
      // Le pedimos a Supabase la URL pública para poder verla.
      const urlPublica = supabase.storage
        .from("avatars")
        .getPublicUrl(avatarFinal);
      avatarFinal = urlPublica.data.publicUrl;
    }
  }

  // Devolvemos la ficha limpia y perfecta
  return {
    id: datos.id,
    name: nombreFinal,
    email: datos.email || emailFallback,
    roleName: rolFinal,
    avatarUrl: avatarFinal,
  };
}
