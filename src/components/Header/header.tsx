// este artchivo crea el compomnente Header, que es la barra superior de la app con el saludo,
// la fecha y el avatar del usuario. Es un componente reutilizable que se puede usar en varias pantallas.

import React from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// useThemePreference para aplicar colores/estilos según preferencia de tema.
import { useThemePreference } from "src/providers/ThemeProvider";
// Uso: useUserStore para mostrar información del usuario en el header.
import { useUserStore } from "src/stores/userStore";

// Definimos las props que acepta el componente Header. Son opcionales y tienen valores por defecto.
interface Props {
  name?: string; // El nombre del usuario que se muestra en el saludo. Si no se proporciona, se usará "Usuario".
  onAvatarPress?: () => void; // Función que se ejecuta al pulsar el avatar. Si no se proporciona, por defecto navega a la pantalla de perfil.
  avatarUri?: string; // URL de la imagen del avatar. Si no se proporciona, se usará la foto del usuario en la store o una imagen genérica con la letra inicial del nombre.
}

// Función para generar un avatar por defecto con la primera letra del nombre. Esto se usa cuando el cliente no tiene un avatar personalizado.
function buildInitialAvatarUri(name: string) {
  const trimmedName = name.trim();
  const initial = trimmedName ? trimmedName[0].toUpperCase() : "U";
  return `https://ui-avatars.com/api/?background=E5E7EB&color=111827&size=256&name=${encodeURIComponent(initial)}`;
}

// El componente Header muestra el saludo al usuario, la fecha actual y su avatar. Es adaptable al tema claro/oscuro y permite personalizar la acción al pulsar el avatar.
export default function Header({
  name = "Usuario",
  onAvatarPress,
  avatarUri,
}: Props) {
  const router = useRouter();
  // Obtenemos la fecha actual para mostrarla en el header
  const today = new Date();

  // Obtenemos los colores del tema actual para usarlos en el diseño del header
  const { colors } = useThemePreference();

  // Obtenemos los datos del usuario desde la store global. Esto nos permite mostrar su nombre y avatar aunque no se pasen por props.
  const user = useUserStore((state) => state.user);

  // Si se pasa un nombre por props, lo usamos. Si no, usamos el nombre del usuario en la store. Si tampoco hay, mostramos "Usuario".
  const resolvedName = user?.name?.trim() || name?.trim() || "Usuario";

  // Para la imagen del avatar, seguimos esta lógica de prioridad
  const safeAvatarUri = avatarUri?.trim() || user?.avatarUrl?.trim() || "";

  // Si no hay una URL válida, generamos una imagen con la letra inicial del nombre usando la función buildInitialAvatarUri.
  const resolvedAvatarUri =
    safeAvatarUri || buildInitialAvatarUri(resolvedName);

  // Formateamos la fecha en español con el formato "13 de febrero de 2026"
  const formatted = today.toLocaleDateString("es-ES", {
    day: "2-digit", // día con dos dígitos → "13"
    month: "long", // mes completo        → "febrero"
    year: "numeric", // año con cifras      → "2026"
  });

  // Si no se pasa onAvatarPress, por defecto navega a /profile
  const handleAvatarPress = onAvatarPress || (() => router.push("/profile"));

  return (
    // Le ponemos el color primario del tema como fondo.
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.primary }]}>
      {/* ── Contenedor principal: fila con nombre/fecha a la izquierda y avatar a la derecha ── */}
      <View style={styles.container}>
        {/* ── Bloque izquierdo: saludo + fecha ── */}
        <View style={styles.left}>
          {/* ── Texto del nombre del usuario (ej. "David") ── */}
          <Text style={[styles.greeting, { color: colors.contrastText }]}>
            {resolvedName}
          </Text>

          {/* ── Texto con la fecha formateada (ej. "13 de febrero de 2026") ── */}
          <Text style={[styles.date, { color: colors.contrastText }]}>
            {formatted}
          </Text>
        </View>

        {/* ── Bloque derecho: avatar pulsable ── */}
        {/* TouchableOpacity hace que al pulsar la imagen se vuelva semitransparente (feedback visual) */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          activeOpacity={0.8}
        >
          {/* ── Imagen del avatar (foto de perfil redonda) ── */}
          <Image source={{ uri: resolvedAvatarUri }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Estilos del componente Header, usando StyleSheet de React Native para mantener el código organizado y separado de la lógica.
const styles = StyleSheet.create({
  safe: {
    width: "100%", // ocupa el 100 % del ancho de la pantalla
  },

  container: {
    width: "100%", // ancho completo
    paddingHorizontal: 16, // margen interno a izquierda y derecha (16 px)
    paddingVertical: 12, // margen interno arriba y abajo (12 px)
    flexDirection: "row", // los hijos se colocan en fila (horizontal)
    alignItems: "center", // centrados verticalmente
    justifyContent: "space-between", // uno a cada extremo (izq ↔ der)
  },

  left: {
    flexDirection: "column", // los hijos se apilan en vertical
  },

  greeting: {
    fontSize: 18, // tamaño de letra 18
    fontWeight: "700", // negrita (700 = bold)
  },

  date: {
    fontSize: 12, // letra más pequeña que el saludo
    marginTop: 2, // pequeño espacio por encima para no pegarse al nombre
  },

  avatarContainer: {
    width: 44, // 44 px de ancho
    height: 44, // 44 px de alto (cuadrado)
    borderRadius: 22, // la mitad del ancho → círculo perfecto
    overflow: "hidden", // recorta lo que sobresalga del círculo
    backgroundColor: "#e5e7eb", // gris claro de fondo por si tarda en cargar la imagen
    alignItems: "center", // centra la imagen horizontalmente
    justifyContent: "center", // centra la imagen verticalmente
    borderWidth: 1, // borde de 1 px
    borderColor: "#d1d5db", // color del borde: gris suave
  },

  avatar: {
    width: "100%", // 100 % del ancho del contenedor padre
    height: "100%", // 100 % del alto del contenedor padre
  },
});
