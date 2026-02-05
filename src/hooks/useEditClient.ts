import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TextInput, type TextInputProps } from "react-native-paper";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useQueryClient } from "@tanstack/react-query";
import { updateClient } from "src/services/clientService";
import { clientQueryKey, clientsQueryKey } from "src/hooks/queries/queryKeys";
import { useClientQuery } from "src/hooks/queries/useClientQuery";

export default function useEditClient() {
  // Usamos el router para volver o salir
  const router = useRouter();
  // Leemos el id que llega en la URL
  const params = useLocalSearchParams<{ id?: string }>();
  const clientId = params.id ?? "";
  const { colors, isDark } = useThemePreference();
  const queryClient = useQueryClient();

  // Guardamos el nombre para el título y un flag de no encontrado
  const [clientName, setClientName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Guardamos los estados del formulario que llegan de los inputs
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nif, setNif] = useState("");

  const isValidId = Boolean(clientId);
  const {
    data: client,
    isLoading,
    isError,
    error,
  } = useClientQuery(clientId, isValidId);

  // Volvemos a cargar los datos si cambia el id
  useEffect(() => {
    if (!clientId) {
      setClientName(null);
      setNotFound(true);
      return;
    }

    if (!client && !isLoading && !isError) {
      setClientName(null);
      setNotFound(true);
      return;
    }

    if (client) {
      setNotFound(false);
      setClientName(client.nombre);
      setNombre(client.nombre ?? "");
      setEmail(client.email ?? "");
      setTelefono(client.telefono ?? "");
      setNif(client.nifCif ?? "");
    }
  }, [client, clientId, isError, isLoading]);

  // Guardamos cambios y volvemos atrás
  const handleSave = useCallback(
    async function handleSave() {
      // Si no hay id válido, no hacemos nada
      if (!clientId) return;
      // Usamos el estado local del formulario para construir el payload; trim para limpiar espacios
      try {
        await updateClient(clientId, {
          nombre: nombre.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          nifCif: nif.trim() || undefined,
        });
        await queryClient.invalidateQueries({ queryKey: clientsQueryKey });
        await queryClient.invalidateQueries({
          queryKey: clientQueryKey(clientId),
        });
        router.back();
      } catch (error) {
        console.error("No se pudo actualizar el cliente:", error);
      }
    },
    [clientId, email, nif, nombre, queryClient, router, telefono],
  );

  // Cancelamos y volvemos a la pantalla anterior
  const handleCancel = useCallback(
    function handleCancel() {
      router.back();
    },
    [router],
  );

  // Compartimos estilos base para los TextInput, (lo ha hecho el chat)
  const fieldBackground = isDark ? "#111b2a" : "#f8fafc";
  const placeholderColor = isDark ? "rgba(179,192,207,0.72)" : "#9ca3af";

  const textInputProps: Pick<
    TextInputProps,
    | "outlineStyle"
    | "style"
    | "outlineColor"
    | "activeOutlineColor"
    | "textColor"
    | "placeholderTextColor"
    | "selectionColor"
  > = {
    outlineStyle: { borderRadius: 12, borderColor: colors.border },
    style: { backgroundColor: fieldBackground },
    outlineColor: colors.border,
    activeOutlineColor: colors.primary,
    textColor: colors.text,
    placeholderTextColor: placeholderColor,
    selectionColor: `${colors.primary}99`,
  };

  return {
    notFound,
    isLoading,
    isError,
    error,
    clientName,
    nombre,
    email,
    telefono,
    nif,
    setNombre,
    setEmail,
    setTelefono,
    setNif,
    handleSave,
    handleCancel,
    textInputProps,
    iconColor: placeholderColor,
  };
}
