import { useCallback, useMemo, useState } from "react";
import { signUpWithEmail } from "src/services/auth";

export default function useSignup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleFullNameChange = useCallback(function handleFullNameChange(
    text: string,
  ) {
    setFullName(text);
  }, []);

  const handleEmailChange = useCallback(function handleEmailChange(
    text: string,
  ) {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback(function handlePasswordChange(
    text: string,
  ) {
    setPassword(text);
  }, []);

  const handleConfirmPasswordChange = useCallback(
    function handleConfirmPasswordChange(text: string) {
      setConfirmPassword(text);
    },
    [],
  );

  const handleSubmit = useCallback(
    async function handleSubmit() {
      setError(null);
      setSuccess(null);

      // Evitamos enviar si el botón debería estar deshabilitado
      if (isSignupDisabled) return;

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      setIsBusy(true);
      try {
        const result = await signUpWithEmail(
          email.trim(),
          password.trim(),
          fullName.trim(),
        );
        if (result.needsEmailConfirmation) {
          setSuccess("Cuenta creada correctamente. Ya puedes iniciar sesión.");
        } else {
          setSuccess("Cuenta creada correctamente. Ya puedes iniciar sesión.");
        }
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
