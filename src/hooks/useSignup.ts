// Este archivo maneja todo el estado del formulario de registro de un usuario nuevo:
// el nombre completo, el email, la contraseña, la confirmación de contraseña,
// los posibles errores y el mensaje de éxito, además de la función que
// realmente envía los datos para crear la cuenta.

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";

// Importamos la función que habla con el servidor para crear la cuenta.
// Vive en nuestro archivo de servicios de autenticación.
// signUpWithEmail para registrar usuarios mediante el servicio de auth.
import { signUpWithEmail } from "src/services/auth";

// Es la función que exportamos para que la pantalla de registro la use.
export default function useSignup() {
  const router = useRouter();
  // Nombre completo que escribe el usuario
  const [fullName, setFullName] = useState("");

  // Correo electrónico
  const [email, setEmail] = useState("");

  // Contraseña
  const [password, setPassword] = useState("");

  // Confirmación de contraseña
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sirve para deshabilitar el botón mientras se envía y evitar doble clic.
  const [isBusy, setIsBusy] = useState(false);

  // Mensaje de error, si ocurre alguno
  const [error, setError] = useState<string | null>(null);

  // Mensaje de éxito, si el registro sale bien
  const [success, setSuccess] = useState<string | null>(null);

  // Validar si el botón de registro debe estar deshabilitado. Lo estará si falta
  // algún campo por llevar
  const isSignupDisabled = useMemo(
    function isSignupDisabled() {
      return (
        !fullName.trim() ||
        !email.trim() ||
        !password.trim() ||
        !confirmPassword.trim() ||
        isBusy
      );
    },
    [confirmPassword, email, fullName, isBusy, password],
  );

  // Cuando el usuario escribe su nombre completo, guardamos el texto
  const handleFullNameChange = useCallback(function handleFullNameChange(
    text: string,
  ) {
    setFullName(text);
  }, []);

  // Cuando el usuario escribe su correo electrónico, guardamos el texto
  const handleEmailChange = useCallback(function handleEmailChange(
    text: string,
  ) {
    setEmail(text);
  }, []);

  // Cuando el usuario escribe su contraseña, guardamos el texto
  const handlePasswordChange = useCallback(function handlePasswordChange(
    text: string,
  ) {
    setPassword(text);
  }, []);

  // Cuando el usuario repite la contraseña para confirmar, guardamos el texto
  const handleConfirmPasswordChange = useCallback(
    function handleConfirmPasswordChange(text: string) {
      setConfirmPassword(text);
    },
    [],
  );

  // Funcion para enviar el formulario de registro al servidor
  const handleSubmit = useCallback(
    async function handleSubmit() {
      // Limpiamos cualquier error o éxito previo
      setError(null);
      setSuccess(null);

      // Si el formulario no está completo o ya estamos enviando,
      // cortamos aquí y no hacemos nada más.
      if (isSignupDisabled) return;

      // Comprobamos que la contraseña y su
      // confirmación sean exactamente iguales. Si no lo son, mostramos
      // un error y cortamos.
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      // Marcamos que estamos ocupados (el botón se deshabilita)
      setIsBusy(true);
      try {
        // Llamamos al servidor para crear la cuenta.
        // "await" hace que esperemos aquí hasta recibir respuesta.
        // Enviamos email, contraseña y nombre sin espacios sobrantes.
        const result = await signUpWithEmail(
          email.trim(),
          password.trim(),
          fullName.trim(),
        );
        // Si la creación fue correcta, navegamos a la pantalla de login
        router.replace("/login");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo crear la cuenta. Inténtalo de nuevo.",
        );
      } finally {
        setIsBusy(false);
      }
    },
    [confirmPassword, email, fullName, isSignupDisabled, password],
  );

  // Retornamos todos los valores y funciones que la pantalla de registro
  return {
    fullName,
    email,
    password,
    confirmPassword,
    isBusy,
    error,
    success,
    isSignupDisabled,
    handleFullNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  };
}
