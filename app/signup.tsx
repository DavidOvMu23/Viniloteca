import React from "react";
import { View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import TextfieldEmail from "../src/hooks/login/Textfield/textfield_email";
import TextfieldPassword from "../src/hooks/login/Textfield/textfield_password";
import TextButton from "../src/components/Buttons/text_button";
import Button from "../src/components/Buttons/button";
import useSignup from "../src/hooks/useSignup";
import { useThemePreference } from "src/providers/ThemeProvider";

export default function Signup() {
  const router = useRouter();
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

  const { colors, isDark } = useThemePreference();
  const fieldBackground = isDark ? "#111b2a" : "#f8fafc";
  const placeholderColor = isDark ? "rgba(179,192,207,0.72)" : "#9ca3af";

  function handleGoLogin() {
    router.replace("/login");
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      <Text style={[styles.title, { color: colors.text }]}>Crear cuenta</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Completa los datos para registrarte
      </Text>

      <View style={styles.formContainer}>
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

        <Text style={[styles.label, { color: colors.muted }]}>Correo</Text>
        <TextfieldEmail value={email} onChangeText={handleEmailChange} />

        <Text style={[styles.label, { color: colors.muted }]}>Contraseña</Text>
        <TextfieldPassword
          value={password}
          onChangeText={handlePasswordChange}
        />

        <Text style={[styles.label, { color: colors.muted }]}>
          Confirmar contraseña
        </Text>
        <TextfieldPassword
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
        />

        <Button
          text={isBusy ? "Creando..." : "Crear cuenta"}
          disabled={isSignupDisabled}
          onPress={handleSubmit}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        {isBusy ? (
          <View style={styles.progress}>
            <ActivityIndicator />
          </View>
        ) : null}

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

const styles = StyleSheet.create({
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
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    fontSize: 15,
  },
  outline: {
    borderRadius: 12,
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
  successText: {
    color: "#15803d",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  progress: {
    marginTop: 12,
    alignItems: "center",
  },
});
