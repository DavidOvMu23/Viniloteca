// Busca discos en Discogs y devuelve directamente la lista de resultados
export async function searchDiscogs(query: string) {
  // Token público desde el .env (Expo lo expone con EXPO_PUBLIC_*)
  const token = process.env.EXPO_PUBLIC_DISCOGS_TOKEN;

  // Llamada a la API de Discogs
  const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(
    query,
  )}&type=release`;

  // Llamamos a la API y pasamos el token.
  const response = await fetch(url, {
    headers: {
      // Discogs exige el token en este formato exacto
      Authorization: `Discogs token=${token}`,
      // Y también pide un User-Agent con el nombre de la app
      "User-Agent": "viniloteca/1.0",
    },
  });

  const data = await response.json(); // Parseamos la respuesta JSON
  return data?.results ?? []; // Devolvemos la lista de resultados o un array vacío si no hay
}
