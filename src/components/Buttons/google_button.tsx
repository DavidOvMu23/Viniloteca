//este componente es un botón para iniciar sesión con Google, con su icono y texto personalizado, adaptándose al tema claro u oscuro de la app.
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
// useThemePreference para adaptar estilos del botón al tema.
import { useThemePreference } from "src/providers/ThemeProvider";

// Definimos las props que acepta el componente GoogleButton. En este caso, solo un texto opcional.
interface GoogleButtonProps {
  // "text" es el mensaje que aparecerá junto al icono de Google (es opcional)
  text?: string;
}

// El componente GoogleButton muestra un botón con el icono de Google y un texto, adaptándose al tema claro u oscuro.
function GoogleButton({ text = "Continúa con Google" }: GoogleButtonProps) {
  const { colors } = useThemePreference();

  return (
    // {/* Este es el botón que el usuario puede tocar */}
    <TouchableOpacity
      style={[
        // Aplicamos los estilos base del botón (forma, tamaño, espaciado)
        styles.button,
        // Fondo neutro y borde del tema para que el botón se integre en claro/oscuro
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      {/* Aquí ponemos el icono de Google (la "G" de colores) junto al texto, alineados en fila */}
      <FontAwesome name="google" size={20} color="#EA4335" />

      {/* Este es el texto que acompaña al icono, por ejemplo "Continúa con Google" */}
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Estilo del botón completo (la caja que envuelve icono + texto)
  button: {
    flexDirection: "row", // Ponemos icono y texto uno al lado del otro (en fila)
    alignItems: "center", // Centramos todo verticalmente dentro del botón
    justifyContent: "center", // Centramos todo horizontalmente dentro del botón
    borderWidth: 1, // Le damos un borde finito de 1 píxel alrededor
    paddingVertical: 12, // Espacio interior arriba y abajo (para que no quede apretado)
    paddingHorizontal: 20, // Espacio interior a los lados izquierdo y derecho
    borderRadius: 8, // Redondeamos las esquinas para que se vea más bonito
    marginTop: 20, // Dejamos un hueco de 20 píxeles por encima del botón
    gap: 12, // Separación de 12 píxeles entre el icono y el texto
  },
  // Estilo del texto dentro del botón
  text: {
    fontSize: 14, // Tamaño de la letra: 14 (ni muy grande ni muy pequeña)
    fontWeight: "600", // Grosor de la letra: semi-negrita para que se lea bien
  },
});

// Exportamos el botón para que otras pantallas de la app puedan usarlo
export default GoogleButton;
