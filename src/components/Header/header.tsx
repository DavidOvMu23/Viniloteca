import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

// Componente de encabezado que muestra un saludo, la fecha actual y un avatar de usuario
interface Props {
  name?: string;
  onAvatarPress?: () => void;
  avatarUri?: string;
}

// Definimos el componente del header
export default function Header({
  name = "Usuario",
  onAvatarPress,
  avatarUri = "https://i.pravatar.cc/150?img=12", // la imagen me la dio el chatGPT
}: Props) {
  // Sacamos la fecha de hoy
  const today = new Date();

  // Formateamos la fecha en español (esto me lo dio el chatGPT)
  const formatted = today.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.greeting}>{name}</Text>
        <Text style={styles.date}>{formatted}</Text>
      </View>

      {/* Dejamos el avatar como botón si pulsamos en él */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onAvatarPress}
        activeOpacity={0.8}
      >
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#231e8cff",
  },
  left: {
    flexDirection: "column",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffffff",
  },
  date: {
    fontSize: 12,
    color: "#b4b4b4ff",
    marginTop: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});
