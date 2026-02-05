import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, type ColorSchemeName } from "react-native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
  type MD3Theme,
} from "react-native-paper";

export type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "@myapp/theme-mode/v1";

// Paleta coral+jade pensada para un mood musical, cálido en claro y neón suave en oscuro
const palette = {
  light: {
    background: "#f9f7f2", // marfil cálido
    surface: "#ffffff",
    primary: "#ff6b6b", // coral punch
    secondary: "#2ac3a2", // jade/teal de acento
    muted: "#8c8f9a", // gris humo
    border: "#e7e3da",
    text: "#0f172a",
    contrastText: "#ffffff",
  },
  dark: {
    background: "#0c0f14", // navy ink
    surface: "#111722",
    primary: "#ff8fa3", // coral neon suave
    secondary: "#34d3b4", // jade brillante
    muted: "#a3adbd", // gris azulado
    border: "#1c2432",
    text: "#e7e9f2",
    contrastText: "#0c0f14",
  },
};

// Definimos el contexto y su tipo
interface ThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: "light" | "dark";
  isDark: boolean;
  colors: typeof palette.light;
  setMode: (mode: ThemeMode) => Promise<void>;
}

// Contexto para tema
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Función para resolver el esquema efectivo según preferencia y sistema
const resolveScheme = (
  mode: ThemeMode,
  system: ColorSchemeName,
): "light" | "dark" => {
  // Si el usuario eligió "system", delegamos en el esquema del SO; de lo contrario usamos el modo forzado
  if (mode === "system") {
    return system === "dark" ? "dark" : "light";
  }
  return mode;
};

// Proveedor de tema que envuelve la app
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  // Escuchamos cambios del tema del SO para adaptarnos en modo sistema
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  // Leemos preferencia guardada en AsyncStorage para restaurar la elección del usuario
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          // setModeState acepta directamente la preferencia persistida
          setModeState(stored);
        }
      })
      .catch(() => {
        // ignoramos errores de lectura
      });
  }, []);

  // Resolvemos el esquema efectivo y los colores correspondientes
  const resolvedScheme = resolveScheme(mode, systemScheme);
  const colors = palette[resolvedScheme];

  // Ajustamos el tema de react-native-paper para que coincida con nuestra paleta
  const paperTheme: MD3Theme = useMemo(() => {
    const base = resolvedScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background,
        surface: colors.surface,
        outline: colors.border,
        onBackground: colors.text,
        onSurface: colors.text,
      },
    } as MD3Theme;
  }, [colors, resolvedScheme]);

  // Guardamos la preferencia elegida y actualizamos estado
  const setMode = async (nextMode: ThemeMode) => {
    // Si el modo ya es el mismo, no hacemos nada
    if (nextMode === mode) return;
    // nextMode llega desde pantalla de preferencias; persistimos para futuras aperturas
    setModeState(nextMode);
    try {
      await AsyncStorage.setItem(THEME_KEY, nextMode);
    } catch {
      // Si falla el guardado, mantenemos el estado en memoria
    }
  };

  // Memoizamos el valor del contexto para evitar renders innecesarios
  const value = useMemo(
    () => ({
      mode,
      resolvedScheme,
      isDark: resolvedScheme === "dark",
      colors,
      setMode,
    }),
    [colors, mode, resolvedScheme],
  );

  // Proveemos el contexto y el tema de Paper a la app
  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}

// Hook para consumir el contexto de tema
export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemePreference debe usarse dentro de ThemeProvider");
  }
  return ctx;
}
