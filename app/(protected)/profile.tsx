import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav";
import { useAuth } from "src/providers/AuthProvider";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useUserStore } from "src/stores/userStore";

// Pantalla de perfil de usuario con edición de nombre y cierre de sesión
export default function Profile() {
  const { user, logout, isBusy } = useAuth();
  const { colors, isDark } = useThemePreference();
  const updateUser = useUserStore((state) => state.updateUser);
  const [name, setName] = useState(user?.name ?? "");
  // Tabs inferiores con Perfil activo
  const navItems = useMemo<BottomNavItem[]>(
    () => [
      { icon: "home-outline", label: "Inicio", href: "/home" },
      { icon: "disc-outline", label: "Discos", href: "/discos" },
      { icon: "people-outline", label: "Clientes", href: "/client" },
      {
        icon: "person-circle-outline",
        label: "Perfil",
        href: "/profile",
        active: true,
      },
      { icon: "settings-outline", label: "Preferencias", href: "/preferences" },
    ],
    [],
  );

  // Si no hay usuario (es extraño q pase pero lo pongo mas q nada por evitar errores), mostramos mensaje
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header name="Perfil" />
        <View style={styles.content}>
          {/* Si no hay sesión, avisamos al usuario */}
          <Text style={styles.subtitle}>No hay sesión activa.</Text>
        </View>
      </View>
    );
  }

  // Guardamos los cambios en el store global
  const handleSave = () => {
    // Guardamos solo el nombre, el resto viene de la sesión mock
    updateUser({ name: name.trim() || user.name });
  };

  // Renderizamos la pantalla de perfil con edición de nombre y cierre de sesión
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Encabezado con avatar actual del usuario */}
      <Header name="Tu perfil" avatarUri={user.avatarUrl} />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Bloque principal para editar nombre y ver email/rol */}
        <Text style={[styles.title, { color: colors.text }]}>
          Información básica
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Actualiza tu nombre visible.
        </Text>
        {/* Campo de texto para editar el nombre */}
        <Text style={[styles.label, { color: colors.muted }]}>Nombre</Text>
        <TextInput
          mode="outlined"
          value={name}
          onChangeText={setName}
          // El valor vive en estado local y luego se persiste al store con handleSave
          outlineStyle={{ borderRadius: 10 }}
          style={{ backgroundColor: colors.surface }}
        />
        <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.value, { color: colors.text }]}>
            {user.email}
          </Text>
        </View>
        <Text style={[styles.label, { color: colors.muted }]}>Rol</Text>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              {
                borderColor: colors.primary,
                backgroundColor: isDark
                  ? "rgba(96,165,250,0.22)"
                  : colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isDark ? colors.text : colors.contrastText },
              ]}
            >
              {user.roleName}
            </Text>
          </View>
        </View>
        {/* Acciones para persistir cambios o cerrar sesión */}
        <View style={styles.actions}>
          <CustomButton text="Guardar" onPress={handleSave} />
          <View style={{ height: 10 }} />
          <CustomButton
            text={isBusy ? "Cerrando..." : "Cerrar sesión"}
            // logout viene del AuthProvider y limpia storage + store
            onPress={logout}
          />
        </View>
      </View>

      <BottomNav items={navItems} showFab={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  label: {
    fontSize: 13,
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontWeight: "700",
    color: "#111827",
  },
  infoRow: {
    paddingVertical: 6,
  },
  actions: {
    marginTop: 12,
    gap: 8,
  },
});
