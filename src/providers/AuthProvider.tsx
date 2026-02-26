// AuthProvider.tsx — Proveedor de autenticación de la aplicación

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Funciones que hablan con el backend para:
import {
  clearSession,
  getUserProfileById,
  loginWithEmail,
  restoreSession,
} from "src/services/auth";

// Es la conexión directa con nuestra base de datos en la nube.
// Lo usamos aquí puntualmente para actualizar la tabla "profiles".
import { supabase } from "supabase/supabaseClient";

// useUserStore es un almacén donde guardamos los datos
// del usuario de forma global: nombre, email, avatar, etc.
// UserProfile es tipo que describe la forma de esos datos.
import { useUserStore } from "src/stores/userStore";
import { type UserProfile, type AuthStatus } from "src/types";

//interfaz para el valor que se escribirá en el contexto de autenticación
interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  isBusy: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Función para normalizar el rol del usuario, asegurando que solo sea "SUPERVISOR" o "NORMAL".
function parseRoleName(rawRole: unknown): "SUPERVISOR" | "NORMAL" {
  if (typeof rawRole !== "string") return "NORMAL";
  const normalized = rawRole.trim().toUpperCase();
  return normalized === "SUPERVISOR" ? "SUPERVISOR" : "NORMAL";
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, clearUser } = useUserStore();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [isBusy, setIsBusy] = useState(false);
  const bootstrap = useCallback(async () => {
    setStatus("checking");
    try {
      const session = await restoreSession();
      if (!session?.user) {
        clearUser();
        setStatus("unauthenticated");
        return;
      }
      const metadataName =
        typeof session.user.user_metadata?.full_name === "string"
          ? session.user.user_metadata.full_name
          : "";
      const metadataRole = parseRoleName(
        (session.user.user_metadata as Record<string, unknown> | undefined)
          ?.role,
      );
      const appMetadataRole = parseRoleName(
        (session.user as { app_metadata?: Record<string, unknown> })
          .app_metadata?.role,
      );
      const fallbackRole =
        metadataRole === "SUPERVISOR" || appMetadataRole === "SUPERVISOR"
          ? "SUPERVISOR"
          : "NORMAL";
      if (metadataName) {
        try {
          await supabase.from("profiles").upsert({
            id: session.user.id,
            full_name: metadataName,
            email: session.user.email ?? "",
          });
        } catch {}
      }
      const profile = await getUserProfileById(
        session.user.id,
        session.user.email ?? "",
        metadataName,
        fallbackRole,
      );
      if (!profile) {
        const email = session.user.email ?? "";
        const fallbackName = metadataName || email.split("@")[0] || "Usuario";

        setUser({
          id: session.user.id,
          roleName: fallbackRole,
          name: fallbackName,
          email,
        });
        setStatus("authenticated");
        return;
      }
      setUser(profile);
      setStatus("authenticated");
    } catch {
      clearUser();
      setStatus("unauthenticated");
    }
  }, [clearUser, setUser]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (isBusy) return;

      setIsBusy(true);
      try {
        const result = await loginWithEmail(email, password);

        setUser(result.user);
        setStatus("authenticated");
      } catch (error) {
        setStatus("unauthenticated");
        throw error;
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, setUser],
  );

  // Borra la sesión del almacenamiento local del teléfono y vacía
  // el almacén global (user = null). Así cualquier pantalla que
  // dependa del usuario detectará que ya no hay nadie logueado y
  // redirigirá automáticamente a la pantalla de login.
  //
  // useCallback memoriza la función; solo se re-crea si cambian
  // clearUser o isBusy.
  const logout = useCallback(async () => {
    // Evitamos doble logout si ya hay una acción en curso
    if (isBusy) return;

    // Activamos el indicador de "ocupado"
    setIsBusy(true);
    try {
      // Borramos la sesión del almacenamiento local del dispositivo
      await clearSession();

      // Vaciamos el almacén global del usuario
      clearUser();

      // Marcamos el estado como "sin autenticar"
      setStatus("unauthenticated");
    } finally {
      // Pase lo que pase, quitamos el indicador de "ocupado"
      setIsBusy(false);
    }
  }, [clearUser, isBusy]);

  // Reunimos todo lo que queremos compartir (estado + funciones) en
  // un solo objeto. useMemo evita recrear este objeto en cada render;
  // solo lo recalcula si alguna de sus dependencias cambia.
  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isBusy,
      login,
      logout,
      refreshSession: bootstrap,
    }),
    [bootstrap, isBusy, login, logout, status, user],
  );

  // Devolvemos el Provider (el "marco") que envuelve a todos los hijos.
  // El atributo "value" es lo que se escribe en la pizarra: cualquier
  // componente hijo que use useAuth() recibirá este objeto.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Cualquier componente de la app puede llamar a useAuth() para obtener
// el estado actual (¿hay usuario?, ¿está cargando?) y las funciones
// de login/logout. Es un atajo cómodo sobre useContext(AuthContext).
//
// Si alguien intenta usar useAuth() fuera del AuthProvider (es decir,
// sin que el Provider lo envuelva), lanzamos un error claro para que
// el desarrollador sepa que falta el Provider en el árbol de componentes.
export function useAuth() {
  // Leemos el contenido de la pizarra (contexto)
  const ctx = useContext(AuthContext);

  // Si el contexto es undefined, significa que este componente NO
  // está dentro del AuthProvider → lanzamos un error descriptivo.
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  // Devolvemos el objeto con status, user, isBusy, login, logout, etc.
  return ctx;
}
