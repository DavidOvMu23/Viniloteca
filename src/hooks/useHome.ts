import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";
import { useUserStore } from "src/stores/userStore";

export default function useHome() {
  const router = useRouter();
  // Leemos el usuario actual desde el store
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

  const navItems = useMemo<BottomNavItem[]>(() => {
    const items: BottomNavItem[] = [
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
    ];

    // Sólo mostramos la pestaña "Clientes" a ADMIN
    if (user?.roleName === "ADMIN") {
      items.push({
        icon: "people-outline",
        label: "Clientes",
        onPress: goClients,
        href: "/client",
      });
    }

    items.push(
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
    );

    return items;
  }, [goClients, goDiscos, goHome, goPreferences, goProfile, user]);

  return {
    navItems,
    // Datos derivados para el header/card en Home
    displayName: user?.name ?? "Usuario",
    roleName: user?.roleName ?? "NORMAL",
    // Para compatibilidad con la UI existente usamos `isAdmin`,
    // pero ahora significa `ADMIN` en la DB
    isAdmin: user?.roleName === "ADMIN",
    handleClientsPress: goClients,
    handleAvatarPress: goProfile,
    handlePreferencesPress: goPreferences,
  };
}
