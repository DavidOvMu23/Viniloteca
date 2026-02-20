// Este archivo es el punto de entrada de nuestra aplicación. Es el primer código que se ejecuta cuando la app arranca.
// Por eso, aquí configuramos cosas globales como la navegación (rutas) y las fuentes.

import React from "react";
import { ExpoRoot } from "expo-router";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  // Cargamos las fuentes de Ionicons (para los íconos)
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  // Con esto le indicamos a Expo en que directorio buscar las pantallas
  const ctx = (require as any).context("./app");

  // Le pasamos a expo la variable ctx que contiene toda la info de las pantallas
  return <ExpoRoot context={ctx} />;
}
