import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, Alert, ScrollView } from "react-native";
import { TextInput } from "react-native-paper";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav";
import { useAuth } from "src/providers/AuthProvider";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useUserStore } from "src/stores/userStore";
import { pickImageFromLibrary } from "src/features/storage/pickImage";
import { uploadUserAvatar } from "src/services/profile";

// Pantalla de perfil de usuario con edición de nombre y cierre de sesión
export default function Profile() {
  const { user, logout, isBusy } = useAuth();
  const { colors, isDark } = useThemePreference();
  const updateUser = useUserStore((state) => state.updateUser);
  const setUser = useUserStore((state) => state.setUser);
  const [name, setName] = useState(user?.name ?? "");
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Tabs inferiores con Perfil activo (Clientes sólo para ADMIN)
  const currentUser = useUserStore((s) => s.user);
  const isAdmin = currentUser?.roleName === "ADMIN";

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
      {
        icon: "person-circle-outline",
        label: "Perfil",
        href: "/profile",
        active: true,
      },
      { icon: "settings-outline", label: "Preferencias", href: "/preferences" },
    );

    return items;
  }, [isAdmin]);

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

  const handlePickAvatar = async () => {
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;
      setSelectedUri(asset.uri);
    } catch (error) {
      Alert.alert("Error", "No se pudo acceder a la galería");
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedUri) return;

    setIsUploading(true);
    try {
      const updated = await uploadUserAvatar({
        userId: user.id,
        fileUri: selectedUri,
        fallbackEmail: user.email ?? "",
        fallbackName: user.name ?? "",
      });
      updateUser({ avatarUrl: updated.avatarUrl });
      setUser(updated);
      setSelectedUri(null);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ?? "No se pudo subir la imagen de perfil",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Renderizamos la pantalla de perfil con edición de nombre y cierre de sesión
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header name="Tu perfil" avatarUri={user.avatarUrl} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Foto de perfil
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Elige una imagen y súbela a tu cuenta.
          </Text>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: selectedUri ?? user.avatarUrl }}
              style={styles.avatarImage}
            />
            <View style={styles.avatarActions}>
              <CustomButton text="Elegir imagen" onPress={handlePickAvatar} />
              <CustomButton
                text={isUploading ? "Subiendo..." : "Subir avatar"}
                onPress={handleUploadAvatar}
                disabled={!selectedUri || isUploading}
              />
            </View>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Información básica
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Actualiza tu nombre visible.
          </Text>
          <Text style={[styles.label, { color: colors.muted }]}>Nombre</Text>
          <TextInput
            mode="outlined"
            value={name}
            onChangeText={setName}
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
          <View style={styles.actions}>
            <CustomButton text="Guardar" onPress={handleSave} />
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Sesión</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Gestiona tu acceso a la app.
          </Text>
          <View style={styles.actions}>
            <CustomButton
              text={isBusy ? "Cerrando..." : "Cerrar sesión"}
              onPress={logout}
            />
          </View>
        </View>
      </ScrollView>

      <BottomNav items={navItems} showFab={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  content: {
    padding: 16,
  },
  card: {
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#e5e7eb",
  },
  avatarActions: {
    flex: 1,
    gap: 8,
  },
  infoRow: {
    paddingVertical: 6,
  },
  actions: {
    marginTop: 12,
    gap: 8,
  },
});
