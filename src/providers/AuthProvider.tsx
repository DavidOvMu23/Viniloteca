import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearSession,
  getUserProfileById,
  loginWithEmail,
  restoreSession,
} from "src/services/auth";
import { supabase } from "supabase/supabaseClient";
import { useUserStore, type UserProfile } from "src/stores/userStore";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  isBusy: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado global de auth: guardamos al usuario en un store global y controlamos el estado general
  const { user, setUser, clearUser } = useUserStore();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [isBusy, setIsBusy] = useState(false);

  // Revisamos almacenamiento local al arrancar para restaurar sesión
  const bootstrap = useCallback(async () => {
    // 1) Marcamos que estamos verificando la sesión
    setStatus("checking");
    try {
      // 2) Recuperamos la sesión guardada en el dispositivo
      const session = await restoreSession();
      if (!session?.user) {
        // 3) Si no hay sesión, limpiamos estado y salimos
        clearUser();
        setStatus("unauthenticated");
        return;
      }

      // 4) Intentamos leer el nombre guardado en metadata de auth
      const metadataName =
        typeof session.user.user_metadata?.full_name === "string"
          ? session.user.user_metadata.full_name
          : "";

      // 5) Si hay nombre, lo guardamos en profiles para mantenerlo sincronizado
      if (metadataName) {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          full_name: metadataName,
        });
      }

      // 6) Pedimos el perfil completo al backend
      const profile = await getUserProfileById(
        session.user.id,
        session.user.email ?? "",
        metadataName,
      );
      if (!profile) {
        // 7) Si no hay perfil, cerramos sesión y limpiamos estado
        await clearSession();
        clearUser();
        setStatus("unauthenticated");
        return;
      }

      // 8) Guardamos el usuario y marcamos autenticado
      setUser(profile);
      setStatus("authenticated");
    } catch {
      // 9) Si algo falla, dejamos el estado como no autenticado
      await clearSession();
      clearUser();
      setStatus("unauthenticated");
    }
  }, [clearUser, setUser]);

  useEffect(() => {
    // Lanzamos la comprobación inicial una sola vez al montar el proveedor
    void bootstrap();
  }, [bootstrap]);

  // Login simulado: guarda token mock y actualiza store global
  const login = useCallback(
    async (email: string, password: string) => {
      // Recibimos email y password desde el hook de login; devolvemos error si las credenciales son malas
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

  // Logout limpio: borra storage y resetea usuario
  const logout = useCallback(async () => {
    // Evitamos doble logout si ya hay una acción en curso
    if (isBusy) return;
    setIsBusy(true);
    try {
      // Limpiamos storage + store para que cualquier pantalla redirija a login
      await clearSession();
      clearUser();
      setStatus("unauthenticated");
    } finally {
      setIsBusy(false);
    }
  }, [clearUser, isBusy]);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Garantizamos que los hooks se usen dentro del provider; evitamos estados incoherentes
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
