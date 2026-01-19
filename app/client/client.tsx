import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import BottomNav from "src/components/BottomNav/bottom_nav"; // Barra inferior
import useClientList from "src/hooks/useClientList";

// Mostramos la lista de clientes con accesos a detalle y creación
export default function Client() {
  // Traemos la carga, navegación y barra inferior desde el hook
  const { items, navItems, handleOpenClient, handleCreate } = useClientList();

  return (
    <View style={styles.container}>
      <Header name="Clientes" />

      {/* Pintamos un botón por cada cliente que llega desde `items` */}
      <ScrollView contentContainerStyle={styles.list}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No hay clientes todavía.</Text>
        ) : (
          items.map((c) => (
            <View key={c.id}>
              <CustomButton
                text={c.nombre}
                onPress={() => handleOpenClient(c.id)}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Mostramos la barra inferior y el botón de crear */}
      <BottomNav items={navItems} showFab onFabPress={handleCreate} />
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
});
