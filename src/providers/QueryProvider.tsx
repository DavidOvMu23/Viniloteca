// Este archivo configura el sistema de caché de datos de React
// Query para toda la app.

import { PropsWithChildren, useEffect } from "react";
import { AppState, Platform } from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";

// Creamos una instancia del QueryClient con opciones por defecto.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 30_000 → los datos se consideran frescos durante
      // 30 000 milisegundos (30 segundos). Mientras estén frescos,
      // React Query no vuelve a pedirlos al servidor.
      staleTime: 30_000,
    },
  },
});

// Componente QueryProvider
// Recibe "children" (las pantallas hijas de la app) y las envuelve
// con el QueryClientProvider para que todas puedan usar React Query.
export function QueryProvider({ children }: PropsWithChildren) {
  // este código se ejecuta una sola vez cuando el
  // componente aparece en pantalla (la app se inicia).
  useEffect(function setupAppStateListener() {
    const subscription = AppState.addEventListener(
      "change",
      function onChange(status) {
        focusManager.setFocused(status === "active");
      },
    );
    return function cleanup() {
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
