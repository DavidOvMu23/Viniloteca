// este archivo define el layout raíz de la aplicación. Es el punto de entrada que envuelve todas las pantallas con los providers de tema, autenticación y datos. También ajusta la barra de estado del móvil y configura el sistema de navegación entre pantallas (Stack). Cualquier cosa que pongamos aquí se aplicará a toda la app, como el fondo, la fuente o el sistema de navegación. Es como el marco general que sostiene toda la aplicación.

import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "src/providers/AuthProvider";
import { ThemeProvider } from "src/providers/ThemeProvider";
import { QueryProvider } from "src/providers/QueryProvider";

// La función del layout raíz. Todo lo que esté dentro se aplica a TODAS las pantallas.
export default function Layout() {
  return (
    // Capa 1: ThemeProvider — decide si los colores son claros u oscuros
    <ThemeProvider>
      {/* Capa 2: AuthProvider — comprueba si hay sesión guardada al arrancar */}
      <AuthProvider>
        {/* Capa 3: QueryProvider — prepara el sistema de caché de datos */}
        <QueryProvider>
          {/* Ajustamos el color de la barra superior del móvil automáticamente */}
          <StatusBar style="auto" />
          {/* Stack: el navegador de pantallas. headerShown: false oculta la barra nativa de título */}
          <Stack screenOptions={{ headerShown: false, animation: "none" }} />
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
