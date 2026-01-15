import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

// Creamos un campo de texto para el email
interface TextfieldEmailProps {
  value: string;
  onChangeText: (text: string) => void;
}

// Definimos el componente que pinta el input de email
export const TextfieldEmail = ({
  value,
  onChangeText,
}: TextfieldEmailProps) => {
  return (
    <View style={styles.container}>
      {/* Usamos value y onChangeText que llegan desde la pantalla */}
      <TextInput
        mode="outlined"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        activeOutlineColor="#4f46e5"
        outlineColor="#D0D0D0"
        left={<TextInput.Icon icon="email-outline" color="#888888" />}
        style={styles.input}
        outlineStyle={styles.outline}
        value={value}
        onChangeText={onChangeText}
        theme={{
          colors: {
            text: "#000",
            placeholder: "#999",
            onSurfaceVariant: "#999",
          },
        }}
      />
    </View>
  );
};

// Definimos los estilos del input
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#FAFAFA",
    fontSize: 15,
  },
  outline: {
    borderRadius: 12,
  },
});

export default TextfieldEmail;
