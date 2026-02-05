import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";
import { useUserStore } from "src/stores/userStore";
import { type Cliente } from "src/types";
import { useClientsQuery } from "src/hooks/queries/useClientsQuery";

export default function useClientList() {
  // Usamos el router para movernos entre pantallas
  const router = useRouter();
  // Guardamos la lista de clientes que pintamos en la pantalla
  const [items, setItems] = useState<Cliente[]>([]);
  const {
    data: clientes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useClientsQuery();
  // Leemos el usuario actual para permisos
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.roleName === "ADMIN";

  // Recargamos los clientes cuando volvemos a esta pantalla
  useEffect(
    function syncItems() {
      setItems(clientes);
    },
    [clientes],
  );

  useFocusEffect(
    useCallback(
      function refetchOnFocus() {
        refetch();
      },
      [refetch],
    ),
  );

  // Abrimos Home desde la barra inferior
  const goHome = useCallback(
    function goHome() {
      router.push("/home");
    },
    [router],
  );

  // Dejamos Clientes activo en la barra inferior
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

  // Navegamos al detalle del cliente pulsado
  const handleOpenClient = useCallback(
    function handleOpenClient(id: string) {
      // id llega desde el item pulsado en la lista
      if (!id) return;
      router.push(`/client/${id}`);
    },
    [router],
  );

  // Atajo para crear un cliente nuevo
  const handleCreate = useCallback(
    function handleCreate() {
      // Solo admins ven/usan el FAB; protegemos también aquí
      if (!isAdmin) return;
      router.push("/client/new");
    },
    [isAdmin, router],
  );

  // Definimos la barra inferior con Clientes activo
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
      {
        icon: "person-circle-outline",
        label: "Perfil",
        href: "/profile",
      },
      {
        icon: "settings-outline",
        label: "Preferencias",
        href: "/preferences",
      },
    ],
    [goClients, goDiscos, goHome],
  );

  return {
    items,
    isLoading,
    isError,
    error,
    navItems,
    handleOpenClient,
    handleCreate,
    canCreate: isAdmin,
  };
}
