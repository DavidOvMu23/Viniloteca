import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "src/providers/AuthProvider";
import { ThemeProvider } from "src/providers/ThemeProvider";

// Envolvemos toda la aplicación con proveedores globales (tema + auth)
export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, animation: "none" }} />
      </AuthProvider>
    </ThemeProvider>
  );
}
