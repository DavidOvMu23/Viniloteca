import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "src/components/Header/header";
import CustomButton from "src/components/Buttons/button";
import BottomNav from "src/components/BottomNav/bottom_nav";
import { TextInput } from "react-native-paper";
import useNewClient from "src/hooks/useNewClient";

export default function NewClient() {
  // Obtenemos estado, validaciones y navegación desde el hook
  const {
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
  } = useNewClient();

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
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          left={<TextInput.Icon icon="account-outline" color="#6b7280" />}
        />

        {/* Escribimos el email y lo guardamos en `email` */}
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

        {/* Escribimos el teléfono y lo guardamos en `telefono` */}
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

        {/* Escribimos el NIF/CIF y lo guardamos en `nif` */}
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

        <View style={{ height: 16 }} />
        {/* Guardamos el nuevo cliente con los datos del formulario */}
        <CustomButton
          text="Guardar"
          disabled={isSaveDisabled}
          onPress={handleSave}
        />
        <View style={{ height: 12 }} />
        {/* Cancelamos y volvemos atrás */}
        <CustomButton text="Cancelar" onPress={handleCancel} />
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
});
