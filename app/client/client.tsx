import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import { listClientes, type Cliente } from "src/types";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav"; // Barra inferior
import { useFocusEffect } from "expo-router";

// Mostramos la lista de clientes con accesos a detalle y creación
export default function Client() {
  // Usamos el router para movernos entre pantallas
  const router = useRouter();
  const [items, setItems] = useState<Cliente[]>([]);

  // Recargamos los clientes cuando volvemos a esta pantalla
  const loadClientes = useCallback(() => {
    let active = true;
    listClientes().then((data) => {
      if (active) setItems(data);
    });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(loadClientes);

  // Definimos la barra inferior con Clientes activo
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
                onPress={() => router.push(`/client/${c.id}`)}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Mostramos la barra inferior y el botón de crear */}
      <BottomNav
        items={navItems}
        showFab
        onFabPress={() => router.push("/client/new")}
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
});
