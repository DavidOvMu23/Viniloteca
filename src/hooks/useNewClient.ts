import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { TextInput, type TextInputProps } from "react-native-paper";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useUserStore } from "src/stores/userStore";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "src/services/clientService";
import { clientsQueryKey } from "src/hooks/queries/queryKeys";

export default function useNewClient() {
  // Usamos el router para volver o ir al detalle
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.roleName === "ADMIN";
  const { colors, isDark } = useThemePreference();
  const queryClient = useQueryClient();
  // Guardamos los estados del formulario que vienen de los inputs
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nif, setNif] = useState("");

  // Bloqueamos el guardado si no hay nombre
  const isSaveDisabled = useMemo(() => !nombre.trim(), [nombre]);

  // Creamos el cliente con lo que escribimos en el formulario
  const handleSave = useCallback(
    async function handleSave() {
      // Si no es admin, ignoramos la acción aunque el botón estuviera oculto
      if (!isAdmin) return;
      try {
        const nuevo = await createClient({
          nombre: nombre.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          nifCif: nif.trim() || undefined,
          activo: true,
        });
        await queryClient.invalidateQueries({ queryKey: clientsQueryKey });
        router.replace(`/client/${nuevo.id}`);
      } catch (error) {
        Alert.alert(
          "No se pudo crear",
          error instanceof Error
            ? error.message
            : "No se pudo crear el cliente.",
        );
      }
    },
    [
      email,
      isAdmin,
      isSaveDisabled,
      nif,
      nombre,
      queryClient,
      router,
      telefono,
    ],
  );

  // Cancelamos y volvemos atrás
  const handleCancel = useCallback(
    function handleCancel() {
      router.back();
    },
    [router],
  );

  // Definimos la barra inferior con Clientes activo
  const goHome = useCallback(
    function goHome() {
      router.push("/home");
    },
    [router],
  );

  const goClients = useCallback(
    function goClients() {
      router.push("/client");
    },
    [router],
  );

  const goDiscos = useCallback(
    function goDiscos() {
      router.push("/discos");
    },
    [router],
  );

  const navItems = useMemo<BottomNavItem[]>(
    () => [
      {
        icon: "home-outline",
        label: "Home",
        onPress: goHome,
        href: "/home",
      },
      {
        icon: "disc-outline",
        label: "Discos",
        onPress: goDiscos,
        href: "/discos",
      },
      {
        icon: "people-outline",
        label: "Clientes",
        onPress: goClients,
        href: "/client",
        active: true,
      },
      { icon: "person-circle-outline", label: "Perfil", href: "/profile" },
      { icon: "settings-outline", label: "Preferencias", href: "/preferences" },
    ],
    [goClients, goDiscos, goHome],
  );

  useEffect(() => {
    // Guardia adicional: si no eres admin, redirigimos fuera de esta ruta
    if (isAdmin) return;
    router.replace("/client");
  }, [isAdmin, router]);

  // Compartimos estilos base para los TextInput, adaptados a tema para que no encandilen en oscuro
  const fieldBackground = isDark ? "#111b2a" : "#f8fafc";
  const placeholderColor = isDark ? "rgba(179,192,207,0.72)" : "#9ca3af";

  const textInputProps: Pick<
    TextInputProps,
    | "outlineStyle"
    | "style"
    | "outlineColor"
    | "activeOutlineColor"
    | "textColor"
    | "placeholderTextColor"
    | "selectionColor"
  > = {
    outlineStyle: { borderRadius: 12, borderColor: colors.border },
    style: { backgroundColor: fieldBackground },
    outlineColor: colors.border,
    activeOutlineColor: colors.primary,
    textColor: colors.text,
    placeholderTextColor: placeholderColor,
    selectionColor: `${colors.primary}99`,
  };

  return {
    nombre,
    email,
    telefono,
    nif,
    isSaveDisabled,
    navItems,
    setNombre,
    setEmail,
    setTelefono,
    setNif,
    handleSave,
    handleCancel,
    textInputProps,
    iconColor: placeholderColor,
    isAdmin,
  };
}
