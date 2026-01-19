import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { listClientes, type Cliente } from "src/types";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";

export default function useClientList() {
  // Usamos el router para movernos entre pantallas
  const router = useRouter();
  // Guardamos la lista de clientes que pintamos en la pantalla
  const [items, setItems] = useState<Cliente[]>([]);

  // Recargamos los clientes cuando volvemos a esta pantalla
  const loadClientes = useCallback(() => {
    let active = true;
    listClientes().then((data) => {
      if (active) setItems(data);
    });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(loadClientes);

  // Abrimos Home desde la barra inferior
  const goHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  // Dejamos Clientes activo en la barra inferior
  const goClients = useCallback(() => {
    router.push("/client");
  }, [router]);

  // Navegamos al detalle del cliente pulsado
  const handleOpenClient = useCallback(
    (id: number) => {
      router.push(`/client/${id}`);
    },
    [router],
  );

  // Atajo para crear un cliente nuevo
  const handleCreate = useCallback(() => {
    router.push("/client/new");
  }, [router]);

  // Definimos la barra inferior con Clientes activo
  const navItems = useMemo<BottomNavItem[]>(
    () => [
      {
        icon: "home-outline",
        label: "Home",
        onPress: goHome,
        href: "/home",
      },
      { icon: "document-text-outline", label: "Pedidos" },
      {
        icon: "people-outline",
        label: "Clientes",
        onPress: goClients,
        href: "/client",
        active: true,
      },
      { icon: "cube-outline", label: "Inventario" },
    ],
    [goClients, goHome],
  );

  return {
    items,
    navItems,
    handleOpenClient,
    handleCreate,
  };
}
