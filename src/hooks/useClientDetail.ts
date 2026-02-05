import { useCallback, useMemo } from "react";
import { Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";
import { useUserStore } from "src/stores/userStore";
import { deleteClient } from "src/services/clientService";
import { useClientQuery } from "src/hooks/queries/useClientQuery";
import { useOrdersByClientQuery } from "src/hooks/queries/useOrdersByClientQuery";
import { clientQueryKey, clientsQueryKey } from "src/hooks/queries/queryKeys";

export default function useClientDetail() {
  // Usamos el router para movernos entre pantallas
  const router = useRouter();
  // Leemos el id que llega desde la URL
  const params = useLocalSearchParams<{ id?: string }>();
  const clientId = params.id ?? "";
  const isValidId = clientId.length > 0;
  const queryClient = useQueryClient();
  // Leemos el usuario actual para permisos
  const user = useUserStore((state) => state.user);
  const canDelete = user?.roleName === "ADMIN";

  const {
    data: client,
    isLoading: isClientLoading,
    isError: isClientError,
    error: clientError,
  } = useClientQuery(clientId, isValidId);

  const {
    data: pedidosCliente = [],
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useOrdersByClientQuery(clientId, isValidId);

  const loading = isClientLoading || isOrdersLoading;
  const error = clientError ?? ordersError;
  const isError = isClientError || isOrdersError;

  // Navegamos entre Home y Clientes desde la barra inferior
  const goHome = useCallback(
    function goHome() {
      router.push("/home");
    },
    [router],
  );

  const goClients = useCallback(
    function goClients() {
      router.push("/client");
    },
    [router],
  );

  const goDiscos = useCallback(
    function goDiscos() {
      router.push("/discos");
    },
    [router],
  );

  // Definimos la barra inferior y marcamos Clientes como activo
  const navItems = useMemo<BottomNavItem[]>(
    () => [
      {
        icon: "home-outline",
        label: "Home",
        onPress: goHome,
        href: "/home",
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

  // Atajo para editar el cliente actual
  const handleEdit = useCallback(
    function handleEdit() {
      // Usamos el id del cliente ya cargado; si no está, no navegamos
      if (!client) return;
      router.push(`/client/${client.id}/edit`);
    },
    [client, router],
  );

  // Confirmamos y borramos el cliente
  const handleDelete = useCallback(
    function handleDelete() {
      // Solo administradores pueden disparar este flujo
      if (!canDelete) return;

      async function confirmDelete() {
        try {
          await deleteClient(clientId);
          await queryClient.invalidateQueries({ queryKey: clientsQueryKey });
          await queryClient.invalidateQueries({
            queryKey: clientQueryKey(clientId),
          });
          router.replace("/client");
        } catch (error) {
          console.error("No se pudo eliminar el cliente:", error);
        }
      }

      // Usamos una alerta distinta según si estamos en web o móvil
      if (Platform.OS === "web") {
        const ok = window.confirm(
          "Eliminar cliente\n\nEsta acción no se puede deshacer.",
        );
        if (ok) {
          void confirmDelete();
        }
        return;
      }

      Alert.alert("Eliminar cliente", "Esta acción no se puede deshacer.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: function onPress() {
            void confirmDelete();
          },
        },
      ]);
    },
    [canDelete, clientId, isValidId, queryClient, router],
  );

  return {
    client,
    loading,
    isError,
    error,
    pedidosCliente,
    navItems,
    handleEdit,
    handleDelete,
    canDelete,
  };
}
