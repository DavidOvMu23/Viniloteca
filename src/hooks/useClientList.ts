// este archivo carga datos con React Query, filtra, y navega a detalle.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";
import { useUserStore } from "src/stores/userStore";
import { type Cliente } from "src/types";
import { useClientsQuery } from "src/hooks/queries/useClientsQuery";

// esta funcion se encarga de gestionar la lógica de la pantalla de lista de clientes:
// carga los clientes del servidor, los filtra, maneja la navegación a detalle,
// y prepara los datos para la barra de navegación inferior.
export default function useClientList() {
  const router = useRouter(); // Para navegar entre pantallas (ir a detalle, volver atrás, etc.)

  const [items, setItems] = useState<Cliente[]>([]); // Lista local de clientes que se muestra en pantalla, filtrada para no incluir al propio usuario

  const [searchName, setSearchName] = useState(""); // Estado para el campo de búsqueda por nombre. Se actualiza al escribir en el input y se usa para filtrar la lista.

  // Usamos nuestro hook personalizado useClientsQuery para obtener la lista de clientes desde el servidor. Este hook maneja la consulta, el estado de carga, errores, etc.
  const {
    data: clientes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useClientsQuery();

  const user = useUserStore((state) => state.user); // Para saber quién es el usuario actual y qué permisos tiene (por ejemplo, para ocultar al propio usuario de la lista)

  const isAdmin = user?.roleName === "SUPERVISOR"; // Solo los supervisores pueden crear clientes, así que esta variable nos ayuda a mostrar/ocultar el botón de "Nuevo Cliente" y proteger la función de creación.

  // useEffect para sincronizar la lista de clientes cada vez que cambian los datos del servidor o el usuario actual.
  useEffect(
    function syncItems() {
      const nextItems = user?.id
        ? clientes.filter((c) => c.id !== user.id)
        : clientes;

      // Evitar actualizaciones de estado si la lista no cambió
      setItems((prev) => {
        if (prev.length !== nextItems.length) return nextItems;
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== nextItems[i].id) return nextItems;
        }
        return prev;
      });
    },
    [clientes, user?.id],
  );

  // useMemo para filtrar la lista de clientes según el nombre buscado. Se vuelve a calcular solo cuando cambian "items" o "searchName".
  const filteredItems = useMemo(() => {
    const query = searchName.trim().toLowerCase();
    // Si no hay búsqueda, devolvemos la lista completa
    if (!query) {
      return items;
    }

    // Si hay búsqueda, filtramos por nombre (ignorando mayúsculas/minúsculas)
    return items.filter((client) => {
      const fullName = client.full_name ?? "";
      return fullName.toLowerCase().includes(query);
    });
  }, [items, searchName]);

  // Función para actualizar el estado de búsqueda cuando el usuario escribe en el input. Se memoriza con useCallback para evitar que se cree una función nueva en cada renderizado.
  const handleSearchNameChange = useCallback((value: string) => {
    setSearchName(value);
  }, []);

  // useFocusEffect para volver a cargar la lista de clientes cada vez que la pantalla gana foco (por ejemplo, al volver desde el detalle o después de crear/editar un cliente).
  // Esto asegura que siempre veamos los datos más recientes.
  useFocusEffect(
    useCallback(
      function refetchOnFocus() {
        refetch();
      },
      [refetch],
    ),
  );

  // Función para abrir la pantalla de detalle de un cliente. Recibe el "id" del cliente y navega a su pantalla de detalle. Si el id es inválido, no hace nada.
  const goHome = useCallback(
    function goHome() {
      router.push("/reservas");
    },
    [router],
  );

  // Ir a la pantalla de Clientes (la actual, pero útil para la barra)
  const goClients = useCallback(
    function goClients() {
      router.push("/client");
    },
    [router],
  );

  // Ir a la pantalla de Discos
  const goDiscos = useCallback(
    function goDiscos() {
      router.push("/discos");
    },
    [router],
  );

  // Función para abrir la pantalla de detalle de un cliente. Recibe el "id" del cliente y navega a su pantalla de detalle. Si el id es inválido, no hace nada.
  const handleOpenClient = useCallback(
    function handleOpenClient(id: string) {
      // id llega desde el item pulsado en la lista
      if (!id) return;
      router.push(`/client/${id}`);
    },
    [router],
  );

  // Función para abrir la pantalla de creación de un nuevo cliente. Solo los admins pueden usar esta función, así que protegemos la navegación con una condición.
  const handleCreate = useCallback(
    function handleCreate() {
      // Solo admins ven/usan el FAB; protegemos también aquí
      if (!isAdmin) return;
      router.push("/client/new");
    },
    [isAdmin, router],
  );

  // useMemo para preparar los datos de la barra de navegación inferior. Se vuelve a calcular solo cuando cambian las funciones de navegación.
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
        active: true, // Este botón está activo porque estamos en Clientes
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

  // Finalmente, devolvemos todos los datos y funciones que la pantalla de lista de clientes necesita para funcionar correctamente: la lista filtrada, el estado de carga/error, las funciones de navegación, etc.
  return {
    items,
    filteredItems,
    searchName,
    handleSearchNameChange,
    isLoading,
    isError,
    error,
    navItems,
    handleOpenClient,
    handleCreate,
    canCreate: isAdmin,
  };
}
