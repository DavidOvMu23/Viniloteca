import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import BottomNav from "src/components/BottomNav/bottom_nav"; // Barra inferior
import useClientList from "src/hooks/useClientList";
import { useThemePreference } from "src/providers/ThemeProvider";

// Mostramos la lista de clientes con accesos a detalle y creación
export default function Client() {
  // Traemos la carga, navegación y barra inferior desde el hook
  const {
    items,
    isLoading,
    isError,
    error,
    navItems,
    handleOpenClient,
    handleCreate,
    canCreate,
  } = useClientList();
  const { colors } = useThemePreference();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header name="Clientes" />

      {/* Pintamos un botón por cada cliente que llega desde `items` */}
      <ScrollView contentContainerStyle={styles.list}>
        {isLoading ? (
          <Text style={styles.emptyText}>Cargando clientes...</Text>
        ) : isError ? (
          <Text style={styles.emptyText}>
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar los clientes."}
          </Text>
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No hay clientes todavía.</Text>
        ) : (
          // Cada botón llama a handleOpenClient con el id del elemento iterado
          items.map(function renderClient(c) {
            return (
              <View key={c.id}>
                <CustomButton
                  text={c.nombre}
                  onPress={function onPress() {
                    handleOpenClient(c.id);
                  }}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Mostramos la barra inferior y el botón de crear */}
      {!canCreate ? (
        <Text style={styles.hint}>
          Solo los administradores pueden crear clientes.
        </Text>
      ) : null}

      {/* Barra inferior con FAB para crear cliente si es admin */}
      <BottomNav
        items={navItems}
        showFab={canCreate}
        // FAB reutiliza handleCreate del hook (solo admin)
        onFabPress={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  hint: {
    textAlign: "center",
    marginBottom: 8,
    color: "#6b7280",
  },
});
