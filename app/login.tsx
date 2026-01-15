import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import LockIcon from "../src/hooks/login/LockIcon/lock_icon";
import TextfieldEmail from "../src/hooks/login/Textfield/textfield_email";
import TextfieldPassword from "../src/hooks/login/Textfield/textfield_password";
import TextButton from "../src/components/Buttons/text_button";
import Button from "../src/components/Buttons/button";
import GoogleButton from "../src/components/Buttons/google_button";

export default function Login() {
  // Usamos el router para movernos después del login
  const router = useRouter();
  // Guardamos el email que llega desde el input
  const [email, setEmail] = useState("");
  // Guardamos la contraseña que llega desde el input
  const [password, setPassword] = useState("");
  // Calculamos si el botón debe estar desactivado según el estado
  const isLoginDisabled = !email.trim() || !password.trim();

  return (
    <View style={styles.container}>
      {/* Mostramos el ícono principal de la pantalla */}
      <LockIcon />

      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>
        Introduce tus credenciales para continuar
      </Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Correo Electrónico</Text>

        {/* Conectamos el input con el estado `email` */}
        <TextfieldEmail value={email} onChangeText={(text) => setEmail(text)} />

        <View style={styles.passwordLabelContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextButton text="¿Olvidaste tu contraseña?" />
        </View>

        {/* Conectamos el input con el estado `password` */}
        <TextfieldPassword
          value={password}
          onChangeText={(text) => setPassword(text)}
        />

        {/* Activamos el botón solo si `email` y `password` tienen contenido */}
        <Button
          text="Iniciar Sesión"
          disabled={isLoginDisabled}
          onPress={() => router.replace("/home")}
        />

        {/* Ponemos un separador para separar el login normal del de Google */}
        <View style={[styles.dividerContainer, { marginTop: 30 }]}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>O continúa con</Text>
          <View style={styles.line} />
        </View>

        {/* Mostramos el botón de login con Google */}
        <GoogleButton text="Google" />

        {/* Mostramos el botón de texto para registrarse */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>¿No tienes una cuenta?</Text>
          <TextButton text="Regístrate ahora" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Usamos flex para ocupar toda la pantalla
    backgroundColor: "#fff",
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
    color: "gray",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
    backgroundColor: "#D0D0D0",
  },
  dividerText: {
    fontSize: 13,
    color: "#999",
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
    color: "#666",
  },
});
