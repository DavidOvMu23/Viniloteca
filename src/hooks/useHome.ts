import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";

export default function useHome() {
  // Usamos el router para movernos entre pantallas
  const router = useRouter();

  // Navegamos a Home (dejamos activo en la barra inferior)
  const goHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  // Abrimos la sección de clientes
  const goClients = useCallback(() => {
    router.push("/client");
  }, [router]);

  // Atajo para ir al login desde el avatar
  const goLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  // Definimos las pestañas inferiores con Home activo
  const navItems = useMemo<BottomNavItem[]>(
    () => [
      {
        icon: "home-outline",
        label: "Home",
        onPress: goHome,
        href: "/home",
        active: true,
      },
      { icon: "document-text-outline", label: "Pedidos" },
      {
        icon: "people-outline",
        label: "Clientes",
        onPress: goClients,
        href: "/client",
      },
      { icon: "cube-outline", label: "Inventario" },
    ],
    [goClients, goHome],
  );

  return {
    navItems,
    handleClientsPress: goClients,
    handleAvatarPress: goLogin,
  };
}
