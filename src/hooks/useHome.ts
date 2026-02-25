// Este hook se encarga de preparar toda la información y funciones que la pantalla de Inicio (Home) necesita para funcionar.
// Aquí definimos la lógica de navegación, qué botones mostrar según el rol del usuario, y qué datos mostrar en el encabezado.

import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { type BottomNavItem } from "src/types";
import { useUserStore } from "src/stores/userStore";

// Esta es la función principal que exportamos. Es un hook personalizado que prepara todo lo necesario para la pantalla de Inicio.
export default function useHome() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  // Navegar a la pantalla de Reservas
  const goHome = useCallback(() => {
    router.push("/reservas");
  }, [router]);

  // Navegar a la pantalla de Clientes
  const goClients = useCallback(() => {
    router.push("/client");
  }, [router]);

  // Navegar a la pantalla de Perfil
  const goProfile = useCallback(() => {
    router.push("/profile");
  }, [router]);

  // Navegar a la pantalla de Preferencias
  const goPreferences = useCallback(() => {
    router.push("/preferences");
  }, [router]);

  // Navegar a la pantalla de Discos
  const goDiscos = useCallback(() => {
    router.push("/discos");
  }, [router]);

  // Aquí construimos la lista de botones para la barra de navegación inferior (BottomNav).
  const navItems = useMemo<BottomNavItem[]>(() => {
    // Empezamos con los botones que TODOS los usuarios ven:
    // "Reservas" y "Discos".
    const items: BottomNavItem[] = [
      {
        icon: "calendar-outline", // Icono de reservas
        label: "Reservas", // Texto que se muestra debajo
        onPress: goHome, // Qué hacer al tocarlo
        href: "/reservas", // Ruta de la pantalla
        active: true, // Está seleccionado por defecto
      },
      {
        icon: "disc-outline", // Icono de disco de vinilo
        label: "Discos",
        onPress: goDiscos,
        href: "/discos",
      },
    ];

    // Sólo mostramos la pestaña "Clientes" si el usuario
    // tiene rol SUPERVISOR. Un usuario normal
    // no necesita gestionar clientes, así que lo ocultamos.
    if (user?.roleName === "SUPERVISOR") {
      items.push({
        icon: "people-outline", // Icono de grupo de personas
        label: "Clientes",
        onPress: goClients,
        href: "/client",
      });
    }

    // Añadimos los botones de "Perfil" y "Preferencias"
    // que también son visibles para TODOS los usuarios.
    items.push(
      {
        icon: "person-circle-outline", // Icono de persona
        label: "Perfil",
        onPress: goProfile,
        href: "/profile",
      },
      {
        icon: "settings-outline", // Icono de engranaje
        label: "Preferencias",
        onPress: goPreferences,
        href: "/preferences",
      },
    );

    // Devolvemos la lista completa de botones ya armada.
    return items;
  }, [goClients, goDiscos, goHome, goPreferences, goProfile, user]);

  // Finalmente, devolvemos un objeto con toda la información y funciones que la pantalla de Inicio necesita:
  return {
    // La lista de botones para la barra de navegación inferior.
    navItems,

    // El nombre del usuario para mostrar en el encabezado. Si no tenemos un usuario, mostramos una cadena vacía.
    displayName: user?.name ?? "",

    // El rol del usuario para mostrar en el encabezado. Si no tenemos un usuario, asumimos que es "NORMAL".
    roleName: user?.roleName ?? "NORMAL",

    // Si el usuario es supervisor, mostramos un mensaje especial en el encabezado.
    isAdmin: user?.roleName === "SUPERVISOR",

    // Funciones para manejar la navegación al tocar los botones del encabezado o del menú.
    handleClientsPress: goClients,
    handleAvatarPress: goProfile,
    handlePreferencesPress: goPreferences,
  };
}
