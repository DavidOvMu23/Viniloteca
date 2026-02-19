// Este es nuestro almacen global de estados para el usuario
// Aquí guardamos toda la información relevante del usuario que ha iniciado sesión
// y las funciones para actualizar esa información desde cualquier parte de la app.
// como el nombre, el correo, el rol, etc.

// De esta forma es mas facil acceder a esos datos desde cualquier componente

import { create } from "zustand"; //Zustand es la librería que usamos para crear este tipo de almacenes globales de estados.

// Definimos los tipos de usuario que usaremos en la app para así evitar errores
export type RoleName = "SUPERVISOR" | "NORMAL";

// UserProfile es el tipo que representa toda la información relevante de un usuario logueado
// No es lo mismo que tenemos en /types/index.ts que es el Cliente, aquí solo guardaremos lo que necesitamos para la sesión actual.
// Lo hacemos así para tener un control más claro de qué datos usamos en cada parte de la app.
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  roleName?: RoleName;
  avatarUrl?: string;
};

//Los datos que guardamos en el store se organizan en dos partes: el estado (State) y las acciones (Actions).

// State: Qué datos guardamos sobre el usuario.
type State = {
  user: UserProfile | null; // El usuario logueado, o null si no hay nadie logueado.
};

// Actions: Qué funciones podemos usar para modificar los datos.
type Actions = {
  setUser: (user: UserProfile) => void; // Guardar usuario (para iniciar sesión)
  updateUser: (partial: Partial<UserProfile>) => void; // Actualizar datos sueltos
  clearUser: () => void; // Borrar usuario (para cerrar sesión)
};

// Creamos el store usando la función create de Zustand.
export const useUserStore = create<State & Actions>((set) => ({
  user: null, // Al arrancar la app, no hay nadie logueado, así que user es null.

  // ACCIÓN 1: setUser
  // Reemplaza el usuario actual por uno nuevo.
  setUser: (newUser) => {
    set({ user: newUser });
  },

  // ACCIÓN 2: updateUser
  // Permite cambiar solo ALGUNOS campos del usuario sin tener que pasar todo el objeto de nuevo.
  // Lo usamos para editar ciertos campos del perfil sin perder el resto de la información.
  updateUser: (cambios) => {
    set((estadoActual) => {
      //Retornamos un nuevo estado donde el user es una mezcla del estado actual y los cambios que queremos hacer.
      return {
        user: {
          ...estadoActual.user,
          ...cambios,
        },
      };
    });
  },

  // ACCIÓN 3: clearUser
  // Borra toda la info del usuario para cerrar sesión.
  clearUser: () => {
    set({ user: null });
  },
}));
