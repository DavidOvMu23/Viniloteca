// Este es el código del componente Button, que es un botón personalizado para nuestra app. Es como crear tu propia camiseta con el logo de tu banda favorita: puedes elegir el diseño, los colores y cómo se ve, pero sigue siendo un botón que puedes usar en cualquier parte de la app.

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
// useThemePreference para ajustar apariencia del botón según el tema.
import { useThemePreference } from "src/providers/ThemeProvider";

// Definimos las propiedades (props) que nuestro botón va a aceptar. Es como hacer un formulario para saber qué información necesitamos para crear el botón.
interface ButtonProps {
  text: string;
  disabled?: boolean;
  onPress?: () => void;
}

//esta función es el componente Button en sí. Recibe las props que definimos arriba y devuelve un botón con el diseño y comportamiento que queremos.
function Button({ text, disabled = false, onPress }: ButtonProps) {
  const { colors, isDark } = useThemePreference(); // Usamos el hook useThemePreference para obtener los colores del tema actual (claro u oscuro) y adaptar el diseño del botón en consecuencia.

  // Aquí decidimos qué colores usar para el fondo (bg) y el texto (fg) del botón según el tema y si está deshabilitado o no. Es como elegir la ropa adecuada para cada ocasión: si el botón está deshabilitado, le ponemos colores más apagados para que se vea diferente.
  let bg = colors.primary;
  let fg = colors.contrastText;

  // Si el botón está deshabilitado, cambiamos los colores para que se vea diferente y no llame tanto la atención. Usamos tonos grises que funcionan bien tanto en modo claro como oscuro.
  if (disabled) {
    if (isDark) {
      bg = "#1f2937";
      fg = "#94a3b8";
    } else {
      bg = "#e5e7eb";
      fg = "#6b7280";
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bg }]}
      disabled={disabled}
      onPress={onPress}
    >
      {/* Aquí mostramos el texto que nos pasaron por la propiedad "text".
          Usamos los estilos base más el color de texto que elegimos arriba */}
      <Text style={[styles.text, { color: fg }]}>{text}</Text>
    </TouchableOpacity>
  );
}

// Aquí creamos la "hoja de estilos" del botón. Es como
// elegir la ropa y el maquillaje: tamaños, bordes, márgenes…
const styles = StyleSheet.create({
  // Estilos del contenedor del botón (la caja que se pulsa)
  button: {
    paddingVertical: 14, // Espacio arriba y abajo dentro del botón (para que no quede apretado)
    paddingHorizontal: 20, // Espacio a izquierda y derecha dentro del botón
    borderRadius: 8, // Redondea las esquinas para que no sean puntiagudas
    alignItems: "center", // Centra el texto en medio del botón
    marginTop: 20, // Deja un hueco por encima para separarlo de lo que haya arriba
  },
  // Estilos del texto que va dentro del botón
  text: {
    fontSize: 16, // Tamaño de la letra, ni muy grande ni muy pequeña
    fontWeight: "600", // Letra semi-negrita para que se lea bien
  },
});

// Exportamos el botón para que otros archivos puedan usarlo.
// Es como poner el botón en una estantería de la tienda
// para que cualquiera lo coja cuando lo necesite
export default Button;
