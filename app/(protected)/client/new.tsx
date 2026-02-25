// este archivo ES la pantalla "Nuevo cliente". Es el punto de entrada, lo que React Native ejecuta para mostrar esta pantalla.

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
//  Header componente para la cabecera de la pantalla.
import Header from "src/components/Header/header";
//  CustomButton botones reutilizables para guardar/cancelar.
import CustomButton from "src/components/Buttons/button";
//  BottomNav barra inferior de navegación.
import BottomNav from "src/components/BottomNav/bottom_nav";
import { TextInput } from "react-native-paper";
//  useNewClient hook que encapsula la lógica del formulario de creación.
import useNewClient from "src/hooks/useNewClient";
//  useThemePreference para obtener colores del tema.
import { useThemePreference } from "src/providers/ThemeProvider";

// Este componente es la pantalla para crear un nuevo cliente. Contiene un formulario con campos para el nombre, email, teléfono y NIF del cliente, y botones para guardar o cancelar. Solo los usuarios con rol de administrador pueden acceder a esta pantalla; si un usuario normal intenta entrar, verá un mensaje de restricción y un botón para volver atrás. La pantalla también incluye una cabecera con el título y una barra de navegación inferior. El diseño se adapta al tema claro/oscuro usando los colores del tema activo.
export default function NewClient() {
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
    isAdmin,
    iconColor,
  } = useNewClient();

  // Obtenemos los colores del tema activo (modo claro / oscuro)
  const { colors } = useThemePreference();

  if (!isAdmin) {
    return (
      // Contenedor principal con el color de fondo del tema
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Cabecera con el título de la pantalla */}
        <Header name="Nuevo cliente" />

        {/* Zona de contenido con el mensaje de restricción */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Solo los administradores pueden crear clientes.
          </Text>

          {/* Pequeño espacio vertical (12 píxeles) entre el texto y el botón */}
          <View style={{ height: 12 }} />

          {/* Botón para volver a la pantalla anterior */}
          <CustomButton text="Volver" onPress={handleCancel} />
        </View>
      </View>
    );
  }

  return (
    // Contenedor principal que ocupa toda la pantalla
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera superior con el título "Nuevo cliente" */}
      <Header name="Nuevo cliente" />

      {/* ScrollView: permite hacer scroll si el formulario no cabe en pantalla */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Título grande dentro del formulario */}
        <Text style={[styles.title, { color: colors.text }]}>
          Crear cliente
        </Text>

        {/* Subtítulo explicativo debajo del título */}
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Añade los datos básicos y guarda para crear el cliente.
        </Text>

        {/* CAMPO 1: Nombre del cliente                                      */}
        {/* El usuario escribe aquí y cada letra actualiza la variable        */}
        {/* "nombre" gracias a la función setNombre (como un walkie-talkie    */}
        {/* que avisa al estado de que algo cambió).                          */}
        <TextInput
          mode="outlined"
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
          // textInputProps agrupa estilos base y colores según el tema activo
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          outlineColor={textInputProps.outlineColor}
          activeOutlineColor={textInputProps.activeOutlineColor}
          textColor={textInputProps.textColor}
          placeholderTextColor={textInputProps.placeholderTextColor}
          selectionColor={textInputProps.selectionColor}
          // Icono de persona a la izquierda del campo
          left={<TextInput.Icon icon="account-outline" color={iconColor} />}
        />

        {/* CAMPO 2: Email del cliente                                       */}
        {/* keyboardType="email-address" hace que el teclado del móvil       */}
        {/* muestre la @ y el .com para que sea más fácil escribir correos.  */}
        <TextInput
          mode="outlined"
          label="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          outlineColor={textInputProps.outlineColor}
          activeOutlineColor={textInputProps.activeOutlineColor}
          textColor={textInputProps.textColor}
          placeholderTextColor={textInputProps.placeholderTextColor}
          selectionColor={textInputProps.selectionColor}
          // Icono de sobre (email) a la izquierda
          left={<TextInput.Icon icon="email-outline" color={iconColor} />}
        />

        {/* CAMPO 3: Teléfono del cliente                                    */}
        {/* keyboardType="phone-pad" muestra solo números y símbolos de      */}
        {/* teléfono en el teclado del móvil.                                */}
        <TextInput
          mode="outlined"
          label="Teléfono"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          outlineColor={textInputProps.outlineColor}
          activeOutlineColor={textInputProps.activeOutlineColor}
          textColor={textInputProps.textColor}
          placeholderTextColor={textInputProps.placeholderTextColor}
          selectionColor={textInputProps.selectionColor}
          // Icono de teléfono a la izquierda
          left={<TextInput.Icon icon="phone-outline" color={iconColor} />}
        />

        {/* CAMPO 4: NIF / CIF del cliente                                   */}
        {/* Es el número de identificación fiscal (como el DNI de una        */}
        {/* empresa o persona para temas de facturación).                     */}
        <TextInput
          mode="outlined"
          label="NIF/CIF"
          value={nif}
          onChangeText={setNif}
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          outlineColor={textInputProps.outlineColor}
          activeOutlineColor={textInputProps.activeOutlineColor}
          textColor={textInputProps.textColor}
          placeholderTextColor={textInputProps.placeholderTextColor}
          selectionColor={textInputProps.selectionColor}
          // Icono de carnet/tarjeta a la izquierda
          left={
            <TextInput.Icon
              icon="card-account-details-outline"
              color={iconColor}
            />
          }
        />

        {/* Espacio vertical de 16 píxeles antes de los botones */}
        <View style={{ height: 16 }} />

        {/* BOTÓN GUARDAR                                                    */}
        {/* Si isSaveDisabled es true (faltan datos), el botón aparece gris  */}
        {/* y no se puede pulsar. Cuando se pulsa, handleSave envía los      */}
        {/* datos a la base de datos.                                        */}
        <CustomButton
          text="Guardar"
          disabled={isSaveDisabled}
          onPress={handleSave}
        />

        {/* Espacio vertical de 12 píxeles entre Guardar y Cancelar */}
        <View style={{ height: 12 }} />

        {/* BOTÓN CANCELAR                                                   */}
        {/* Descarta los cambios y vuelve a la pantalla anterior.            */}
        <CustomButton text="Cancelar" onPress={handleCancel} />
      </ScrollView>

      {/* BARRA DE NAVEGACIÓN INFERIOR                                       */}
      {/* Muestra las pestañas (Inicio, Clientes, etc.) en la parte de abajo */}
      <BottomNav items={navItems} />
    </View>
  );
}

// Estilos del componente NewClient, usando StyleSheet de React Native para mantener el código organizado y separado de la lógica.
const styles = StyleSheet.create({
  // Contenedor principal de la pantalla
  container: {
    flex: 1, // Ocupa todo el alto disponible de la pantalla
  },

  // Zona de contenido (el formulario o el mensaje de restricción)
  content: {
    padding: 16, // Margen interior de 16 píxeles en todos los lados
    paddingBottom: 120, // Margen inferior extra para que no quede tapado por la barra de abajo
    gap: 10, // Espacio de 10 píxeles entre cada hijo (campo, botón, etc.)
  },

  // Estilo del título "Crear cliente"
  title: {
    fontSize: 20, // Tamaño de letra: 20 píxeles
    fontWeight: "700", // Negrita (700 = bold)
    color: "#111827", // Color de texto por defecto (gris muy oscuro, casi negro)
  },

  // Estilo del subtítulo explicativo
  subtitle: {
    fontSize: 14, // Tamaño de letra: 14 píxeles
    color: "#4b5563", // Gris medio para que destaque menos que el título
  },
});
