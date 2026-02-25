// Este archivo define la pantalla de edición de clientes. Es el lugar donde el usuario
// puede cambiar el nombre, email y rol de un cliente existente. La lógica de esta
// pantalla está completamente contenida en el hook useEditClient, que se encarga de
// cargar los datos del cliente, gestionar los estados del formulario y enviar los
// cambios al servidor. Aquí solo nos preocupamos por mostrar la interfaz de usuario
// y conectar los campos con el hook.

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput } from "react-native-paper";
//  SelectRole componente para seleccionar rol (visible a admins).
import SelectRole from "src/components/Inputs/SelectRole";
//  Header cabecera reutilizable de la pantalla.
import Header from "src/components/Header/header";
//  CustomButton botones reutilizables para guardar/cancelar.
import CustomButton from "src/components/Buttons/button";
//  useEditClient hook que encapsula la lógica del formulario de edición.
import useEditClient from "src/hooks/useEditClient";
//  useThemePreference para obtener colores del tema.
import { useThemePreference } from "src/providers/ThemeProvider";

// Función para truncar la ID del cliente a una longitud máxima, agregando "..." al final si es demasiado larga. Esto se usa para mostrar la ID de forma más amigable en la pantalla de edición.
function truncateClientId(id: string, maxLength = 20) {
  if (!id) return "";
  const trimmed = id.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}...`;
}

// La pantalla EditClient muestra un formulario para editar los datos de un cliente existente.
export default function EditClient() {
  // ── Extraemos todo lo que necesitamos del hook useEditClient ──
  // Es como abrir una caja de herramientas y sacar cada herramienta por su nombre.
  const {
    notFound, // booleano: true si el cliente no existe en la base de datos
    isLoading, // booleano: true mientras se están descargando los datos del servidor
    isError, // booleano: true si hubo un error al descargar los datos
    error, // objeto con información del error (si lo hubo)
    clientName, // el nombre original del cliente (para mostrarlo en la cabecera)
    clientId,
    nombre, // valor actual del campo "Nombre" en el formulario
    email, // valor actual del campo "Email" en el formulario
    setNombre, // función para actualizar el valor de "nombre" cuando el usuario escribe
    setEmail, // función para actualizar el valor de "email"
    canEditEmail, // true si el usuario actual es SUPERVISOR
    handleSave, // función que envía los datos editados al servidor
    handleCancel, // función que descarta cambios y vuelve a la pantalla anterior
    textInputProps, // objeto con estilos y colores tematizados para los campos de texto
    iconColor, // color del icono que aparece a la izquierda de cada campo
    role,
    setRole,
  } = useEditClient();

  // Id del cliente (viene del hook)

  // Sacamos los colores del tema activo (background, text, muted…)
  const { colors } = useThemePreference();

  // Mientras el servidor responde, mostramos un mensaje de "Cargando cliente…"
  // para que el usuario sepa que la app está trabajando (como un relojito de arena).
  if (isLoading) {
    return (
      // Contenedor principal con el color de fondo del tema
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Cabecera con título fijo "Editar cliente" */}
        <Header name="Editar cliente" />
        {/* Caja centrada con el mensaje de carga */}
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Cargando cliente...</Text>
        </View>
      </View>
    );
  }

  // Si algo salió mal (sin internet, servidor caído…), mostramos el error
  // y un botón para volver atrás.
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Cabecera con título fijo */}
        <Header name="Editar cliente" />
        {/* Bloque centrado con el mensaje de error */}
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>No se pudo cargar</Text>
          {/* Mostramos el mensaje real del error si es un objeto Error,
              o un mensaje genérico si no lo es */}
          <Text style={styles.notFoundText}>
            {error instanceof Error
              ? error.message
              : "Revisa la conexión e inténtalo de nuevo."}
          </Text>
          {/* Pequeño espacio vertical de 12 píxeles */}
          <View style={{ height: 12 }} />
          {/* Botón "Volver" que ejecuta handleCancel para regresar */}
          <CustomButton text="Volver" onPress={handleCancel} />
        </View>
      </View>
    );
  }

  // Si la petición fue bien pero el id no corresponde a ningún cliente,
  // mostramos un aviso amigable y un botón para regresar a la lista.
  if (notFound) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Cabecera con título fijo */}
        <Header name="Editar cliente" />
        {/* Bloque centrado con aviso de "no encontrado" */}
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Cliente no encontrado</Text>
          <Text style={styles.notFoundText}>
            Vuelve a la lista y selecciona otro cliente.
          </Text>
          {/* Espacio vertical de 12 píxeles para separar texto del botón */}
          <View style={{ height: 12 }} />
          {/* Botón que usa handleCancel del hook para volver atrás */}
          <CustomButton text="Volver" onPress={handleCancel} />
        </View>
      </View>
    );
  }

  // Si llegamos aquí es que tenemos los datos del cliente listos para editar.
  return (
    // Contenedor principal que ocupa toda la pantalla con el fondo del tema
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera dinámica: muestra "Editar <nombre>" o "Editar cliente" si no hay nombre */}
      <Header name={`Editar ${clientName ?? "cliente"}`} />

      {/* ScrollView permite hacer scroll si los campos no caben en pantalla */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Título de sección ── */}
        <Text style={[styles.title, { color: colors.text }]}>
          Datos del cliente
        </Text>

        {/* ── Subtítulo con instrucciones breves ── */}
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Actualiza los campos y guarda para aplicar los cambios.
        </Text>

        {/* ── ID acortada ── */}
        {clientId ? (
          <Text style={[styles.idText, { color: colors.muted }]}>
            ID {truncateClientId(clientId)}
          </Text>
        ) : null}

        {/* El usuario escribe el nombre del cliente aquí.
            "value" muestra el valor actual; "onChangeText" lo actualiza al escribir. */}
        <TextInput
          mode="outlined"
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
          // textInputProps trae estilos y colores tematizados del hook
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          outlineColor={textInputProps.outlineColor}
          activeOutlineColor={textInputProps.activeOutlineColor}
          textColor={textInputProps.textColor}
          placeholderTextColor={textInputProps.placeholderTextColor}
          selectionColor={textInputProps.selectionColor}
          left={<TextInput.Icon icon="account-outline" color={iconColor} />}
        />

        {/* Campo para el correo electrónico. keyboardType="email-address"
            hace que el teclado del móvil muestre la @ más accesible. */}
        <TextInput
          mode="outlined"
          label="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={canEditEmail}
          placeholder="Sin email registrado"
          style={textInputProps.style}
          outlineStyle={textInputProps.outlineStyle}
          outlineColor={textInputProps.outlineColor}
          activeOutlineColor={textInputProps.activeOutlineColor}
          textColor={textInputProps.textColor}
          placeholderTextColor={textInputProps.placeholderTextColor}
          selectionColor={textInputProps.selectionColor}
          left={<TextInput.Icon icon="email-outline" color={iconColor} />}
        />

        {/* ── Selector de rol (solo visible para administradores) ── */}
        {canEditEmail ? <SelectRole value={role} onChange={setRole} /> : null}

        {/* Zona con los dos botones: guardar los cambios o cancelar y volver */}
        <View style={styles.actions}>
          {/* Botón principal: envía los datos editados al servidor */}
          <CustomButton text="Guardar cambios" onPress={handleSave} />
          {/* Pequeño espacio vertical de 10 píxeles entre ambos botones */}
          <View style={{ height: 10 }} />
          {/* Botón secundario: descarta cambios y vuelve a la pantalla anterior */}
          <CustomButton text="Cancelar" onPress={handleCancel} />
        </View>
      </ScrollView>
    </View>
  );
}

// StyleSheet.create genera un objeto de estilos optimizado por React Native.
// Es como una hoja de estilos CSS pero exclusiva para móviles.
const styles = StyleSheet.create({
  // Contenedor raíz de la pantalla
  container: {
    flex: 1, // Ocupa todo el espacio vertical disponible (como "height: 100%")
  },

  // Contenido interior del ScrollView (el formulario)
  content: {
    padding: 16, // Espacio interior de 16 píxeles por los cuatro lados
    paddingBottom: 80, // Extra abajo para que el último campo no quede tapado por la barra
    gap: 12, // Separación de 12 píxeles entre cada hijo (campo de texto, etc.)
  },

  // Título principal "Datos del cliente"
  title: {
    fontSize: 20, // Tamaño de la letra: 20 píxeles
    fontWeight: "700", // Negrita (700 = bold)
    color: "#111827", // Color gris muy oscuro (casi negro) – por defecto, el tema lo sobreescribe
  },

  // Subtítulo con las instrucciones "Actualiza los campos…"
  subtitle: {
    fontSize: 14, // Letra más pequeña que el título
    color: "#4b5563", // Gris medio – el tema lo sobreescribe
    marginBottom: 8, // Pequeño margen inferior para separar del primer campo
  },

  // Texto para la ID truncada
  idText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    fontFamily: undefined,
  },

  // Contenedor de los botones "Guardar cambios" y "Cancelar"
  actions: {
    marginTop: 10, // Pequeño margen superior para separarlos del último campo
  },

  // Contenedor centrado que usamos para los estados de carga / error / no encontrado
  notFound: {
    flex: 1, // Ocupa todo el espacio disponible
    alignItems: "center", // Centra los hijos horizontalmente
    justifyContent: "center", // Centra los hijos verticalmente
    padding: 24, // Espacio interior de 24 píxeles
  },

  // Título dentro de los estados de carga / error / no encontrado
  notFoundTitle: {
    fontSize: 18, // Tamaño medio de letra
    fontWeight: "700", // Negrita
    color: "#111827", // Gris muy oscuro
  },

  // Texto descriptivo debajo del título en los estados especiales
  notFoundText: {
    fontSize: 14, // Letra pequeña
    color: "#6b7280", // Gris suave
    marginTop: 6, // Pequeño margen superior
    textAlign: "center", // Texto centrado horizontalmente
  },
});
