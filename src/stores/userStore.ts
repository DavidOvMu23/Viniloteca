// Este es nuestro almacen global de estados para el usuario
// Aquí guardamos toda la información relevante del usuario que ha iniciado sesión
// y las funciones para actualizar esa información desde cualquier parte de la app.
// como el nombre, el correo, el rol, etc.

// De esta forma es mas facil acceder a esos datos desde cualquier componente

import { create } from "zustand"; //Zustand es la librería que usamos para crear este tipo de almacenes globales de estados.
import {
  type RoleName,
  type UserProfile,
  type UserStoreState,
  type UserStoreActions,
} from "src/types";

// Creamos el store usando la función create de Zustand.
export const useUserStore = create<UserStoreState & UserStoreActions>(
  (set) => ({
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
  }),
);
