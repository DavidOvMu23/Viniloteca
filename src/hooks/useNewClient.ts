import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { type TextInputProps } from "react-native-paper";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useUserStore } from "src/stores/userStore";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "src/services/clientService";
import { clientsQueryKey } from "src/hooks/queries/queryKeys";

export default function useNewClient() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.roleName === "SUPERVISOR";
  const { colors, isDark } = useThemePreference();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nif, setNif] = useState("");

  const isSaveDisabled = useMemo(() => !nombre.trim(), [nombre]);

  const handleSave = useCallback(
    async function handleSave() {
      if (!isAdmin) return;
      try {
        const nuevo = await createClient({
          full_name: nombre.trim(),
          email: email.trim() || undefined,
          avatar_url: undefined,
        });

        await queryClient.invalidateQueries({ queryKey: clientsQueryKey });
        Alert.alert("Cliente creado", `Se ha añadido ${nuevo.full_name}`);
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
    [isAdmin, nombre, email, queryClient, router],
  );

  const handleCancel = useCallback(
    function handleCancel() {
      router.back();
    },
    [router],
  );

  const goHome = useCallback(
    function goHome() {
      router.push("/reservas");
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
        icon: "calendar-outline",
        label: "Reservas",
        onPress: goHome,
        href: "/reservas",
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
    if (isAdmin) return;
    router.replace("/client");
  }, [isAdmin, router]);

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
