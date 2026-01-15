import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import { getClienteById, updateCliente } from "src/types";

export default function EditClient() {
  // Usamos el router para volver o salir
  const router = useRouter();
  // Leemos el id que llega en la URL
  const params = useLocalSearchParams<{ id?: string }>();
  const clientId = Number(params.id);

  // Guardamos el nombre para el título
  const [clientName, setClientName] = useState<string | null>(null);
  // Usamos esto para mostrar un estado de “no encontrado”
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
  const handleSave = () => {
    updateCliente(clientId, {
      nombre: nombre.trim(),
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      nifCif: nif.trim() || undefined,
    }).then(() => {
      router.back();
    });
  };

  if (notFound) {
    return (
      <View style={styles.container}>
        <Header name="Editar cliente" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Cliente no encontrado</Text>
          <Text style={styles.notFoundText}>
            Vuelve a la lista y selecciona otro cliente.
          </Text>
          <View style={{ height: 12 }} />
          <CustomButton text="Volver" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header name={`Editar ${clientName ?? "cliente"}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Datos del cliente</Text>
        <Text style={styles.subtitle}>
          Actualiza los campos y guarda para aplicar los cambios.
        </Text>

        {/* Editamos el nombre y lo guardamos en `nombre` */}
        <TextInput
          mode="outlined"
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
          outlineStyle={styles.outline}
          left={<TextInput.Icon icon="account-outline" color="#6b7280" />}
        />

        {/* Editamos el email y lo guardamos en `email` */}
        <TextInput
          mode="outlined"
          label="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          outlineStyle={styles.outline}
          left={<TextInput.Icon icon="email-outline" color="#6b7280" />}
        />

        {/* Editamos el teléfono y lo guardamos en `telefono` */}
        <TextInput
          mode="outlined"
          label="Teléfono"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
          style={styles.input}
          outlineStyle={styles.outline}
          left={<TextInput.Icon icon="phone-outline" color="#6b7280" />}
        />

        {/* Editamos el NIF/CIF y lo guardamos en `nif` */}
        <TextInput
          mode="outlined"
          label="NIF/CIF"
          value={nif}
          onChangeText={setNif}
          style={styles.input}
          outlineStyle={styles.outline}
          left={
            <TextInput.Icon
              icon="card-account-details-outline"
              color="#6b7280"
            />
          }
        />

        {/* Dejamos las acciones de guardar o cancelar */}
        <View style={styles.actions}>
          <CustomButton text="Guardar cambios" onPress={handleSave} />
          <View style={{ height: 10 }} />
          <CustomButton text="Cancelar" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7fb",
  },
  content: {
    padding: 16,
    paddingBottom: 80,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fafafa",
  },
  outline: {
    borderRadius: 12,
  },
  actions: {
    marginTop: 10,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  notFoundText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
});
