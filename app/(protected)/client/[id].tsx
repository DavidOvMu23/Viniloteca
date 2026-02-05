import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "src/components/Header/header";
import BottomNav from "src/components/BottomNav/bottom_nav";
import CustomButton from "src/components/Buttons/button";
import useClientDetail from "src/hooks/useClientDetail";
import { useThemePreference } from "src/providers/ThemeProvider";

export default function ClientDetail() {
  // Centralizamos carga, navegación y acciones en el hook
  const {
    client,
    loading,
    isError,
    error,
    pedidosCliente,
    navItems,
    handleEdit,
    handleDelete,
    canDelete,
  } = useClientDetail();
  const { colors } = useThemePreference();

  // Mostramos un estado de carga mientras buscamos el cliente
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header name="Cliente" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Cargando cliente...</Text>
        </View>
        <BottomNav items={navItems} showFab={false} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header name="Cliente" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No se pudo cargar el cliente</Text>
          <Text style={styles.emptyText}>
            {error instanceof Error
              ? error.message
              : "Revisa la conexión y vuelve a intentarlo."}
          </Text>
        </View>
        <BottomNav items={navItems} showFab={false} />
      </View>
    );
  }

  // Si no encontramos el cliente, mostramos mensaje de error
  if (!client) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header name={client.nombre} />

      {/* Dejamos botones para editar o borrar */}
      <View style={styles.actionBar}>
        <CustomButton text="Editar cliente" onPress={handleEdit} />
        <View style={{ height: 10 }} />
        {canDelete ? (
          <CustomButton text="Eliminar cliente" onPress={handleDelete} />
        ) : (
          <Text style={styles.notice}>
            Solo los administradores pueden eliminar.
          </Text>
        )}
      </View>

      {/* Contenido desplazable con datos del cliente y sus pedidos */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mostramos los datos básicos del cliente */}
        <View
          style={[
            styles.cardPrimary,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
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
        <View
          style={[
            styles.cardSecondary,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
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
            // Recorremos los pedidos del hook y pintamos cada fila con su estado
            pedidosCliente.map(function renderPedido(pedido) {
              return (
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
              );
            })
          )}
        </View>
      </ScrollView>

      <BottomNav items={navItems} showFab={false} />
    </View>
  );
}

function statusPillStyle(estado: string) {
  // Decidimos colores de la píldora según el estado del pedido
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardSecondary: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
  notice: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },
});
