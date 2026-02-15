// Este archivo maneja el estado del formulario de login: email, contraseña,
// errores, y la función para iniciar sesión.

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "src/providers/AuthProvider";

// El hook useLogin encapsula toda la lógica relacionada con el formulario de login.
// Esto hace que la pantalla de login sea más limpia, ya que solo se encarga de mostrar
// los datos y llamar a las funciones que le damos aquí.

// Esta función se puede usar en la pantalla de login para obtener todo lo necesario para manejar el formulario.
export default function useLogin() {
  const router = useRouter();
  const { login, isBusy } = useAuth(); // Obtenemos la función de login y el estado de carga del AuthProvider
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isLoginDisabled = useMemo(
    () => !email.trim() || !password.trim() || isBusy,
    [email, isBusy, password],
  );

  // funcion para manejar el cambio en el campo email
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  // funcion para manejar el cambio en el campo password
  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  // funcion para manejar el submit del formulario
  const handleSubmit = useCallback(async () => {
    setError(null);

    //si hay algún campo vacío o ya estamos enviando, no hacemos nada
    if (isLoginDisabled) return;

    try {
      //enviamos el email y contraseña al servidor para iniciar sesión
      await login(email.trim(), password.trim());

      //si todo salió bien, redirigimos a la pantalla de reservas
      router.replace("/reservas");
    } catch (err) {
      // Si hubo un error, lo mostramos al usuario. Puede ser un mensaje específico del error o uno genérico.
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
    }
  }, [email, isLoginDisabled, login, password, router]);

  // Devolvemos todo lo necesario para manejar el formulario de login en la pantalla.
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
