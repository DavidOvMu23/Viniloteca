// Este archivo define la paleta de colores y el sistema de temas (claro/oscuro/sistema)

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Appearance nos permite preguntarle al teléfono si está en modo claro uoscuro, y también hacer cambios del tema en tiempo real.
import { Appearance, type ColorSchemeName } from "react-native";

import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
  type MD3Theme,
} from "react-native-paper";

import { type ThemeMode } from "src/types";

// Definimos las opciones de tema que el usuario puede elegir

// Clave para guardar la preferencia de tema en de forma persistente
const THEME_KEY = "@myapp/theme-mode/v1";

// Paletas de colores personalizadas para claro y oscuro
const palette = {
  light: {
    background: "#f9f7f2",
    surface: "#ffffff",
    primary: "#ff6b6b",
    muted: "#8c8f9a",
    border: "#e7e3da",
    text: "#0f172a",
    contrastText: "#ffffff",
  },

  dark: {
    background: "#0c0f14",
    surface: "#111722",
    primary: "#ff6b6b",
    muted: "#a3adbd",
    border: "#1c2432",
    text: "#e7e9f2",
    contrastText: "#0c0f14",
  },
};

// Esta interfaz define lo que el ThemeProvider va a compartir con toda la app a través del contexto
interface ThemeContextValue {
  mode: ThemeMode; // la selección actual del usuario ("light", "dark" o "system")

  resolvedScheme: "light" | "dark"; // el resultado final después de resolver "system" con el tema del teléfono

  isDark: boolean; // atajo para saber si estamos en modo oscuro (true) o claro (false)

  colors: typeof palette.light; // el tema activo

  setMode: (mode: ThemeMode) => Promise<void>; // función para cambiar la preferencia de tema
}

// Creamos el contexto de tema, que es como una "pizarra" donde el ThemeProvider va a escribir los valores del tema, y los demás componentes podrán leerlos.
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Función para resolver la preferencia del usuario con el tema del sistema
const resolveScheme = (
  mode: ThemeMode,
  system: ColorSchemeName,
): "light" | "dark" => {
  // Si el usuario eligió "system", devolvemos lo que el teléfono dice (dark o light).
  if (mode === "system") {
    return system === "dark" ? "dark" : "light";
  }
  return mode;
};

// funcion para guardar el tema de forma persistente
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  // Este estado guarda el tema que el sistema operativo tiene activo en cada momento.
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  //use Effect es para ejecutar tareas automáticas cuando el componente se monta o cuando cambian ciertas cosas. En este caso, lo usamos para escuchar cambios en el tema del sistema operativo.
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  // Cuando el componente se monta, intentamos cargar la preferencia guardada en AsyncStorage. Si no hay nada guardado, seguimos con "system" por defecto.
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          // La preferencia guardada es válida; la aplicamos como modo actual
          setModeState(stored);
        }
      })
      .catch(() => {
        // Si hay algún error leyendo la libreta, no pasa nada:
        // simplemente seguimos con el valor por defecto
      });
  }, []);

  // Usamos la función resolveScheme para traducir la preferencia del usuario
  const resolvedScheme = resolveScheme(mode, systemScheme);
  const colors = palette[resolvedScheme];

  // funcion para Construir el tema de react-native-paper (memorizado)
  const paperTheme: MD3Theme = useMemo(() => {
    // Elegimos el tema base según si estamos en oscuro o claro
    const base = resolvedScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
    // Devolvemos una copia del tema base con nuestros colores encima
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        surface: colors.surface,
        outline: colors.border,
        onBackground: colors.text,
        onSurface: colors.text,
      },
    } as MD3Theme;
  }, [colors, resolvedScheme]);

  // Función para cambiar la preferencia de tema
  const setMode = async (nextMode: ThemeMode) => {
    // Si el modo nuevo es igual al actual, no hacemos nada (ahorra trabajo)
    if (nextMode === mode) return;
    // Actualizamos el estado en memoria → la app cambia de colores al instante
    setModeState(nextMode);
    try {
      // Guardamos en la "libreta" para que sobreviva si cierran la app
      await AsyncStorage.setItem(THEME_KEY, nextMode);
    } catch {
      // Si falla el guardado (raro), al menos el cambio visual ya se aplicó
      // en memoria; simplemente no se recordará la próxima vez
    }
  };

  // Preparamos el valor que vamos a compartir en el contexto, memorizado para evitar renders innecesarios
  const value = useMemo(
    () => ({
      mode, // la preferencia del usuario ("light"/"dark"/"system")
      resolvedScheme, // el resultado final ("light" o "dark")
      isDark: resolvedScheme === "dark", // atajo: ¿estamos en oscuro?
      colors, // la caja de pinturas activa
      setMode, // función para cambiar la preferencia
    }),
    [colors, mode, resolvedScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}

export function useThemePreference() {
  // Leemos la pizarra del contexto de tema
  const ctx = useContext(ThemeContext);
  // Si no hay nada (undefined), significa que no estamos dentro del Provider
  if (!ctx) {
    throw new Error("useThemePreference debe usarse dentro de ThemeProvider");
  }
  // Devolvemos todo el contenido de la pizarra
  return ctx;
}
