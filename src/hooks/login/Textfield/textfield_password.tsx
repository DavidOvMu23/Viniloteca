import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

// Creamos un campo de texto para la contraseña
interface TextfieldPasswordProps {
  value: string;
  onChangeText: (text: string) => void;
}

// Definimos el componente que pinta el input de contraseña
export const TextfieldPassword = ({
  value,
  onChangeText,
}: TextfieldPasswordProps) => {
  return (
    // Dejamos el contenedor del input
    <View style={styles.container}>
      {/* Usamos value y onChangeText que llegan desde la pantalla */}
      <TextInput
        mode="outlined"
        placeholder="Contraseña"
        secureTextEntry
        autoCapitalize="none"
        activeOutlineColor="#4f46e5"
        outlineColor="#D0D0D0"
        left={<TextInput.Icon icon="lock-outline" color="#888888" />}
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

export default TextfieldPassword;
