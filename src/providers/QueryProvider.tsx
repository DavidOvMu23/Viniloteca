import { PropsWithChildren, useEffect } from "react";
import { AppState, Platform } from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cacheamos datos por 30s para evitar refetch innecesario (esto me lo ha recomendado el chat)
      staleTime: 30_000,
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  useEffect(function setupAppStateListener() {
    // En web no usamos AppState
    if (Platform.OS === "web") return;
    // En móvil, sincronizamos foco de React Query con el estado de la app
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
