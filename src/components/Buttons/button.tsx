import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

/* el interface este es para definir las propiedades que el botón puede recibir */
interface ButtonProps {
  text: string;
  disabled?: boolean;
  onPress?: () => void;
}

/* Definimos el componente y recibimos los datos que nos pasan por props */
const Button = ({ text, disabled = false, onPress }: ButtonProps) => {
  return (
    // Usamos TouchableOpacity para que se pueda pulsar
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton]}
      disabled={disabled}
      onPress={onPress}
    >
      {/* Ponemos el texto que llega desde el prop `text` */}
      <Text style={[styles.text, disabled && styles.disabledText]}>{text}</Text>
    </TouchableOpacity>
  );
};

/* Definimos los estilos del botón */
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ddbd30ff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#ecd985ff",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  disabledText: {
    color: "#f2f2f2",
  },
});

export default Button;
