import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav";
import { TextInput } from "react-native-paper";
import { createCliente } from "src/types";

export default function NewClient() {
  // Usamos el router para volver o ir al detalle
  const router = useRouter();
  // Guardamos los estados del formulario que vienen de los inputs
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nif, setNif] = useState("");
  // Bloqueamos el guardado si no hay nombre
  const isSaveDisabled = !nombre.trim();

  // Creamos el cliente con lo que escribimos en el formulario
  const handleSave = async () => {
    const nuevo = await createCliente({
      nombre: nombre.trim(),
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      nifCif: nif.trim() || undefined,
      activo: true,
    });
    router.replace(`/client/${nuevo.id}`);
  };

  // Definimos la barra inferior con Clientes activo
  const navItems: BottomNavItem[] = [
    {
      icon: "home-outline",
      label: "Home",
      onPress: () => router.push("/home"),
      href: "/home",
    },
    { icon: "document-text-outline", label: "Pedidos" },
    {
      icon: "people-outline",
      label: "Clientes",
      onPress: () => router.push("/client"),
      href: "/client",
      active: true,
    },
    { icon: "cube-outline", label: "Inventario" },
  ];

  return (
    <View style={styles.container}>
      <Header name="Nuevo cliente" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Crear cliente</Text>
        <Text style={styles.subtitle}>
          Añade los datos básicos y guarda para crear el cliente.
        </Text>

        {/* Escribimos el nombre y lo guardamos en `nombre` */}
        <TextInput
          mode="outlined"
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
          outlineStyle={styles.outline}
          left={<TextInput.Icon icon="account-outline" color="#6b7280" />}
        />

        {/* Escribimos el email y lo guardamos en `email` */}
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

        {/* Escribimos el teléfono y lo guardamos en `telefono` */}
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

        {/* Escribimos el NIF/CIF y lo guardamos en `nif` */}
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

        <View style={{ height: 16 }} />
        {/* Guardamos el nuevo cliente con los datos del formulario */}
        <CustomButton
          text="Guardar"
          disabled={isSaveDisabled}
          onPress={handleSave}
        />
        <View style={{ height: 12 }} />
        {/* Cancelamos y volvemos atrás */}
        <CustomButton text="Cancelar" onPress={() => router.back()} />
      </ScrollView>
      <BottomNav items={navItems} showFab={false} />
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
    paddingBottom: 120,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
  input: {
    backgroundColor: "#fafafa",
  },
  outline: {
    borderRadius: 12,
  },
});
