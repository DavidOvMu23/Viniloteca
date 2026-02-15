// Aquí el usuario crea su cuenta rellenando nombre, email,
// contraseña y confirmación. Cuando el registro es exitoso,
// se le redirige automáticamente al login.

import React, { useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import TextfieldEmail from "../src/hooks/login/Textfield/textfield_email";
import TextfieldPassword from "../src/hooks/login/Textfield/textfield_password";
import TextButton from "../src/components/Buttons/text_button";
import Button from "../src/components/Buttons/button";
import useSignup from "../src/hooks/useSignup";
import { useThemePreference } from "src/providers/ThemeProvider";

// La pantalla de registro
export default function Signup() {
  // Router para movernos entre pantallas
  const router = useRouter();

  // Obtenemos todo lo que necesitamos del hook useSignup, que es el "cerebro" de esta pantalla.
  const {
    fullName,
    email,
    password,
    confirmPassword,
    isBusy,
    error,
    success,
    isSignupDisabled,
    handleFullNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  } = useSignup();

  // Colores del tema y si estamos en modo oscuro
  const { colors, isDark } = useThemePreference();
  // Color de fondo de los campos de texto según el tema
  const fieldBackground = isDark ? "#111b2a" : "#f8fafc";
  // Color del texto "placeholder" (texto gris que aparece antes de escribir)
  const placeholderColor = isDark ? "rgba(179,192,207,0.72)" : "#9ca3af";

  // Función para ir a la pantalla de login
  function handleGoLogin() {
    router.replace("/login");
  }

  // useEffect para redirigir al login automáticamente cuando el registro es exitoso
  useEffect(() => {
    if (success) {
      router.replace("/login");
    }
  }, [router, success]);

  // Renderizamos la pantalla de registro. Incluye el logo, título, formulario, mensajes de error/éxito y enlace al login.
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo de La Viniloteca — cambia según modo claro/oscuro */}
      <View style={{ alignItems: "center", width: "100%", marginTop: 32 }}>
        <Image
          source={
            isDark
              ? require("../assets/logo-oscuro.png")
              : require("../assets/logo-claro.png")
          }
          style={{
            width: 175,
            height: 175,
            resizeMode: "contain",
            marginBottom: 8,
          }}
          accessibilityLabel="Logo de La Viniloteca"
        />
      </View>

      {/* Título y subtítulo */}
      <Text style={[styles.title, { color: colors.text }]}>Crear cuenta</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Completa los datos para registrarte
      </Text>

      {/* Formulario de registro */}
      <View style={styles.formContainer}>
        {/* Campo de nombre completo */}
        <Text style={[styles.label, { color: colors.muted }]}>Nombre</Text>
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            placeholder="Nombre completo"
            autoCapitalize="words"
            activeOutlineColor={colors.primary}
            outlineColor={colors.border}
            left={
              <TextInput.Icon icon="account-outline" color={placeholderColor} />
            }
            style={[styles.input, { backgroundColor: fieldBackground }]}
            outlineStyle={styles.outline}
            value={fullName}
            onChangeText={handleFullNameChange}
            theme={{
              colors: {
                text: colors.text,
                placeholder: placeholderColor,
                onSurfaceVariant: placeholderColor,
              },
            }}
          />
        </View>

        {/* Campo de email */}
        <Text style={[styles.label, { color: colors.muted }]}>Correo</Text>
        <TextfieldEmail value={email} onChangeText={handleEmailChange} />

        {/* Campo de contraseña */}
        <Text style={[styles.label, { color: colors.muted }]}>Contraseña</Text>
        <TextfieldPassword
          value={password}
          onChangeText={handlePasswordChange}
        />

        {/* Campo para confirmar la contraseña (tiene que coincidir con la de arriba) */}
        <Text style={[styles.label, { color: colors.muted }]}>
          Confirmar contraseña
        </Text>
        <TextfieldPassword
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
        />

        {/* Botón de crear cuenta — desactivado si faltan campos */}
        <Button
          text={isBusy ? "Creando..." : "Crear cuenta"}
          disabled={isSignupDisabled}
          onPress={handleSubmit}
        />

        {/* Mensajes de error (rojo) o éxito (verde) */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        {/* Ruedita de carga mientras esperamos */}
        {isBusy ? (
          <View style={styles.progress}>
            <ActivityIndicator />
          </View>
        ) : null}

        {/* Enlace para volver al login si ya tienes cuenta */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: colors.muted }]}>
            ¿Ya tienes cuenta?
          </Text>
          <TextButton text="Inicia sesión" onPress={handleGoLogin} />
        </View>
      </View>
    </View>
  );
}

// ──── Estilos de la pantalla de registro ────
const styles = StyleSheet.create({
  // Contenedor principal: ocupa toda la pantalla, centra contenido
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 30,
  },
  // Caja del formulario
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  // Etiqueta de cada campo
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  // Contenedor del campo de nombre
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    fontSize: 15,
  },
  outline: {
    borderRadius: 12,
  },
  // Fila inferior con enlace a login
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
    marginBottom: 20,
  },
  signupText: {
    fontSize: 14,
  },
  // Mensaje de error en rojo
  errorText: {
    color: "#b91c1c",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  // Mensaje de éxito en verde
  successText: {
    color: "#15803d",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  // Contenedor de la ruedita de carga
  progress: {
    marginTop: 12,
    alignItems: "center",
  },
});
