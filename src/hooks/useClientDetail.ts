// este archivo maneja toda la lógica de la pantalla de DETALLE DE UN CLIENTE.

import { useCallback, useMemo, useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useLocalSearchParams, useRouter } from "expo-router";
// useQueryClient para invalidar y refrescar cachés tras operaciones.
import { useQueryClient } from "@tanstack/react-query";
// BottomNavItem tipo para construir los items de navegación inferiores.
import { type BottomNavItem } from "src/types";
// useUserStore para acceder a usuario/roles y condicionar acciones (p.ej. eliminar).
import { useUserStore } from "src/stores/userStore";
// deleteClient para eliminar un cliente desde el servicio.
import { deleteClient } from "src/services/clientService";
// useClientQuery y useOrdersByClientQuery hooks personalizados que traen datos del cliente y sus pedidos.
import { useClientQuery } from "src/hooks/queries/useClientQuery";
import { useOrdersByClientQuery } from "src/hooks/queries/useOrdersByClientQuery";
// keys de React Query para invalidar queries relacionadas con clientes.
import { clientQueryKey, clientsQueryKey } from "src/hooks/queries/queryKeys";

// El hook useClientDetail encapsula toda la lógica necesaria para la pantalla de detalle de un cliente.
export default function useClientDetail() {
  const router = useRouter(); // Para navegar entre pantallas (volver atrás, etc.)

  const params = useLocalSearchParams<{ id?: string }>(); // Para leer el "id" del cliente que viene en la URL. Puede ser undefined si no se proporciona.

  const clientId = params.id ?? ""; // Si no hay id, usamos cadena vacía para evitar problemas con undefined. Luego validamos que no sea vacío.

  const isValidId = clientId.length > 0; // Validamos que el id no sea vacío para evitar hacer consultas innecesarias.

  const queryClient = useQueryClient(); // Para manejar la caché de datos y poder invalidarla tras eliminar un cliente.

  const user = useUserStore((state) => state.user); // Para saber quién es el usuario actual y qué permisos tiene. Solo los supervisores pueden eliminar clientes.

  const canDelete = user?.roleName === "SUPERVISOR"; // Solo los supervisores pueden eliminar clientes.

  // declaramos la consulta para obtener los datos del cliente usando nuestro hook personalizado useClientQuery.
  const {
    data: client,
    isLoading: isClientLoading,
    isError: isClientError,
    error: clientError,
  } = useClientQuery(clientId, isValidId);

  // declaramos la consulta para obtener los pedidos del cliente usando nuestro hook personalizado useOrdersByClientQuery.
  const {
    data: pedidosCliente = [],
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useOrdersByClientQuery(clientId, isValidId);

  const [titleMap, setTitleMap] = useState<Record<number, string | null>>({}); // Mapa para almacenar títulos de Discogs por ID, para mostrar en la lista de pedidos.

  // Función para construir la URL de la API de Discogs para obtener el resumen de un lanzamiento por su ID.
  function buildDiscogsUrl(discogsId: number, token: string): string {
    return `https://api.discogs.com/releases/${discogsId}?token=${encodeURIComponent(
      token,
    )}`;
  }

  // Función para obtener el título de un lanzamiento de Discogs dado su ID. Si hay algún error, devuelve null.
  async function fetchDiscogsReleaseSummary(
    discogsId: number,
    token: string,
  ): Promise<{ title: string | null }> {
    try {
      const url = buildDiscogsUrl(discogsId, token);
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return { title: null };
      const payload = await response.json();
      return { title: (payload?.title as string | undefined) ?? null };
    } catch {
      return { title: null };
    }
  }

  // Cuando cambian los pedidos, intentamos cargar títulos de Discogs
  useEffect(() => {
    const token = process.env.EXPO_PUBLIC_DISCOGS_TOKEN?.trim();
    if (!token) return;
    if (!pedidosCliente || pedidosCliente.length === 0) return;

    let active = true;

    const load = async () => {
      // Extraer posibles IDs de Discogs del campo 'codigo' con formato 'DISC-<id>'
      const ids = pedidosCliente
        .map((p: any) => {
          const m = String(p.codigo ?? "").match(/DISC-(\d+)/);
          return m ? Number(m[1]) : null;
        })
        .filter((n) => n != null) as number[];

      const uniqueIds = Array.from(new Set(ids));
      const map: Record<number, string | null> = {};

      for (const id of uniqueIds) {
        const { title } = await fetchDiscogsReleaseSummary(id, token);
        if (!active) return;
        map[id] = title;
      }

      if (active) setTitleMap((prev) => ({ ...prev, ...map }));
    };

    void load();

    return () => {
      active = false;
    };
  }, [pedidosCliente]);

  // Si CUALQUIERA de las dos consultas sigue cargando, mostramos spinner.
  const loading = isClientLoading || isOrdersLoading;

  // Si CUALQUIERA de las dos falló, propagamos el error.
  const error = clientError ?? ordersError;
  const isError = isClientError || isOrdersError;

  // Función para ir a la pantalla de Reservas.
  const goHome = useCallback(
    function goHome() {
      router.push("/reservas");
    },
    [router],
  );

  // Función para ir a la lista de Clientes.
  const goClients = useCallback(
    function goClients() {
      router.push("/client");
    },
    [router],
  );

  // Función para ir a la pantalla de Discos.
  const goDiscos = useCallback(
    function goDiscos() {
      router.push("/discos");
    },
    [router],
  );

  // Botones de navegación para la barra inferior. Cada uno tiene un icono, una etiqueta, una función onPress y una ruta href.
  const navItems = useMemo<BottomNavItem[]>(
    () => [
      {
        icon: "calendar-outline",
        label: "Reservas",
        onPress: goHome,
        href: "/reservas",
      },
      {
        icon: "disc-outline",
        label: "Discos",
        onPress: goDiscos,
        href: "/discos",
      },
      {
        icon: "people-outline",
        label: "Clientes",
        onPress: goClients,
        href: "/client",
        active: true,
      },
      { icon: "person-circle-outline", label: "Perfil", href: "/profile" },
      { icon: "settings-outline", label: "Preferencias", href: "/preferences" },
    ],
    [goClients, goDiscos, goHome],
  );

  // Función para ir a la pantalla de edición del cliente. Solo si tenemos los datos del cliente.
  const handleEdit = useCallback(
    function handleEdit() {
      // Comprobamos que los datos del cliente ya estén disponibles.
      if (!client) return;
      // Navegamos a la ruta de edición con el id del cliente.
      router.push(`/client/${client.id}/edit`);
    },
    [client, router],
  );

  // Función para eliminar el cliente, con confirmación previa. Solo para supervisores.
  const handleDelete = useCallback(
    function handleDelete() {
      // Paso 1: Solo administradores pueden eliminar.
      if (!canDelete) return;

      // Función interna asíncrona que realmente ejecuta el borrado.
      async function confirmDelete() {
        try {
          // Llamamos al servidor para eliminar el cliente.
          await deleteClient(clientId);

          // Invalidamos (refrescamos) la lista general de clientes
          // para que el cliente eliminado desaparezca de ella.
          await queryClient.invalidateQueries({ queryKey: clientsQueryKey });

          // También invalidamos la caché del cliente individual,
          // por si alguien intenta volver a esta misma ficha.
          await queryClient.invalidateQueries({
            queryKey: clientQueryKey(clientId),
          });

          // Volvemos a la lista de clientes (replace en vez de push
          // para que el usuario no pueda "volver atrás" a una ficha
          // que ya no existe).
          router.replace("/client");
        } catch (error) {
          // Si algo sale mal, lo apuntamos en la consola para depuración
          console.error("No se pudo eliminar el cliente:", error);
          // Y avisamos al usuario para que no se quede esperando
          Alert.alert(
            "Error",
            "No se pudo eliminar el cliente. Verifica que no tenga pedidos pendientes o contacta con soporte.",
          );
        }
      }

      // Paso 2: Mostrar diálogo de confirmación.
      // En la WEB usamos window.confirm (el típico cuadro del navegador).
      if (Platform.OS === "web") {
        const ok = window.confirm(
          "Eliminar cliente\n\nEsta acción no se puede deshacer.",
        );
        // Si el usuario pulsa "Aceptar", ejecutamos el borrado.
        if (ok) {
          void confirmDelete();
        }
        return;
      }

      // En MÓVIL usamos Alert.alert, que muestra un diálogo nativo
      // con botones de "Cancelar" y "Eliminar".
      Alert.alert("Eliminar cliente", "Esta acción no se puede deshacer.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async function onPress() {
            // En móvil intentamos autenticación biométrica antes de borrar
            try {
              const hasHardware = await LocalAuthentication.hasHardwareAsync();
              const isEnrolled = await LocalAuthentication.isEnrolledAsync();

              if (hasHardware && isEnrolled) {
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: "Autentícate para eliminar cliente",
                  cancelLabel: "Cancelar",
                });

                if (!result.success) {
                  Alert.alert(
                    "Autenticación fallida",
                    "No se pudo verificar la identidad. Operación cancelada.",
                  );
                  return;
                }
              }

              // Si no hay hardware o no hay credenciales registradas, continuamos con el borrado.
              void confirmDelete();
            } catch (err) {
              console.error("Error en autenticación biométrica:", err);
              // En caso de error en el proceso de biometría, no bloqueamos al usuario: intentamos borrar igualmente.
              void confirmDelete();
            }
          },
        },
      ]);
    },
    [canDelete, clientId, queryClient, router],
  );

  // Devolvemos todos los datos y funciones que la pantalla de detalle necesita para funcionar correctamente.
  return {
    client,
    loading,
    isError,
    error,
    pedidosCliente,
    titleMap,
    navItems,
    handleEdit,
    handleDelete,
    canDelete,
  };
}
