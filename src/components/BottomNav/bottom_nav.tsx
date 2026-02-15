//este archivo crea el componente BottomNav, que es la barra de navegación inferior de la app con las pestañas para ir a Inicio, Perfil, etc. Es un componente reutilizable que se puede usar en varias pantallas.

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { useThemePreference } from "src/providers/ThemeProvider";

export type BottomNavItem = {
  // El nombre del icono (por ejemplo "home", "person", "disc").
  icon: React.ComponentProps<typeof Ionicons>["name"];
  // El texto que aparece debajo del icono (por ejemplo "Inicio").
  label: string;
  // (Opcional) Función que se ejecuta al pulsar la pestaña.
  onPress?: () => void;
  // (Opcional) Si es true, la pestaña se muestra resaltada (la que está seleccionada).
  active?: boolean;
  // (Opcional) La ruta a la que navega al pulsarla (por ejemplo "/home").
  href?: Href;
};

interface Props {
  // Lista de pestañas que se mostrarán en la barra (cada una con su icono y texto).
  items: BottomNavItem[];
}

// El componente BottomNav muestra una barra de navegación fija en la parte inferior de la pantalla con varias pestañas (Inicio, Perfil, etc.). Cada pestaña puede tener un icono, un texto, una acción al pulsar y una ruta a la que navegar.
export default function BottomNav({ items }: Props) {
  // Obtenemos los colores del tema actual para usarlos en el diseño de la barra y las pestañas
  const { colors, isDark } = useThemePreference();

  // Definimos los colores para las pestañas activas e inactivas según el tema (claro u oscuro)
  const activeColor = isDark ? "#ffffff" : "#0f172a";
  const inactiveColor = isDark
    ? "rgba(255,255,255,0.58)"
    : "rgba(15,23,42,0.6)";

  return (
    <>
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.primary, borderColor: colors.border },
        ]}
      >
        {/* Recorremos cada pestaña y la dibujamos una por una */}
        {items.map((item) => {
          // Elegimos el color según si la pestaña está activa o no
          const color = item.active ? activeColor : inactiveColor;

          // Contenido visual de cada pestaña: icono arriba + texto abajo
          const content = (
            <View style={styles.tabItem}>
              {/* Icono de la pestaña (casita, persona, disco…) */}
              <Ionicons name={item.icon} size={24} color={color} />
              {/* Texto debajo del icono ("Inicio", "Perfil"…) */}
              <Text style={[styles.tabLabel, { color }]}>{item.label}</Text>
            </View>
          );

          // ── Caso 1: la pestaña tiene una ruta href ──
          if (item.href) {
            return (
              <Link key={item.label} href={item.href} asChild>
                <TouchableOpacity activeOpacity={0.7} style={{ flex: 1 }}>
                  {content}
                </TouchableOpacity>
              </Link>
            );
          }

          // ── Caso 2: la pestaña tiene una función onPress ──
          return (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={{ flex: 1 }}
            >
              {content}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

// Estilos del componente BottomNav, usando StyleSheet de React Native para mantener el código organizado y separado de la lógica.
const styles = StyleSheet.create({
  // Estilo de la barra inferior completa
  tabBar: {
    position: "absolute", // Se queda fija en la pantalla, no se mueve al hacer scroll
    left: 0, // Pegada al borde izquierdo
    right: 0, // Pegada al borde derecho
    bottom: 0, // Pegada al borde inferior
    height: 82, // Altura de la barra en píxeles
    borderTopWidth: 1, // Línea finita arriba de la barra como separador
    flexDirection: "row", // Las pestañas se colocan en fila (horizontal)
    alignItems: "center", // Centradas verticalmente dentro de la barra
    justifyContent: "space-evenly", // Repartidas equitativamente en el espacio
    borderTopLeftRadius: 18, // Esquina superior izquierda redondeada
    borderTopRightRadius: 18, // Esquina superior derecha redondeada
    paddingBottom: 12, // Un poco de espacio extra abajo (para móviles con muesca)
  },
  // Estilo de cada pestaña individual (icono + texto)
  tabItem: {
    alignItems: "center", // Icono y texto centrados horizontalmente
    justifyContent: "center", // Centrados verticalmente
    gap: 2, // Pequeño espacio entre el icono y el texto
    flex: 1, // Cada pestaña ocupa el mismo ancho
  },
  // Estilo del texto debajo de cada icono
  tabLabel: {
    fontSize: 12, // Tamaño de letra pequeñito
  },
});
