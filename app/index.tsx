// Este es el punto de entrada de la aplicación. Es el primer archivo que se ejecuta al abrir la app.

import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "src/providers/AuthProvider";
import { useThemePreference } from "src/providers/ThemeProvider";

// La función Index es el componente principal que se renderiza al abrir la app. Se encarga de decidir a qué pantalla enviar al usuario según su estado de autenticación (logueado o no) y muestra un spinner mientras se verifica la sesión guardada. Es como el "portero" que decide si el usuario puede entrar al "vestíbulo" de la app o si debe ir a la "puerta de login".
export default function Index() {
  const { status } = useAuth();
  const { colors } = useThemePreference();

  // Mientras se comprueba si hay sesión guardada, mostramos un spinner
  if (status === "checking") {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Si el usuario ya está logueado, lo mandamos directo al inicio
  if (status === "authenticated") {
    return <Redirect href="/reservas" />;
  }

  // Si no está logueado, lo mandamos a la pantalla de login
  return <Redirect href="/login" />;
}

// Estilos: solo necesitamos centrar el spinner en la pantalla
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
