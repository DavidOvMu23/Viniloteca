//este archivo define la pantalla de PERFIL, donde el usuario puede ver y editar su información personal (nombre, foto de perfil) y cerrar sesión. Es una pantalla protegida, solo accesible para usuarios logueados.

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import BottomNav from "src/components/BottomNav/bottom_nav";
import { type BottomNavItem } from "src/types";
import { useAuth } from "src/providers/AuthProvider";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useUserStore } from "src/stores/userStore";
import { pickImageFromLibrary } from "src/features/storage/pickImage";
import { updateUserDisplayName, uploadUserAvatar } from "src/services/profile";

// este archivo define la pantalla de perfil, donde el usuario puede ver y editar su información personal (nombre, foto de perfil) y cerrar sesión. Es una pantalla protegida, solo accesible para usuarios logueados.
function buildInitialAvatarUri(name: string) {
  const trimmedName = name.trim();
  const initial = trimmedName ? trimmedName[0].toUpperCase() : "U";
  return `https://ui-avatars.com/api/?background=E5E7EB&color=111827&size=256&name=${encodeURIComponent(initial)}`;
}

// esta funcion es la pantalla de perfil, donde el usuario puede ver y editar su información personal (nombre, foto de perfil) y cerrar sesión. Es una pantalla protegida, solo accesible para usuarios logueados.
export default function Profile() {
  const { user, logout, isBusy } = useAuth(); // Para obtener los datos del usuario actual y la función de cerrar sesión.

  const { colors, isDark } = useThemePreference(); // Para obtener los colores del tema actual y saber si es modo oscuro, para adaptar el diseño del perfil.

  const setUser = useUserStore((state) => state.setUser); // Para actualizar los datos del usuario en la store global después de editar su perfil (nombre o foto). Esto hace que el cambio se refleje en toda la app automáticamente.

  const [name, setName] = useState(user?.name ?? ""); // Estado local para el campo de nombre editable. Se inicializa con el nombre del usuario o cadena vacía si no hay usuario (caso raro, pero por seguridad).

  const [isUploading, setIsUploading] = useState(false); // Estado para controlar si se está subiendo una nueva foto de perfil, para mostrar un indicador de carga y evitar acciones repetidas.

  const [isSavingName, setIsSavingName] = useState(false); // Estado para controlar si se está guardando el nuevo nombre, para mostrar un indicador de carga y evitar acciones repetidas.

  const currentUser = useUserStore((s) => s.user); // Para obtener los datos del usuario actual desde la store global, lo que nos permite mostrar su nombre, email, rol y foto de perfil aunque no se pasen por props. También lo usamos para saber si el usuario es supervisor o normal y mostrar opciones según su rol.

  const isAdmin = currentUser?.roleName === "SUPERVISOR"; // Para saber si el usuario es supervisor (admin) o normal, lo que nos permite mostrar la pestaña de Clientes en la barra de navegación solo a los supervisores.

  // aquí construimos la lista de pestañas que se muestran en la barra de navegación inferior. Siempre mostramos Reservas, Discos, Perfil y Preferencias. Si el usuario es supervisor, añadimos Clientes.
  const navItems = useMemo<BottomNavItem[]>(() => {
    // Definimos las pestañas que se muestran en la barra de navegación inferior. Siempre mostramos Reservas, Discos, Perfil y Preferencias. Si el usuario es supervisor, añadimos Clientes.
    const items: BottomNavItem[] = [
      { icon: "calendar-outline", label: "Reservas", href: "/reservas" },
      { icon: "disc-outline", label: "Discos", href: "/discos" },
    ];

    // Si el usuario es admin, añadimos la pestaña de Clientes.
    if (isAdmin) {
      items.push({
        icon: "people-outline",
        label: "Clientes",
        href: "/client",
      });
    }

    // Siempre añadimos Perfil (marcado como activo) y Preferencias al final.
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

  // Si no hay usuario logueado (caso muy raro), mostramos un mensaje
  // en vez de la pantalla completa para evitar errores.
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header name="Perfil" />
        <View style={styles.content}>
          {/* Si no hay sesión, avisamos al usuario con un texto */}
          <Text style={styles.subtitle}>No hay sesión activa.</Text>
        </View>
      </View>
    );
  }

  const safeAvatarUrl = user.avatarUrl?.trim() || "";
  const currentName = user.name.trim();
  const nextName = name.trim();
  const hasNameChanged = nextName.length > 0 && nextName !== currentName;
  const isSaveDisabled = isSavingName || !hasNameChanged;

  // Cuando el usuario pulsa "Guardar", tomamos el nombre que escribió,
  // le quitamos espacios de más, y lo guardamos en el store global.
  // Si dejó el campo vacío, se queda con el nombre que ya tenía.
  const handleSave = async () => {
    if (isSaveDisabled) return;

    if (!nextName) {
      Alert.alert("Nombre inválido", "El nombre no puede estar vacío.");
      return;
    }

    try {
      setIsSavingName(true);
      const updated = await updateUserDisplayName({
        userId: user.id,
        fullName: nextName,
        fallbackEmail: user.email ?? "",
      });

      setUser(updated);
      setName(updated.name);
      Alert.alert("Listo", "Tu nombre se actualizó correctamente.");
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "No se pudo actualizar el nombre");
    } finally {
      setIsSavingName(false);
    }
  };

  // Flujo simplificado: el usuario pulsa "Cambiar foto", elige imagen y
  // la app la sube directamente sin pedir un segundo botón.
  const handleChangeAvatar = async () => {
    if (isUploading) return;

    try {
      const asset = await pickImageFromLibrary();
      if (!asset?.uri) return;

      setIsUploading(true);
      const updated = await uploadUserAvatar({
        userId: user.id,
        fileUri: asset.uri,
        fallbackEmail: user.email ?? "",
        fallbackName: user.name ?? "",
      });

      setUser(updated);
      Alert.alert("Listo", "Tu foto de perfil se actualizó correctamente.");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ?? "No se pudo actualizar la foto de perfil",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // La estructura es: cabecera → scroll con tarjetas → barra inferior.
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera con el título "Tu perfil" y la foto de avatar */}
      <Header name="Tu perfil" avatarUri={user.avatarUrl} />

      {/* Zona central con scroll para las tarjetas de contenido */}
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
            Cambia tu foto en un solo paso.
          </Text>

          {/* Fila con la foto a la izquierda y acción a la derecha */}
          <View style={styles.avatarRow}>
            <TouchableOpacity
              onPress={handleChangeAvatar}
              activeOpacity={0.8}
              disabled={isUploading}
            >
              <Image
                source={{
                  uri:
                    safeAvatarUrl ||
                    buildInitialAvatarUri(user.name ?? "Usuario"),
                }}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
            <View style={styles.avatarActions}>
              <CustomButton
                text={isUploading ? "Actualizando foto..." : "Cambiar foto"}
                onPress={handleChangeAvatar}
                disabled={isUploading}
              />
              {isUploading ? (
                <View style={styles.uploadRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.helperText, { color: colors.muted }]}>
                    Subiendo imagen...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.helperText, { color: colors.muted }]}>
                  Toca la foto o el botón para cambiarla.
                </Text>
              )}
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

          {/* Campo editable para el nombre */}
          <Text style={[styles.label, { color: colors.muted }]}>Nombre</Text>
          <TextInput
            mode="outlined"
            value={name}
            onChangeText={setName}
            outlineStyle={{ borderRadius: 10 }}
            style={{ backgroundColor: colors.surface }}
          />

          {/* Email (solo lectura, no se puede cambiar) */}
          <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.value, { color: colors.text }]}>
              {user.email}
            </Text>
          </View>
          {user.roleName !== "SUPERVISOR" ? (
            <Text style={[styles.helperText, { color: colors.muted }]}>
              Para cambiar el correo, contacta con un supervisor.
            </Text>
          ) : null}

          {/* Rol del usuario mostrado como insignia / badge */}
          {user.roleName === "SUPERVISOR" ? (
            <>
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
            </>
          ) : null}

          {/* Botón para guardar los cambios del nombre */}
          <View style={styles.actions}>
            <CustomButton
              text={isSavingName ? "Guardando..." : "Guardar"}
              onPress={handleSave}
              disabled={isSaveDisabled}
            />
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
            {/* Botón para cerrar sesión; muestra "Cerrando…" mientras trabaja */}
            <CustomButton
              text={isBusy ? "Cerrando..." : "Cerrar sesión"}
              onPress={logout}
            />
          </View>
        </View>
      </ScrollView>

      {/* Barra de navegación inferior con las pestañas */}
      <BottomNav items={navItems} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal: ocupa toda la pantalla (flex: 1)
  container: {
    flex: 1,
  },
  // Contenido con scroll: padding alrededor y espacio extra abajo para la barra
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Espacio para que la barra inferior no tape contenido
    gap: 12, // Separación entre tarjetas
  },
  // Contenido sin scroll (usado en el caso de "no hay sesión")
  content: {
    padding: 16,
  },
  // Tarjeta: caja redondeada con borde fino y espacio interior
  card: {
    padding: 16,
    borderRadius: 16, // Esquinas redondeadas
    borderWidth: 1, // Borde fino
    gap: 10, // Separación entre elementos internos
  },
  // Título dentro de una tarjeta
  title: {
    fontSize: 18,
    fontWeight: "700", // Negrita
  },
  // Subtítulo / descripción pequeña
  subtitle: {
    fontSize: 14,
    color: "#6b7280", // Gris medio (color por defecto, luego se sobreescribe)
  },
  // Etiqueta de campo (Nombre, Email, Rol…)
  label: {
    fontSize: 13,
    marginTop: 8,
  },
  // Valor mostrado (ej. el email del usuario)
  value: {
    fontSize: 15,
    fontWeight: "700",
  },
  // Contenedor de insignias (badges) en fila horizontal
  badges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  // Insignia individual (la pastillita del rol)
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999, // Totalmente redondeada (forma de pastilla)
    borderWidth: 1,
  },
  // Texto dentro de la insignia
  badgeText: {
    fontWeight: "700",
    color: "#111827",
  },
  // Fila del avatar: foto a la izquierda, botones a la derecha
  avatarRow: {
    flexDirection: "row", // Elementos en horizontal
    alignItems: "center", // Centrados verticalmente
    gap: 16,
    marginTop: 8,
  },
  // La imagen redonda del avatar
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42, // Mitad del ancho → círculo perfecto
    backgroundColor: "#e5e7eb", // Gris claro de fondo mientras carga
  },
  // Columna con los botones de avatar (elegir / subir)
  avatarActions: {
    flex: 1, // Ocupa el espacio restante
    gap: 8,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
  },
  // Fila de información (ej. email)
  infoRow: {
    paddingVertical: 6,
  },
  // Zona de botones de acción (Guardar, Cerrar sesión…)
  actions: {
    marginTop: 12,
    gap: 8,
  },
});
