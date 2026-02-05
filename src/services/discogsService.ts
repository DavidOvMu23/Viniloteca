// Busca discos en Discogs y devuelve directamente la lista de resultados
export async function searchDiscogs(query: string): Promise<any[]> {
  // 1) Limpiamos espacios para no enviar búsquedas vacías
  const trimmedQuery = query.trim();
  // 2) Si no queda texto, devolvemos un array vacío y salimos
  if (!trimmedQuery) return [];

  // 3) Leemos el token público desde el .env
  const token = process.env.EXPO_PUBLIC_DISCOGS_TOKEN;
  // 4) Si no hay token, cortamos con un error claro para el dev
  if (!token) {
    throw new Error("Falta el token de Discogs (EXPO_PUBLIC_DISCOGS_TOKEN)");
  }

  // 5) Construimos la URL con la query codificada
  const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(
    trimmedQuery,
  )}&type=release`;

  try {
    // 6) Hacemos la petición HTTP a la API de Discogs
    const response = await fetch(url, {
      // 7) Enviamos headers obligatorios para que Discogs acepte la llamada
      headers: {
        // 8) Discogs exige el token en este formato exacto
        Authorization: `Discogs token=${token}`,
        // 9) También exige un User-Agent identificando la app
        "User-Agent": "viniloteca/1.0",
      },
    });

    // 10) Si la respuesta HTTP no es OK, lanzamos un error controlado
    if (!response.ok) {
      throw new Error(`Discogs devolvió ${response.status}`);
    }

    // 11) Convertimos el body a JSON
    const data = await response.json();
    // 12) Aseguramos que devolvemos siempre un array
    const results = Array.isArray(data?.results) ? data.results : [];
    // 13) Entregamos los resultados al llamador
    return results;
  } catch (error) {
    // 14) Log para debug durante desarrollo
    console.error("Discogs - fallo en fetch:", error);
    // 15) Lanzamos un mensaje corto para mostrar en UI
    throw new Error("No se pudo conectar con Discogs.");
  }
}
