// Este archivo es el punto de entrada de nuestra aplicación. Es el primer código que se ejecuta cuando la app arranca.
// Por eso, aquí configuramos cosas globales como la navegación (rutas) y las fuentes.

import React from "react";
import { ExpoRoot } from "expo-router";
import { useEffect } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

// Con esto configuramos cómo se mostrarán las notificaciones cuando lleguen
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  // Cargamos las fuentes de Ionicons (para los íconos)
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  // Si las fuentes no han cargado, no renderizamos nada (podrías mostrar una pantalla de carga aquí)
  useEffect(() => {
    async function obtenerToken() {
      // Comprobamos si es un móvil de verdad (los simuladores no valen)
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Si no tenemos permiso, se lo preguntamos al usuario
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        // Si deniega el permiso, nos salimos
        if (finalStatus !== "granted") {
          alert("¡Necesitas dar permiso para recibir notificaciones!");
          return;
        }

        // Obtenemos el projectId de la configuración y pedimos el token
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        try {
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
          });
          // ¡Lo imprimimos en la consola para que puedas copiarlo!
          alert("¡ÉXITO! Tu token es: " + tokenData.data);
          console.log("Aqui está el token: ", tokenData.data);
        } catch (error) {
          alert("ERROR AL PEDIR TOKEN: " + error);
          console.log("Error al obtener el token: ", error);
        }
      } else {
        console.log(
          "Las notificaciones push solo funcionan en un móvil físico.",
        );
      }
    }

    obtenerToken();
  }, []); // El array vacío [] significa que esto solo se ejecutará 1 vez al abrir la app

  // Con esto le indicamos a Expo en que directorio buscar las pantallas
  const ctx = (require as any).context("./app");

  // Le pasamos a expo la variable ctx que contiene toda la info de las pantallas
  return <ExpoRoot context={ctx} />;
}
