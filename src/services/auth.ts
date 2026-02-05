import { supabase } from "supabase/supabaseClient";
import { type RoleName, type UserProfile } from "src/stores/userStore";

export type AuthResult = {
  user: UserProfile;
};

export type SignUpResult = {
  needsEmailConfirmation: boolean;
};

type DbProfile = {
  id: string;
  full_name: string | null;
  created_at: string;
};

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=12";

function mapProfile(
  profile: DbProfile | null,
  email: string,
  fallbackName = "",
): UserProfile {
  const roleName: RoleName = "NORMAL";
  const safeName = profile?.full_name || fallbackName || "Usuario";
  return {
    id: profile?.id ?? "",
    roleName,
    name: safeName,
    email,
    avatarUrl: DEFAULT_AVATAR,
  };
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user) {
    throw new Error("No se pudo obtener el usuario autenticado.");
  }

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  // Si el perfil no tiene nombre, lo completamos con el nombre real guardado en auth
  if (metadataName) {
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: metadataName,
    });
  }

  const profile = await getUserProfileById(
    user.id,
    user.email ?? email,
    metadataName,
  );
  if (!profile) {
    throw new Error("No se pudo obtener el perfil del usuario.");
  }

  return { user: profile };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  // Guardamos el nombre en profiles para que quede persistido
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName,
    });
  }

  return {
    needsEmailConfirmation: !data.session,
  };
}

export async function clearSession() {
  await supabase.auth.signOut();
}

export async function restoreSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }
  return data.session;
}

export async function getUserProfileById(
  userId: string,
  fallbackEmail = "",
  fallbackName = "",
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return null;
  }

  return mapProfile(data ?? null, fallbackEmail, fallbackName);
}
