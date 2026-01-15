import React from "react";
import { Stack } from "expo-router";

// Envolvemos la app para que Expo Router maneje las pantallas
export default function Layout() {
  // Usamos un stack para navegar entre pantallas
  return <Stack screenOptions={{ headerShown: false }} />;
}
