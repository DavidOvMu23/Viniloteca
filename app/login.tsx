// Lo que ve el usuario cuando NO está logueado.
// Tiene un formulario de email + contraseña, botón de Google
// y un enlace para ir a la pantalla de registro.

import React from "react";
import { View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
import TextfieldEmail from "../src/hooks/login/Textfield/textfield_email";
import TextfieldPassword from "../src/hooks/login/Textfield/textfield_password";
import TextButton from "../src/components/Buttons/text_button";
import Button from "../src/components/Buttons/button";
import GoogleButton from "../src/components/Buttons/google_button";
import useLogin from "../src/hooks/useLogin";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useRouter } from "expo-router";

// La pantalla de login
export default function Login() {
  // router nos permite movernos a otras pantallas (por ejemplo, a /signup)
  const router = useRouter();
  // Sacamos del hook useLogin todas las variables y funciones que necesitamos para el formulario
  const {
    email,
    password,
    isLoginDisabled,
    isSubmitting,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useLogin();

  // Sacamos los colores del tema y si estamos en modo oscuro
  const { colors, isDark } = useThemePreference();

  // Función que nos lleva a la pantalla de registro
  function handleGoSignup() {
    router.push("/signup");
  }

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

      {/* Título y subtítulo de bienvenida */}
      <Text style={[styles.title, { color: colors.text }]}>Bienvenido</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Introduce tus credenciales para continuar
      </Text>

      {/* Formulario de login */}
      <View style={styles.formContainer}>
        {/* Campo de email: lo que escribas se guarda en "email" vía handleEmailChange */}
        <Text style={[styles.label, { color: colors.muted }]}>
          Correo Electrónico
        </Text>
        <TextfieldEmail value={email} onChangeText={handleEmailChange} />

        {/* Etiqueta de contraseña + enlace de "olvidé mi contraseña" */}
        <View style={styles.passwordLabelContainer}>
          <Text style={[styles.label, { color: colors.muted }]}>
            Contraseña
          </Text>
          <TextButton text="¿Olvidaste tu contraseña?" />
        </View>

        {/* Campo de contraseña: lo que escribas se guarda en "password" */}
        <TextfieldPassword
          value={password}
          onChangeText={handlePasswordChange}
        />

        {/* Botón de iniciar sesión:
            - Desactivado (gris) si email o password están vacíos
            - Cambia su texto a "Iniciando..." mientras enviamos al servidor */}
        <Button
          text={isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
          disabled={isLoginDisabled}
          onPress={handleSubmit}
        />

        {/* Si el login falla, mostramos el mensaje de error en rojo */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Ruedita de carga mientras esperamos respuesta del servidor */}
        {isSubmitting ? (
          <View style={styles.progress}>
            <ActivityIndicator />
          </View>
        ) : null}

        {/* Línea separadora con texto "O continúa con" */}
        <View style={[styles.dividerContainer, { marginTop: 30 }]}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.muted }]}>
            O continúa con
          </Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        {/* Botón de login con Google */}
        <GoogleButton text="Google" />

        {/* Enlace para ir a la pantalla de registro */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: colors.muted }]}>
            ¿No tienes una cuenta?
          </Text>
          <TextButton text="Regístrate ahora" onPress={handleGoSignup} />
        </View>
      </View>
    </View>
  );
}

// Estilos de la pantalla de login
const styles = StyleSheet.create({
  // Contenedor principal: ocupa toda la pantalla y centra su contenido
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Título grande "Bienvenido"
  title: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "bold",
  },
  // Texto pequeño debajo del título
  subtitle: {
    fontSize: 15,
    marginBottom: 30,
  },
  // Caja que envuelve todos los campos del formulario
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  // Etiqueta encima de cada campo ("Correo", "Contraseña")
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  // Contenedor de la línea separadora "─ O continúa con ─"
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  // Línea horizontal del separador
  line: {
    flex: 1,
    height: 1,
  },
  // Texto "O continúa con"
  dividerText: {
    fontSize: 13,
  },
  // Fila con "Contraseña" a la izquierda y "¿Olvidaste?" a la derecha
  passwordLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  // Fila inferior con "¿No tienes cuenta?" + "Regístrate ahora"
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
  // Contenedor de la ruedita de carga
  progress: {
    marginTop: 12,
    alignItems: "center",
  },
});
