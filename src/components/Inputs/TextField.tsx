// Componente TextField adaptable al tema claro/oscuro y con opciones para contraseñas, teclado numérico, iconos, etc.

import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
// useThemePreference para adaptar el TextField al tema actual.
import { useThemePreference } from "src/providers/ThemeProvider";

// Definimos las props que acepta el componente TextField. Son todas opcionales excepto value y onChangeText, que son necesarias para controlar el campo.
interface TextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  leftIcon?: string | null;
}

// Función principal: construye el campo de texto con todos sus adornos
export default function TextField({
  value,
  onChangeText,
  placeholder = "", // si no envían placeholder, queda vacío
  secure = false, // por defecto el texto se ve normal
  keyboardType,
  leftIcon = null, // por defecto sin icono
}: TextFieldProps) {
  // Obtenemos colores del tema y si estamos en modo oscuro
  const { colors, isDark } = useThemePreference();

  // Fondo del campo: azul muy oscuro en modo noche, casi blanco en día
  const fieldBackground = isDark ? "#111b2a" : "#f8fafc";

  // Color del texto de ejemplo (placeholder): gris clarito adaptado al tema
  const placeholderColor = isDark ? "rgba(179,192,207,0.72)" : "#9ca3af";

  return (
    // Caja contenedora que da margen inferior al campo
    <View style={styles.container}>
      {/* Campo de texto con borde (mode="outlined") */}
      <TextInput
        mode="outlined"
        placeholder={placeholder}
        secureTextEntry={secure}
        // Si es contraseña no ponemos mayúsculas automáticas;
        // en otros casos, la primera letra de cada palabra va en mayúscula
        autoCapitalize={secure ? "none" : "words"}
        keyboardType={keyboardType}
        // Color del borde cuando el campo está activo (seleccionado)
        activeOutlineColor={colors.primary}
        // Color del borde cuando NO está activo
        outlineColor={colors.border}
        // Icono a la izquierda: si nos pasaron uno, lo mostramos
        left={
          leftIcon ? (
            <TextInput.Icon icon={leftIcon as any} color={placeholderColor} />
          ) : undefined
        }
        // Estilo del campo: tamaño de letra + fondo adaptado al tema
        style={[styles.input, { backgroundColor: fieldBackground }]}
        // Bordes redondeados en las esquinas
        outlineStyle={styles.outline}
        value={value}
        onChangeText={onChangeText}
        // Sobreescribimos colores internos del componente Paper
        theme={{
          colors: {
            text: colors.text, // color del texto que escribe el usuario
            placeholder: placeholderColor, // color del texto de ejemplo
            onSurfaceVariant: placeholderColor, // variante usada internamente por Paper
          },
        }}
      />
    </View>
  );
}

// Hoja de estilos: la "ropa" visual del campo de texto
const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // espacio debajo del campo para separarlo del siguiente
  },
  input: {
    fontSize: 15, // tamaño de letra cómodo para leer
  },
  outline: {
    borderRadius: 12, // esquinas redondeadas para un look moderno
  },
});
