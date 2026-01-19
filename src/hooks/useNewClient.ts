import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { TextInput, type TextInputProps } from "react-native-paper";
import { createCliente } from "src/types";
import { type BottomNavItem } from "src/components/BottomNav/bottom_nav";

export default function useNewClient() {
  // Usamos el router para volver o ir al detalle
  const router = useRouter();
  // Guardamos los estados del formulario que vienen de los inputs
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nif, setNif] = useState("");

  // Bloqueamos el guardado si no hay nombre
  const isSaveDisabled = useMemo(() => !nombre.trim(), [nombre]);

  // Creamos el cliente con lo que escribimos en el formulario
  const handleSave = useCallback(async () => {
    const nuevo = await createCliente({
      nombre: nombre.trim(),
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      nifCif: nif.trim() || undefined,
      activo: true,
    });
    router.replace(`/client/${nuevo.id}`);
  }, [email, nif, nombre, router, telefono]);

  // Cancelamos y volvemos atrás
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // Definimos la barra inferior con Clientes activo
  const goHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  const goClients = useCallback(() => {
    router.push("/client");
  }, [router]);

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

  // Compartimos estilos base para los TextInput
  const textInputProps: Pick<TextInputProps, "outlineStyle" | "style"> = {
    outlineStyle: { borderRadius: 12 },
    style: { backgroundColor: "#fafafa" },
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
  };
}
