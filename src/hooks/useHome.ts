import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";
import { useUserStore } from "src/stores/userStore";

export default function useHome() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const goHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  const goClients = useCallback(() => {
    router.push("/client");
  }, [router]);

  const goProfile = useCallback(() => {
    router.push("/profile");
  }, [router]);

  const goPreferences = useCallback(() => {
    router.push("/preferences");
  }, [router]);

  const goDiscos = useCallback(() => {
    router.push("/discos");
  }, [router]);

  const navItems = useMemo<BottomNavItem[]>(
    () => [
      {
        icon: "home-outline",
        label: "Inicio",
        onPress: goHome,
        href: "/home",
        active: true,
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
      },
      {
        icon: "person-circle-outline",
        label: "Perfil",
        onPress: goProfile,
        href: "/profile",
      },
      {
        icon: "settings-outline",
        label: "Preferencias",
        onPress: goPreferences,
        href: "/preferences",
      },
    ],
    [goClients, goDiscos, goHome, goPreferences, goProfile],
  );

  return {
    navItems,
    // Datos derivados para el header/card en Home
    displayName: user?.name ?? "Usuario",
    roleName: user?.roleName ?? "NORMAL",
    isAdmin: user?.roleName === "ADMIN",
    handleClientsPress: goClients,
    handleAvatarPress: goProfile,
    handlePreferencesPress: goPreferences,
  };
}
