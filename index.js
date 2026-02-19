// Este archivo es el "encendido" de la aplicación.
// Cuando abres la app, este es el primer código que se ejecuta.

import { registerRootComponent } from "expo";

// Importamos el componente principal de nuestra App
// Lo usaremos como punto de entrada para nuestra aplicación
import App from "./App";

// Registramos app como el componente raíz de nuestra aplicación
// Para que asi se abra cuando se inicie la aplicación
registerRootComponent(App);
