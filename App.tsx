import React from "react";
import { ExpoRoot } from "expo-router";

// Entrada principal de la app: registra las rutas leyendo la carpeta app/
export default function App() {
  // Le digo a Expo Router dónde buscar las pantallas
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}
