// Este archivo actúa como un índice para los botones de la aplicación, permitiendo importar todos los botones desde un solo lugar. Esto mejora la organización del código y facilita la importación de componentes en otras partes de la aplicación.

// Exportamos el botón principal, que es el más utilizado en la app
export { default as Button } from "./button";

// Exportamos el botón de solo texto (parece un enlace web)
export { default as TextButton } from "./text_button";

// Exportamos el botón de inicio de sesión con Google
export { default as GoogleButton } from "./google_button";
