import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface Props {
  name?: string;
}

export default function Header({ name = "Usuario" }: Props) {
  const today = new Date();

  /* Lo de la fecha me lo ha hecho el chat*/
  const formatted = today.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.greeting}>Hola {name}!</Text>
        <Text style={styles.date}>{formatted}</Text>
      </View>

      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: "https://preview.redd.it/i-drew-the-rodeo-album-cover-v0-fp830723fqwd1.png?width=1080&crop=smart&auto=webp&s=5144251c22bfd7a784d008361e9394f7cbef7b1d",
          }}
          style={styles.avatar}
        />
      </View>
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
    backgroundColor: "#2563eb",
  },
  left: {
    flexDirection: "column",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});
