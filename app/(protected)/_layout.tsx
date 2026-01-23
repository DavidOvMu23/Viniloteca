import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "src/providers/AuthProvider";
import { useThemePreference } from "src/providers/ThemeProvider";

// Blindamos las rutas privadas: si la sesión no está lista, mostramos loading o mandamos al login

export default function ProtectedLayout() {
  const { status } = useAuth();
  const { colors } = useThemePreference();

  // Si el estado de auth está comprobándose, mostramos un loader
  if (status === "checking") {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Si el usuario no está autenticado, lo mandamos al login
  if (status === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  // Si está autenticado, mostramos las pantallas protegidas
  return <Stack screenOptions={{ headerShown: false, animation: "none" }} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
