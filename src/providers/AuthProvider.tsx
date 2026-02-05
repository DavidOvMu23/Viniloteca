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
    // 1) Marcamos que estamos verificando, 2) leemos token mock, 3) traemos perfil, 4) ajustamos estado
    setStatus("checking");
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

    if (metadataName) {
      await supabase.from("profiles").upsert({
        id: session.user.id,
        full_name: metadataName,
      });
    }

    const profile = await getUserProfileById(
      session.user.id,
      session.user.email ?? "",
      metadataName,
    );
    if (!profile) {
      await clearSession();
      clearUser();
      setStatus("unauthenticated");
      return;
    }

    setUser(profile);
    setStatus("authenticated");
  }, [clearUser, setUser]);

  useEffect(() => {
    // Lanzamos la comprobación inicial una sola vez al montar el proveedor
    void bootstrap();
  }, [bootstrap]);

  // Login simulado: guarda token mock y actualiza store global
  const login = useCallback(
    async (email: string, password: string) => {
      // Recibimos email y password desde el hook de login; devolvemos error si las credenciales son malas
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
    [setUser],
  );

  // Logout limpio: borra storage y resetea usuario
  const logout = useCallback(async () => {
    setIsBusy(true);
    try {
      // Limpiamos storage + store para que cualquier pantalla redirija a login
      await clearSession();
      clearUser();
      setStatus("unauthenticated");
    } finally {
      setIsBusy(false);
    }
  }, [clearUser]);

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
