// Este archivo define un componente específico para el campo de email en la pantalla de login.

import React from "react";

// Props que recibe el componente TextfieldEmail.
interface TextfieldEmailProps {
  value: string; // El valor actual del campo, controlado por el estado del padre.

  onChangeText: (text: string) => void; // Función que se llama cuando el texto cambia, para actualizar el estado del padre.
}

import TextField from "src/components/Inputs/TextField";

// Componente específico para el campo de email en la pantalla de login.
export function TextfieldEmail({ value, onChangeText }: TextfieldEmailProps) {
  return (
    // Renderizamos el TextField genérico con la configuración de email
    <TextField
      // El texto actual que muestra el campo (lo que el usuario ha escrito)
      value={value}
      // La función que se llama cuando el usuario teclea algo nuevo
      onChangeText={onChangeText}
      // Texto gris que aparece cuando el campo está vacío, como una pista
      placeholder="Email"
      // Le decimos al teléfono que muestre el teclado de email (con @ y .com)
      keyboardType="email-address"
      // Icono de sobre que aparece a la izquierda del campo para que
      // el usuario sepa de un vistazo que aquí va el correo
      leftIcon="email-outline"
    />
  );
}
// Exportamos el componente para que pueda ser usado en otras partes de la app.
export default TextfieldEmail;
