import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  deleteCliente,
  getClienteById,
  pedidos,
  type Cliente,
} from "src/types";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";

export default function useClientDetail() {
  // Usamos el router para movernos entre pantallas
  const router = useRouter();
  // Leemos el id que llega desde la URL
  const params = useLocalSearchParams<{ id?: string }>();
  const clientId = Number(params.id);
  // Guardamos el cliente y el estado de carga
  const [client, setClient] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargamos el cliente cuando entramos o volvemos a esta pantalla
  const loadClient = useCallback(() => {
    let active = true;
    setLoading(true);
    getClienteById(clientId).then((data) => {
      if (active) {
        setClient(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [clientId]);

  useFocusEffect(loadClient);

  // Filtramos los pedidos usando el `clientId` que leímos de la URL
  const pedidosCliente = useMemo(
    () => pedidos.filter((p) => p.clienteId === clientId),
    [clientId],
  );

  // Navegamos entre Home y Clientes desde la barra inferior
  const goHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  const goClients = useCallback(() => {
    router.push("/client");
  }, [router]);

  // Definimos la barra inferior y marcamos Clientes como activo
  const navItems = useMemo<BottomNavItem[]>(
    () => [
      {
        icon: "home-outline",
        label: "Home",
        onPress: goHome,
        href: "/home",
      },
      { icon: "document-text-outline", label: "Pedidos" },
      {
        icon: "people-outline",
        label: "Clientes",
        onPress: goClients,
        href: "/client",
        active: true,
      },
      { icon: "cube-outline", label: "Inventario" },
    ],
    [goClients, goHome],
  );

  // Atajo para editar el cliente actual
  const handleEdit = useCallback(() => {
    if (!client) return;
    router.push(`/client/${client.id}/edit`);
  }, [client, router]);

  // Confirmamos y borramos el cliente
  const handleDelete = useCallback(() => {
    const confirmDelete = async () => {
      const deleted = await deleteCliente(clientId);
      if (deleted) {
        router.replace("/client");
        return;
      }
      Alert.alert("Error", "No se pudo eliminar el cliente.");
    };

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
        onPress: () => {
          void confirmDelete();
        },
      },
    ]);
  }, [clientId, router]);

  return {
    client,
    loading,
    pedidosCliente,
    navItems,
    handleEdit,
    handleDelete,
  };
}
