// este archivo es para la función que abre la galería de fotos y deja elegir una imagen, usada para cambiar el avatar del cliente

import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

// esta función se encarga de abrir la galería de fotos del dispositivo, pedir permisos si es necesario, y devolver la imagen elegida por el usuario (o null si cancela o hay un error)
export async function pickImageFromLibrary() {
  try {
    // Pedimos permiso para acceder a la galería de fotos. Esto es obligatorio en Android e iOS por temas de privacidad.
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Si el usuario dice "No", no podemos hacer nada.
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tus fotos para poder cambiar tu avatar.",
      );
      return null;
    }

    // Abrimos la galería de fotos para que el usuario elija una imagen.
    // Configuramos para que solo pueda elegir fotos, no videos, y que pueda recortar la imagen en un formato cuadrado
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo fotos
      allowsEditing: true, // Deja recortar (crop)
      aspect: [1, 1], // Recorte cuadrado perfecto (1:1)
      quality: 0.8, // Calidad alta (80%) para que no pese demasiado
    });

    // Si el usuario cancela la selección, result.canceled será true. En ese caso, no devolvemos nada.
    if (result.canceled) {
      return null; // No devolvemos nada
    }

    // Si llegamos aquí, el usuario ha elegido una imagen. La devolvemos para que la pantalla de edición pueda usarla como nuevo avatar.
    return result.assets[0];
  } catch (error) {
    // Si hay algún error al abrir la galería o pedir permisos, lo mostramos en la consola y también en una alerta para el usuario.
    console.error("Error al abrir la galería:", error);
    Alert.alert("Error", "No se pudo abrir la galería de fotos.");
    return null;
  }
}
