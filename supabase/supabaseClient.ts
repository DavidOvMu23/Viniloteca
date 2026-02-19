// Este archivo es el que se encarga de establecer la conexión con nuestra
// base de datos en Supabase.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Declaramos las variables de entorno que necesitamos para conectar con Supabase que tendremos en nuestro archivo .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Create client que nos proporciona Supabase para abrir la conexión.
// Le pasamos la URL, la clave anónima y algunas opciones de autenticación.
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    // Estas 2 opciones son para permitir que las sesiones de los usuarios se guarden en el
    // almacenamiento local del dispositivo y así tener sesiones persistentes incluso después de cerrar la app.
    storage: AsyncStorage,
    persistSession: true,

    // Esto es para que, si el token de acceso expira, Supabase intente refrescarlo automáticamente usando el refresh token.
    autoRefreshToken: true,

    // Esto es para evitar que Supabase intente detectar sesiones en la URL por que en nuestro caso esto no es util
    detectSessionInUrl: false,
  },
});
