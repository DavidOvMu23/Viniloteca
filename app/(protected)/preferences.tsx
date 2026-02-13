import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Header from "src/components/Header/header";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav";
import { useUserStore } from "src/stores/userStore";
import {
  useThemePreference,
  type ThemeMode,
} from "src/providers/ThemeProvider";

export default function Preferences() {
  const { mode, resolvedScheme, setMode, colors, isDark } =
    useThemePreference();

  // Pestañas inferiores con Preferencias activa (Clientes sólo para ADMIN)
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.roleName === "ADMIN";

  const navItems = useMemo<BottomNavItem[]>(() => {
    const items: BottomNavItem[] = [
      { icon: "home-outline", label: "Inicio", href: "/home" },
      { icon: "disc-outline", label: "Discos", href: "/discos" },
    ];

    if (isAdmin) {
      items.push({
        icon: "people-outline",
        label: "Clientes",
        href: "/client",
      });
    }

    items.push(
      { icon: "person-circle-outline", label: "Perfil", href: "/profile" },
      {
        icon: "settings-outline",
        label: "Preferencias",
        href: "/preferences",
        active: true,
      },
    );

    return items;
  }, [isAdmin]);

  // Opciones disponibles de tema para alternar entre claro/oscuro/sistema
  const options: Array<{ label: string; value: ThemeMode; helper: string }> = [
    { label: "Claro", value: "light", helper: "Usa siempre colores claros" },
    {
      label: "Oscuro",
      value: "dark",
      helper: "Ideal en entornos con poca luz",
    },
    {
      label: "Sistema",
      value: "system",
      helper: "Se adapta automáticamente a iOS/Android",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header name="Preferencias" />

      {/* Tarjeta con selector de tema visual de la app */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Tema</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Elige cómo quieres ver la app.
        </Text>

        {options.map((opt) => {
          const active = mode === opt.value;
          // Cada tarjeta llama a setMode con el valor elegido y pinta estado activo
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.option,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active
                    ? `${colors.primary}14`
                    : colors.surface,
                },
              ]}
              onPress={() => setMode(opt.value)}
            >
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                {opt.label}
              </Text>
              <Text style={[styles.optionHelper, { color: colors.muted }]}>
                {opt.helper}
              </Text>
              {active ? (
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  Activo
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <BottomNav items={navItems} showFab={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  option: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  optionHelper: {
    fontSize: 13,
    color: "#6b7280",
  },
  badgeText: {
    fontWeight: "700",
    marginTop: 4,
  },
});
