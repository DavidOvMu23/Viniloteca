// Componente SelectRole: un selector de rol de usuario (Supervisor o Normal) con diseño Material y adaptable al tema claro/oscuro.

import React from "react";
import { View, StyleSheet } from "react-native";
import { RadioButton, Text } from "react-native-paper";
// useThemePreference para ajustar el componente al modo de tema.
import { useThemePreference } from "src/providers/ThemeProvider";

// Definimos las props que acepta el componente SelectRole. Recibe el valor actual del rol y una función para cambiarlo.
interface SelectRoleProps {
  value: "SUPERVISOR" | "NORMAL";
  onChange: (role: "SUPERVISOR" | "NORMAL") => void;
}

// Función para generar un avatar por defecto con la primera letra del nombre. Esto se usa cuando el cliente no tiene un avatar personalizado.
export default function SelectRole({ value, onChange }: SelectRoleProps) {
  const { colors } = useThemePreference();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        Rol del usuario
      </Text>
      <RadioButton.Group onValueChange={onChange} value={value}>
        <View style={styles.optionRow}>
          <RadioButton value="NORMAL" color={colors.primary} />
          <Text style={[styles.optionLabel, { color: colors.text }]}>
            Normal
          </Text>
        </View>
        <View style={styles.optionRow}>
          <RadioButton value="SUPERVISOR" color={colors.primary} />
          <Text style={[styles.optionLabel, { color: colors.text }]}>
            Supervisor
          </Text>
        </View>
      </RadioButton.Group>
    </View>
  );
}

// Estilos del componente, usando StyleSheet de React Native para mantener el código organizado y separado de la lógica.
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  optionLabel: {
    fontSize: 14,
  },
});
