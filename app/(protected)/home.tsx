import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomButton from "src/components/Buttons/button";
import Header from "src/components/Header/header";
import BottomNav from "src/components/BottomNav/bottom_nav";
import useHome from "src/hooks/useHome";
import { useUserStore } from "src/stores/userStore";
import { useThemePreference } from "src/providers/ThemeProvider";

// me ha ayudado el chat por q era una fumada
export default function Home() {
  const user = useUserStore(function selectUser(state) {
    return state.user;
  });
  const {
    navItems,
    handleAvatarPress,
    handleClientsPress,
    handlePreferencesPress,
    displayName,
    roleName,
    isAdmin,
  } = useHome();
  const { colors, isDark } = useThemePreference();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera con avatar y saludo dinámico */}
      <Header
        name={`Hola ${displayName}!`}
        onAvatarPress={handleAvatarPress}
        avatarUri={user?.avatarUrl}
      />

      {/* Tarjeta de resumen rápido del usuario y su rol */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Resumen</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Tu sesión está activa.
        </Text>
        {/* Mostramos datos que vienen del store global: rol y correo */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.muted }]}>Rol</Text>
          <Text style={[styles.value, { color: colors.text }]}>{roleName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.muted }]}>Nombre</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {user?.name}
          </Text>
        </View>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isAdmin
                  ? isDark
                    ? "rgba(52,211,153,0.16)"
                    : "#e8f9f1"
                  : isDark
                    ? "rgba(59,130,246,0.16)"
                    : "#e3edff",
                borderColor: isAdmin ? "#34d399" : colors.primary,
              },
            ]}
          >
            {/* Badge que depende de isAdmin para comunicar el nivel de acceso */}
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {isAdmin ? "Acceso de administrador" : "Acceso estándar"}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark ? "rgba(139,155,176,0.16)" : "#eef2ff",
                borderColor: isDark ? colors.border : "#c7d2fe",
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.text }]}>
              Tema personalizado
            </Text>
          </View>
        </View>
      </View>

      {/* Acciones principales de la pantalla de inicio */}
      <View style={styles.actions}>
        <CustomButton text="Clientes" onPress={handleClientsPress} />
        <View style={{ height: 12 }} />
        <CustomButton text="Perfil" onPress={handleAvatarPress} />
        <View style={{ height: 12 }} />
        <CustomButton text="Preferencias" onPress={handlePreferencesPress} />
      </View>

      {/* Barra inferior con navegación y FAB solo para admins */}
      <BottomNav
        items={navItems}
        showFab={isAdmin}
        onFabPress={handleClientsPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  messageBox: {
    marginHorizontal: 16,
    marginTop: 4,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  messageText: {
    fontSize: 14,
    marginTop: 4,
  },
});
