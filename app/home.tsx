import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomButton from "src/components/Buttons/button";
import Header from "src/components/Header/header";
import BottomNav from "src/components/BottomNav/bottom_nav"; // Usamos la barra inferior de navegación
import useHome from "src/hooks/useHome";

export default function Home() {
  // Obtenemos navegación y tabs desde el hook para mantener la lógica separada
  const { navItems, handleAvatarPress, handleClientsPress } = useHome();

  return (
    <View style={styles.container}>
      {/* Mostramos el header y dejamos el avatar como atajo al login */}
      <Header name="Hola Usuario!" onAvatarPress={handleAvatarPress} />

      {/* Dejamos el botón principal para ir a clientes */}
      <View style={styles.content}>
        <CustomButton text="Clientes" onPress={handleClientsPress} />
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
