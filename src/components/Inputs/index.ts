// Este archivo actúa como un índice para exportar todos los componentes de entrada (inputs) de la aplicación,
// facilitando su importación desde otras partes del código. Aquí agrupamos y re-exportamos los componentes relacionados con formularios y campos de texto.

// Campo de texto genérico reutilizable (nombre, teléfono, etc.)
export { default as TextField } from "./TextField";

// Campo de texto especial para escribir el correo electrónico
// (Se eliminó la re-exportación named `TextfieldEmail` porque no se usa)

// Campo de texto especial para escribir la contraseña (oculta los caracteres)
export { default as TextfieldPassword } from "../../hooks/login/Textfield/textfield_password";
