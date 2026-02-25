//Este archivo maneja el formulario de edición de un cliente existente
// carga datos actuales, permite modificar y guardar cambios.

import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { type TextInputProps } from "react-native-paper";
// useThemePreference para obtener colores y adaptar la UI al tema.
import { useThemePreference } from "src/providers/ThemeProvider";
// useQueryClient de React Query para invalidar/actualizar caché tras guardar.
import { useQueryClient } from "@tanstack/react-query";
// updateClient para enviar los cambios del cliente al servicio.
import { updateClient } from "src/services/clientService";
// keys de React Query para invalidar las queries relacionadas con clientes.
import { clientQueryKey, clientsQueryKey } from "src/hooks/queries/queryKeys";
// useClientQuery hook para obtener los datos actuales del cliente.
import { useClientQuery } from "src/hooks/queries/useClientQuery";
// useUserStore para leer el usuario actual y sus permisos.
import { useUserStore } from "src/stores/userStore";

// El hook useEditClient encapsula toda la lógica necesaria para la pantalla de edición de clientes

// esta función se encarga de manejar el formulario de edición de un cliente existente.
// Carga los datos actuales del cliente, permite modificarlos y guarda los cambios en el servidor.
// También maneja estados como "cliente no encontrado", carga, errores, etc.
// Es como el "cerebro" detrás de la pantalla de edición, manteniendo todo organizado y separado de la parte visual.

export default function useEditClient() {
  const router = useRouter(); // Para navegar entre pantallas (volver atrás, etc.)

  const params = useLocalSearchParams<{ id?: string }>(); // Para leer el "id" del cliente que viene en la URL

  const clientId = params.id ?? ""; // Si no hay id, usamos cadena vacía para evitar problemas con undefined

  const { colors, isDark } = useThemePreference(); // Para adaptar los colores según el tema (oscuro/claro)

  const queryClient = useQueryClient(); // Para manejar la caché de datos y poder invalidarla tras guardar cambios

  const currentUser = useUserStore((state) => state.user); // Para saber quién es el usuario actual y qué permisos tiene

  const canEditEmail = currentUser?.roleName === "SUPERVISOR"; // Solo los supervisores pueden editar el email y el rol del cliente

  const [clientName, setClientName] = useState<string | null>(null); // Para mostrar el nombre del cliente en el título de la pantalla. Si es null, mostramos "Cliente no encontrado".

  const [notFound, setNotFound] = useState(false); // Bandera para indicar si el cliente no fue encontrado (id inválido o consulta sin resultados)

  const [nombre, setNombre] = useState(""); // Estado local para el campo "Nombre" del formulario

  const [email, setEmail] = useState(""); // Estado local para el campo "Email" del formulario

  const [role, setRole] = useState<"SUPERVISOR" | "NORMAL">("NORMAL"); // Estado local para el campo "Rol" del formulario (solo para supervisores)

  const isValidId = Boolean(clientId); // Validamos que el id no sea vacío para evitar hacer consultas innecesarias

  // Usamos nuestro hook personalizado para obtener los datos del cliente. Este hook se encarga de hacer la consulta al servidor y manejar estados de carga y error.
  const {
    data: client,
    isLoading,
    isError,
    error,
  } = useClientQuery(clientId, isValidId);

  // useEffect para reaccionar a los cambios en los datos del cliente o en el id.
  useEffect(() => {
    // Si no hay un id válido, no tiene sentido seguir; marcamos como "no encontrado" y salimos.
    if (!clientId) {
      setClientName(null);
      setNotFound(true);
      return;
    }

    // Si la consulta terminó de cargar pero no se encontró ningún cliente, también marcamos como "no encontrado".
    if (!client && !isLoading && !isError) {
      setClientName(null);
      setNotFound(true);
      return;
    }

    // Si tenemos los datos del cliente, los usamos para llenar el formulario y el título.
    if (client) {
      setNotFound(false);
      setClientName(client.full_name);
      setNombre(client.full_name ?? "");
      setEmail((client as { email?: string | null }).email ?? "");
      setRole((client as { role?: "SUPERVISOR" | "NORMAL" }).role ?? "NORMAL");
    }
  }, [client, clientId, isError, isLoading]);

  // funcion para guardar los cambios del cliente.
  const handleSave = useCallback(
    async function handleSave() {
      // Validamos que tengamos un id de cliente antes de intentar guardar. Si no lo tenemos, no podemos continuar.
      if (!clientId) return;

      // Intentamos guardar los cambios en el servidor. Si algo sale mal, lo atrapamos en el catch.
      try {
        // Objeto con los datos a enviar
        const payload: {
          full_name: string;
          email?: string | null;
          role?: "SUPERVISOR" | "NORMAL";
        } = {
          full_name: nombre.trim(),
        };

        // Solo incluimos el email si el usuario tiene permiso para editarlo
        if (canEditEmail) {
          const trimmedEmail = email.trim();
          // Si el email está vacío tras recortar, enviamos null
          if (trimmedEmail.length > 0) {
            payload.email = trimmedEmail;
          } else {
            payload.email = null;
          }
          // Solo los supervisores pueden cambiar el rol
          payload.role = role;
        }

        // Enviamos los datos al servidor
        await updateClient(clientId, payload);

        // Si todo salió bien, invalidamos las consultas relacionadas para que se actualicen con los nuevos datos.
        await queryClient.invalidateQueries({ queryKey: clientsQueryKey });
        await queryClient.invalidateQueries({
          queryKey: clientQueryKey(clientId),
        });

        // Volvemos a la pantalla anterior (lista de clientes) tras guardar los cambios.
        router.back();
      } catch (error) {
        // Si hubo un error al guardar, lo mostramos en la consola y también en una alerta para el usuario.
        console.error("No se pudo actualizar el cliente:", error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el cliente.",
        );
      }
    },
    // Lista de dependencias: valores que, si cambian, obligan a recrear
    // la función para que siempre trabaje con datos actualizados.
    [canEditEmail, clientId, email, nombre, queryClient, router, role],
  );

  // Función para cancelar la edición y volver atrás sin guardar cambios.
  const handleCancel = useCallback(
    function handleCancel() {
      router.back();
    },
    [router],
  );

  // Color para los iconos (como el del botón de guardar) que se adapta al tema.
  const fieldBackground = isDark ? "#111b2a" : "#f8fafc";

  // Color para los placeholders y los iconos, que se adapta al tema para mantener buena legibilidad.
  const placeholderColor = isDark ? "rgba(179,192,207,0.72)" : "#9ca3af";

  // Props compartidos para los TextInput del formulario, para mantener estilos consistentes y adaptados al tema.
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

  // Devolvemos todos los datos y funciones que la pantalla de edición necesita para funcionar correctamente.
  return {
    notFound,
    isLoading,
    isError,
    error,
    clientId,
    clientName,
    nombre,
    email,
    setNombre,
    setEmail,
    role,
    setRole,
    canEditEmail,
    handleSave,
    handleCancel,
    textInputProps,
    iconColor: placeholderColor,
  };
}
