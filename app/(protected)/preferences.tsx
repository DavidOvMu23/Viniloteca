// este archivo define la pantalla de PREFERENCIAS, donde el usuario puede elegir el tema visual de la app (claro, oscuro o sistema). También muestra la barra de navegación inferior con las pestañas correspondientes al rol del usuario.

import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
//  Header componente de cabecera reutilizable.
import Header from "src/components/Header/header";
//  BottomNav barra inferior de navegación.
import BottomNav from "src/components/BottomNav/bottom_nav";
//  BottomNavItem tipo para construir la lista de pestañas.
import { type BottomNavItem } from "src/types";
//  useUserStore para leer el usuario y decidir si mostrar pestaña Clientes.
import { useUserStore } from "src/stores/userStore";
//  useThemePreference para leer y cambiar el tema (setMode).
import { useThemePreference } from "src/providers/ThemeProvider";
//  ThemeMode tipo para las opciones de tema disponibles.
import { type ThemeMode } from "src/types";

export default function Preferences() {
  // Obtenemos las funciones y valores relacionados con el tema visual de la app desde el ThemeProvider. Esto nos permite leer el tema actual (mode) y cambiarlo (setMode) cuando el usuario selecciona una opción.
  const { mode, resolvedScheme, setMode, colors, isDark } =
    useThemePreference();

  // Leemos el usuario actual de la "tienda" (store) global.
  // Si su rol es "SUPERVISOR", le mostraremos la pestaña de "Clientes" en la
  // barra inferior; si no, esa pestaña se oculta.
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.roleName === "SUPERVISOR";

  // useMemo memoriza la lista de pestañas para que no se recalcule cada vez
  // que la pantalla se redibuja. Solo se recalcula si cambia "isAdmin".
  const navItems = useMemo<BottomNavItem[]>(() => {
    // Empezamos siempre con Reservas y Discos
    const items: BottomNavItem[] = [
      { icon: "calendar-outline", label: "Reservas", href: "/reservas" },
      { icon: "disc-outline", label: "Discos", href: "/discos" },
    ];

    // Si el usuario es administrador, añadimos la pestaña de Clientes
    if (isAdmin) {
      items.push({
        icon: "people-outline",
        label: "Clientes",
        href: "/client",
      });
    }

    // Siempre añadimos Perfil y Preferencias al final.
    // "active: true" marca Preferencias como la pestaña seleccionada.
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

  // Definimos las tres opciones que el usuario puede elegir.
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
      helper:
        "Se adapta automaticamente a la configuración del tema del dispositivo",
    },
  ];

  return (
    // Contenedor principal que ocupa toda la pantalla con el color de fondo del tema
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera superior con el título "Preferencias" */}
      <Header name="Preferencias" />

      {/* Tarjeta (card) que contiene el selector de tema visual de la app */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Título de la sección dentro de la tarjeta */}
        <Text style={[styles.title, { color: colors.text }]}>Tema</Text>

        {/* Subtítulo explicativo debajo del título */}
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Elige cómo quieres ver la app.
        </Text>

        {/* Recorremos las 3 opciones (Claro, Oscuro, Sistema) y por cada una
            dibujamos un botón-tarjeta que el usuario puede tocar */}
        {options.map((opt) => {
          // Comprobamos si esta opción es la que está activa actualmente
          const active = mode === opt.value;

          // Cada tarjeta llama a setMode con el valor elegido y pinta el
          // estado activo (borde y fondo resaltados) si corresponde
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.option,
                {
                  // Si está activa, el borde se pinta con el color primario;
                  // si no, con el color de borde normal del tema.
                  borderColor: active ? colors.primary : colors.border,
                  // Si está activa, un fondo semitransparente del color primario;
                  // si no, el fondo normal de la superficie.
                  backgroundColor: active
                    ? `${colors.primary}14`
                    : colors.surface,
                },
              ]}
              // Al pulsar, cambiamos el tema al valor de esta opción
              onPress={() => setMode(opt.value)}
            >
              {/* Nombre de la opción (ej: "Claro") */}
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                {opt.label}
              </Text>

              {/* Descripción corta de la opción */}
              <Text style={[styles.optionHelper, { color: colors.muted }]}>
                {opt.helper}
              </Text>

              {/* Si esta opción es la activa, mostramos una etiqueta "Activo" */}
              {active ? (
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  Activo
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Barra de navegación inferior con las pestañas de la app. */}
      <BottomNav items={navItems} />
    </View>
  );
}
// Estilos del componente Preferences, usando StyleSheet de React Native para mantener el código organizado y separado de la lógica.
const styles = StyleSheet.create({
  // Contenedor principal: ocupa toda la pantalla (flex: 1)
  container: {
    flex: 1,
  },
  // Tarjeta del selector de tema: con margen, relleno, esquinas redondeadas
  // y un borde fino
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  // Título grande dentro de la tarjeta
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  // Subtítulo más pequeño y de color gris
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  // Cada opción de tema: con borde, esquinas redondeadas y un poco de espacio
  option: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 4,
  },
  // Título de cada opción (ej: "Claro", "Oscuro")
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Texto de ayuda debajo del título de cada opción
  optionHelper: {
    fontSize: 13,
    color: "#6b7280",
  },
  // Etiqueta "Activo" que aparece en la opción seleccionada
  badgeText: {
    fontWeight: "700",
    marginTop: 4,
  },
});
