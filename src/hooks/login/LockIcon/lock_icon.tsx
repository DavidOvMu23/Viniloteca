import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

// Pintamos un ícono de candado dentro de un círculo
const LockIcon = () => {
  return (
    <View style={styles.container}>
      {/* Dejamos el ícono centrado para que se vea limpio */}
      <Feather name="lock" size={24} color="#4f46e5" />
    </View>
  );
};

// Definimos los estilos del icono
const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8EAF6",
    justifyContent: "center",
    alignItems: "center",
  },
});

// Exportamos el componente para usarlo en otras pantallas
export default LockIcon;
