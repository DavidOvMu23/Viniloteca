// Este componente es un botón de texto, que se ve como un enlace web (color principal y semi‑negrita).

import {
  TouchableOpacity, // zona sensible al toque que se difumina al pulsar
  Text, // etiqueta para escribir texto visible
  StyleSheet, // utilidad para crear hojas de estilo
  GestureResponderEvent, // tipo que describe un toque del dedo
} from "react-native";

// useThemePreference para adaptar estilos del texto según tema.
import { useThemePreference } from "src/providers/ThemeProvider";

// Definimos las props que acepta el componente TextButton. Recibe el texto a mostrar y una función para manejar el toque.
interface TextButtonProps {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
}

// Esta es la función principal: recibe el texto y la acción,
// y devuelve un botón que parece un enlace web.
function TextButton({ text, onPress }: TextButtonProps) {
  // Obtenemos los colores del tema para pintar el texto
  const { colors } = useThemePreference();

  return (
    // Al tocar esta zona, se ejecuta la función «onPress»
    <TouchableOpacity onPress={onPress}>
      {/* Mostramos el texto con estilo de enlace: color principal y semi‑negrita */}
      <Text style={[styles.text, { color: colors.primary }]}>{text}</Text>
    </TouchableOpacity>
  );
}

// Hoja de estilos: la "ropa" visual del texto
const styles = StyleSheet.create({
  text: {
    fontSize: 14, // tamaño de letra mediano
    fontWeight: "600", // semi-negrita para que destaque un poquito
    marginBottom: 0, // sin espacio extra debajo
  },
});

// Exportamos el componente para que otros archivos puedan usarlo
export default TextButton;
