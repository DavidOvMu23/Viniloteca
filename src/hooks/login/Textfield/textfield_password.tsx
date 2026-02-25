// este archivo define un componente específico para el campo de contraseña en la pantalla de login.

// TextField componente reutilizable para entrada de texto (password).
import TextField from "src/components/Inputs/TextField";

// Props que recibe el componente TextfieldPassword.
interface TextfieldPasswordProps {
  value: string;
  onChangeText: (text: string) => void;
}

// Componente específico para el campo de contraseña en la pantalla de login.
export default function TextfieldPassword({
  value,
  onChangeText,
}: TextfieldPasswordProps) {
  return (
    <TextField
      value={value} // El valor actual del campo, controlado por el estado del padre.
      onChangeText={onChangeText} // Función que se llama cuando el texto cambia, para actualizar el estado del padre.
      placeholder="Contraseña" // Texto que se muestra cuando el campo está vacío, para guiar al usuario.
      secure // Hace que el texto se oculte (aparecen puntos en lugar de caracteres) para proteger la privacidad de la contraseña.
      leftIcon="lock-outline" // Icono de candado a la izquierda del campo, para indicar que es un campo de contraseña.
    />
  );
}
