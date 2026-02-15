// Este archivo se encarga de conectar con la API de Discogs para buscar discos

// Función principal de búsqueda
export async function searchDiscogs(query: string): Promise<any[]> {
  //quitamos espacios sobrantes de la búsqueda
  const textoBuscado = query.trim();

  //Si no escribió nada, no hacemos nada
  if (textoBuscado === "") {
    return [];
  }

  // Declaramos el token de Discogs
  const token = process.env.EXPO_PUBLIC_DISCOGS_TOKEN;

  // Construimos la URL de búsqueda.
  // La url al final es como si estuviéramos escribiendo en el navegador:
  // https://api.discogs.com/database/search?q=beatles&type=release&token=MI_TOKEN
  // pero con el texto que el usuario escribió en lugar de "beatles" y nuestro token real para poder usar la API.

  // encodeURIComponent es para convertir caracteres raros en algo que se pueda poner en una URL
  const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(
    textoBuscado,
  )}&type=release&token=${encodeURIComponent(token || "")}`;

  // hacemos la petición a la API
  try {
    // Fetch es la función nativa de JavaScript para hacer peticiones a servidores.
    const respuesta = await fetch(url, {
      headers: {
        Accept: "application/json", //Le decimos a la api que nos retorne los datos en formeto JSON
      },
    });

    // Comprobamos si la respuesta fue correcta
    if (!respuesta.ok) {
      // Si la API nos dice que hemos hecho demasiadas peticiones, le decimos al usuario que espere un momento.
      if (respuesta.status === 429) {
        throw new Error("Discogs está saturado. Espera un momento.");
      }

      // Cualquier otro error
      throw new Error(`Error de Discogs: Código ${respuesta.status}`);
    }

    // Leemos los datos que nos devuelve la API.
    const datos = await respuesta.json();

    // Filtramos los resultados para quedarnos solo con los que tengan portada (cover_image) y título (title)
    // y los guardamos en un array nuevo que devolveremos a la app
    if (Array.isArray(datos.results)) {
      return datos.results;
    } else {
      return []; // Si no hay array, devolvemos vacío
    }
  } catch (error) {
    console.error("Fallo buscando en Discogs:", error);
    throw new Error("No se pudo conectar con Discogs.");
  }
}
