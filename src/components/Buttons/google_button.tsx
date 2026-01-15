import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

//definimos las propiedades que puede recibir el botón
interface GoogleButtonProps {
  text?: string;
}

const GoogleButton = ({ text = "Continúa con Google" }: GoogleButtonProps) => {
  return (
    <TouchableOpacity style={styles.button}>
      {/* Ponemos el icono y el texto alineados */}
      <FontAwesome name="google" size={20} color="#EA4335" />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    gap: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

export default GoogleButton;
