import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "src/providers/AuthProvider";

export default function useLogin() {
  // Usamos el router para movernos después del login
  const router = useRouter();
  const { login, isBusy } = useAuth();
  // Guardamos el email que llega desde el input
  const [email, setEmail] = useState("");
  // Guardamos la contraseña que llega desde el input
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Calculamos si el botón debe estar desactivado según el estado
  const isLoginDisabled = useMemo(
    () => !email.trim() || !password.trim() || isBusy,
    [email, isBusy, password],
  );

  // Guardamos cambios del input de email
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  // Guardamos cambios del input de contraseña
  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  // Navegamos al home tras un login correcto
  const handleSubmit = useCallback(async () => {
    // Reiniciamos error antes de lanzar la petición de login
    setError(null);
    // Evitamos enviar si el botón debería estar deshabilitado
    if (isLoginDisabled) return;
    try {
      // Pasamos email/password al provider; si falla, guardamos mensaje para la UI
      await login(email.trim(), password.trim());
      router.replace("/home");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
    }
  }, [email, isLoginDisabled, login, password, router]);

  return {
    email,
    password,
    isLoginDisabled,
    isSubmitting: isBusy,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}
