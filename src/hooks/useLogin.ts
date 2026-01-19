import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";

export default function useLogin() {
  // Usamos el router para movernos después del login
  const router = useRouter();
  // Guardamos el email que llega desde el input
  const [email, setEmail] = useState("");
  // Guardamos la contraseña que llega desde el input
  const [password, setPassword] = useState("");

  // Calculamos si el botón debe estar desactivado según el estado
  const isLoginDisabled = useMemo(
    () => !email.trim() || !password.trim(),
    [email, password],
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
  const handleSubmit = useCallback(() => {
    router.replace("/home");
  }, [router]);

  return {
    email,
    password,
    isLoginDisabled,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}
