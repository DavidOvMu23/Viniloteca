import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput } from "react-native-paper";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import useEditClient from "src/hooks/useEditClient";

export default function EditClient() {
  // Obtenemos carga, estado del formulario y navegación desde el hook
  const {
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
  } = useEditClient();

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
          <CustomButton text="Volver" onPress={handleCancel} />
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
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          left={<TextInput.Icon icon="account-outline" color="#6b7280" />}
        />

        {/* Editamos el email y lo guardamos en `email` */}
        <TextInput
          mode="outlined"
          label="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          left={<TextInput.Icon icon="email-outline" color="#6b7280" />}
        />

        {/* Editamos el teléfono y lo guardamos en `telefono` */}
        <TextInput
          mode="outlined"
          label="Teléfono"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          left={<TextInput.Icon icon="phone-outline" color="#6b7280" />}
        />

        {/* Editamos el NIF/CIF y lo guardamos en `nif` */}
        <TextInput
          mode="outlined"
          label="NIF/CIF"
          value={nif}
          onChangeText={setNif}
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
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
          <CustomButton text="Cancelar" onPress={handleCancel} />
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
