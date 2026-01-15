import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "src/components/Buttons/button";
import Header from "src/components/Header/header";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav"; // Usamos la barra inferior de navegación

export default function Home() {
  // Usamos el router para movernos entre pantallas
  const router = useRouter();

  // Definimos las pestañas de abajo y marcamos Home como activa
  const navItems: BottomNavItem[] = [
    {
      icon: "home-outline",
      label: "Home",
      onPress: () => router.push("/home"),
      href: "/home",
      active: true,
    },
    { icon: "document-text-outline", label: "Pedidos" },
    {
      icon: "people-outline",
      label: "Clientes",
      onPress: () => router.push("/client"),
      href: "/client",
    },
    { icon: "cube-outline", label: "Inventario" },
  ];

  return (
    <View style={styles.container}>
      {/* Mostramos el header y dejamos el avatar como atajo al login */}
      <Header
        name="Hola Usuario!"
        onAvatarPress={() => router.push("/login")}
      />

      {/* Dejamos el botón principal para ir a clientes */}
      <View style={styles.content}>
        <CustomButton text="Clientes" onPress={() => router.push("/client")} />
        <Text style={styles.welcome}></Text>
      </View>

      {/* Pintamos la barra inferior */}
      <BottomNav items={navItems} showFab={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 120,
  },

  welcome: {
    fontSize: 16,
  },
});
