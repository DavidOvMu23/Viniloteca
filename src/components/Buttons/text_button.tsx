import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

//definimos las propiedades que puede recibir el botón
interface TextButtonProps {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const TextButton = ({ text, onPress }: TextButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* Dejamos el texto con estilo tipo enlace */}
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f46e5",
    marginBottom: 0,
  },
});

export default TextButton;
