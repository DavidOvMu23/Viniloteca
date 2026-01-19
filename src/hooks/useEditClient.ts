import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TextInput, type TextInputProps } from "react-native-paper";
import { getClienteById, updateCliente } from "src/types";

export default function useEditClient() {
  // Usamos el router para volver o salir
  const router = useRouter();
  // Leemos el id que llega en la URL
  const params = useLocalSearchParams<{ id?: string }>();
  const clientId = Number(params.id);

  // Guardamos el nombre para el título y un flag de no encontrado
  const [clientName, setClientName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Guardamos los estados del formulario que llegan de los inputs
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nif, setNif] = useState("");

  // Cargamos los datos del cliente para rellenar el formulario
  const loadClient = useCallback(async () => {
    const client = await getClienteById(clientId);
    if (!client) {
      setClientName(null);
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setClientName(client.nombre);
    setNombre(client.nombre ?? "");
    setEmail(client.email ?? "");
    setTelefono(client.telefono ?? "");
    setNif(client.nifCif ?? "");
  }, [clientId]);

  // Volvemos a cargar los datos si cambia el id
  useEffect(() => {
    if (Number.isNaN(clientId)) {
      setClientName(null);
      setNotFound(true);
      return;
    }
    void loadClient();
  }, [clientId, loadClient]);

  // Guardamos cambios y volvemos atrás
  const handleSave = useCallback(() => {
    updateCliente(clientId, {
      nombre: nombre.trim(),
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      nifCif: nif.trim() || undefined,
    }).then(() => {
      router.back();
    });
  }, [clientId, email, nif, nombre, router, telefono]);

  // Cancelamos y volvemos a la pantalla anterior
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // Compartimos estilos base para los TextInput
  const textInputProps: Pick<TextInputProps, "outlineStyle" | "style"> = {
    outlineStyle: { borderRadius: 12 },
    style: { backgroundColor: "#fafafa" },
  };

  return {
    notFound,
    clientName,
    nombre,
    email,
    telefono,
    nif,
    setNombre,
    setEmail,
    setTelefono,
    setNif,
    handleSave,
    handleCancel,
    textInputProps,
  };
}
