import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import Header from "src/components/Header/header";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav";
import {
  deleteCliente,
  getClienteById,
  pedidos,
  type Cliente,
} from "src/types";
import CustomButton from "src/components/Buttons/button";

export default function ClientDetail() {
  // Usamos el router para movernos entre pantallas
  const router = useRouter();
  // Leemos el id que llega desde la URL
  const params = useLocalSearchParams<{ id?: string }>();
  const clientId = Number(params.id);
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
    [clientId]
  );

  // Confirmamos y borramos el cliente
  const handleDelete = () => {
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
      // Mostramos un confirm en web
      const ok = window.confirm(
        "Eliminar cliente\n\nEsta acción no se puede deshacer."
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
  };

  // Definimos la barra inferior y marcamos Clientes como activo
  const navItems: BottomNavItem[] = [
    {
      icon: "home-outline",
      label: "Home",
      onPress: () => router.push("/home"),
      href: "/home",
    },
    { icon: "document-text-outline", label: "Pedidos" },
    {
      icon: "people-outline",
      label: "Clientes",
      onPress: () => router.push("/client"),
      href: "/client",
      active: true,
    },
    { icon: "cube-outline", label: "Inventario" },
  ];

  // Mostramos un estado de carga mientras buscamos el cliente
  if (loading) {
    return (
      <View style={styles.container}>
        <Header name="Cliente" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Cargando cliente...</Text>
        </View>
        <BottomNav items={navItems} showFab={false} />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.container}>
        <Header name="Cliente" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Cliente no encontrado</Text>
          <Text style={styles.emptyText}>
            Revisa la lista y vuelve a intentarlo.
          </Text>
        </View>
        <BottomNav items={navItems} showFab={false} />
      </View>
    );
  }

  // Pintamos la ficha del cliente y sus pedidos
  return (
    <View style={styles.container}>
      <Header name={client.nombre} />

      {/* Dejamos botones para editar o borrar */}
      <View style={styles.actionBar}>
        <CustomButton
          text="Editar cliente"
          onPress={() => router.push(`/client/${client.id}/edit`)}
        />
        <View style={{ height: 10 }} />
        <CustomButton text="Eliminar cliente" onPress={handleDelete} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mostramos los datos básicos del cliente */}
        <View style={styles.cardPrimary}>
          <Text style={styles.sectionTitle}>Datos del cliente</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{client.nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{client.email ?? "Sin email"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>
              {client.telefono ?? "Sin teléfono"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NIF/CIF</Text>
            <Text style={styles.value}>{client.nifCif ?? "—"}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.badgeSuccess]}>
              <Text style={styles.badgeText}>Activo</Text>
            </View>
            <View style={[styles.badge, styles.badgeMuted]}>
              <Text style={styles.badgeText}>ID {client.id}</Text>
            </View>
          </View>
        </View>

        {/* Mostramos los pedidos del cliente */}
        <View style={styles.cardSecondary}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos pedidos</Text>
            <Text style={styles.sectionHint}>
              {pedidosCliente.length} en total
            </Text>
          </View>
          <View style={styles.divider} />
          {pedidosCliente.length === 0 ? (
            <Text style={styles.emptyText}>Sin pedidos registrados.</Text>
          ) : (
            pedidosCliente.map((pedido) => (
              <View key={pedido.id} style={styles.pedidoRow}>
                <View style={styles.pedidoLeft}>
                  <Text style={styles.pedidoCode}>{pedido.codigo}</Text>
                  <Text style={styles.pedidoDates}>
                    {pedido.fechaInicio} · {pedido.fechaFin}
                  </Text>
                </View>
                <View
                  style={[styles.statusPill, statusPillStyle(pedido.estado)]}
                >
                  <Text style={styles.statusText}>{pedido.estado}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNav items={navItems} showFab={false} />
    </View>
  );
}

function statusPillStyle(estado: string) {
  switch (estado) {
    case "ENTREGADO":
      return { backgroundColor: "#d1fae5", borderColor: "#10b981" };
    case "PREPARADO":
      return { backgroundColor: "#e0f2fe", borderColor: "#0ea5e9" };
    case "PENDIENTE_REVISION":
      return { backgroundColor: "#fef9c3", borderColor: "#f59e0b" };
    case "FINALIZADO":
      return { backgroundColor: "#f3f4f6", borderColor: "#9ca3af" };
    default:
      return { backgroundColor: "#e5e7eb", borderColor: "#9ca3af" };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7fb",
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  cardPrimary: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardSecondary: {
    backgroundColor: "#fefefe",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionHint: {
    fontSize: 12,
    color: "#6b7280",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  row: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: "#ecfdf3",
    borderColor: "#22c55e",
  },
  badgeMuted: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  badgeText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },
  pedidoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 10,
  },
  pedidoLeft: {
    flex: 1,
  },
  pedidoCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  pedidoDates: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statusPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
  },
});
