//este archivo define el layout para las pantallas protegidas, es decir, aquellas que solo pueden ver los usuarios logueados. Se encarga de verificar si el usuario está autenticado y mostrar un spinner mientras se comprueba la sesión. Si no está autenticado, redirige al login. Si lo está, muestra las pantallas hijas normalmente.

import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "src/providers/AuthProvider";
import { useThemePreference } from "src/providers/ThemeProvider";

// El layout protegido: actúa como guardián de las rutas privadas
export default function ProtectedLayout() {
  // Leemos el estado de autenticación
  const { status } = useAuth();
  // Leemos los colores del tema
  const { colors } = useThemePreference();

  // Si todavía estamos comprobando la sesión, mostramos un spinner
  if (status === "checking") {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Si el usuario NO está logueado, lo mandamos al login
  if (status === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  // Si está logueado, mostramos las pantallas protegidas normalmente
  return <Stack screenOptions={{ headerShown: false, animation: "none" }} />;
}

// Estilos: solo el contenedor centrado para el spinner
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
