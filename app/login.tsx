import React from "react";
import { View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
// Quitamos el candado y ponemos el logo de la Viniloteca
import TextfieldEmail from "../src/hooks/login/Textfield/textfield_email";
import TextfieldPassword from "../src/hooks/login/Textfield/textfield_password";
import TextButton from "../src/components/Buttons/text_button";
import Button from "../src/components/Buttons/button";
import GoogleButton from "../src/components/Buttons/google_button";
import useLogin from "../src/hooks/useLogin";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const {
    email,
    password,
    isLoginDisabled,
    isSubmitting, // estado de envío para mostrar loader
    error, // error de login para mostrar mensaje
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useLogin();

  // Obtenemos los colores y si está en modo oscuro
  const { colors, isDark } = useThemePreference();

  function handleGoSignup() {
    router.push("/signup");
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mostramos el logo principal de la Viniloteca */}
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

      <Text style={[styles.title, { color: colors.text }]}>Bienvenido</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Introduce tus credenciales para continuar
      </Text>

      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: colors.muted }]}>
          Correo Electrónico
        </Text>

        {/* Conectamos el input con el estado `email` */}
        <TextfieldEmail value={email} onChangeText={handleEmailChange} />

        <View style={styles.passwordLabelContainer}>
          <Text style={[styles.label, { color: colors.muted }]}>
            Contraseña
          </Text>
          <TextButton text="¿Olvidaste tu contraseña?" />
        </View>

        {/* Conectamos el input con el estado `password` */}
        <TextfieldPassword
          value={password}
          onChangeText={handlePasswordChange}
        />

        {/* Activamos el botón solo si `email` y `password` tienen contenido */}
        <Button
          // Cambiamos el texto del botón según isSubmitting
          text={isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
          disabled={isLoginDisabled}
          // handleSubmit viene del hook y delega en el AuthProvider
          onPress={handleSubmit}
        />

        {/* Mostramos errores devueltos por el hook (login fallido) */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Mientras isSubmitting está activo enseñamos un loader adicional */}
        {isSubmitting ? (
          <View style={styles.progress}>
            <ActivityIndicator />
          </View>
        ) : null}

        {/* Ponemos un separador para separar el login normal del de Google */}
        <View style={[styles.dividerContainer, { marginTop: 30 }]}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.muted }]}>
            O continúa con
          </Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        {/* Mostramos el botón de login con Google */}
        <GoogleButton text="Google" />

        {/* Mostramos el botón de texto para registrarse */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1, // Usamos flex para ocupar toda la pantalla
    alignItems: "center", // Centramos en horizontal
    justifyContent: "center", // Centramos en vertical y horizontal
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
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  dividerContainer: {
    flexDirection: "row", // Usamos fila para alinear elementos
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    gap: 12, // Dejamos espacio entre elementos
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  passwordLabelContainer: {
    flexDirection: "row", // Usamos fila para alinear textos
    justifyContent: "space-between", // Separamos los textos
    alignItems: "center",
    marginBottom: 8,
  },
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
  errorText: {
    color: "#b91c1c",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  progress: {
    marginTop: 12,
    alignItems: "center",
  },
});
