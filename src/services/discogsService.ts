// DiscogsReleaseSummary y DiscogsReleaseDetail para tipar resultados de búsqueda y detalle.
import { DiscogsReleaseSummary, DiscogsReleaseDetail } from "../types/discogs";

// Declaramos la base de la API
// Desde aqui haremos las peticiones a los endpoints que queramos, en nuestro caso solo
// nos interesarian el de busqueda y el de detalle de los discos
// Aqui un ejemplo de como funcionaria con esos dos endpoints:
// - https://api.discogs.com/database/search?q=nirvana&type=release&page=1&per_page=25
// - https://api.discogs.com/releases/249504
const API_BASE = "https://api.discogs.com";

// Declaramos el token de autenticación
let token: string | undefined = process.env.EXPO_PUBLIC_DISCOGS_TOKEN;

// Declaramos la duración de vida de la cache
const SEARCH_TTL = 1000 * 60 * 5; // para las busquedas
const DETAIL_TTL = 1000 * 60 * 60; // para los detalles de los discos

// Const timeout
const TIMEOUT_MS = 15000; // 15 segundos

// Declaramos las caches para evitar hacer peticiones repetidas a la API
const searchCache = new Map<
  string, //busqueda
  { ts: number; data: DiscogsReleaseSummary[] } //guardamos la fecha de la busqueda y los resultados
>();
const detailCache = new Map<
  number, //id del disco
  { ts: number; data: DiscogsReleaseDetail } //guardamos la fecha de la consulta y el detalle del disco
>();

/** Cabeceras de autenticación. */
// Esta funcion se encarga de generar las cabeceras para autenticar las peticiones usando el token
async function getAuthHeaders() {
  if (!token) throw new Error("Discogs token no configurado.");
  return {
    Authorization: `Discogs token=${token}`,
    Accept: "application/json", // indicamos a la api que queremos la respuesta json
  };
}

/** fetch con timeout y soporte de señal externa. */
// esta funcion sirve para evitar hacer peticiones que se queden colgadas por problemas de conexión o lo que sea
// así tambien evitamos que la app se quede bloqueada esperando una respuesta que no va a llegar
async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs: number = TIMEOUT_MS, // establecemos el tiempo de conexión maximo a 15 segundos
) {
  const controller = new AbortController(); // creamos un controller para poder controlar la señal

  // Si se alcanza el tiempo de conexión, se aborta la petición
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal }); // hacemos la petición con la señal de abortar
  } finally {
    clearTimeout(timer); // limpiamos el timer para evitar que se ejecute después de la petición
  }
}

// Nota: se eliminó la caché persistente (AsyncStorage). Solo queda caché en memoria.

/**
 * Buscar releases en la API de Discogs.
 *
 * Realiza una búsqueda por texto y devuelve un array de resúmenes de releases.
 * La función usa caché en memoria con TTL para evitar peticiones repetidas durante la sesión.
 *
 * @param query Texto de búsqueda (artista, álbum, etc.). Se ignoran búsquedas vacías.
 * @returns Promise que resuelve con un array de `DiscogsReleaseSummary`.
 * @throws {Error} Lanza errores legibles en caso de timeout, problemas de red o respuestas HTTP (404/429/otros).
 */
export async function searchReleases(
  query: string,
): Promise<DiscogsReleaseSummary[]> {
  const q = query.trim(); // quitamos los espacios en blanco
  if (!q) return []; // si la busqueda esta vacia devolvemos un array vacio

  // La page y perPage son para controlar mejor lo que nos devuelve la API, al final la consulta a la api es como si
  // hicieramos una busqueda en una web normal, por eso debemos de controlar la busuqeda para obtener y filtrar que es lo que queremos
  // pensando en que una busqueda web tiene paginas de resultados, con un numero limitado de resultados por pagina, pues estamos controlando basicamente eso
  // en mi caso yo solo voy a querer los resultados de la primera pagina y como maximo 25 resultados, por que son suficientes para lo que voy a hacer en la app
  // y así evito que la app se quede bloqueada esperando una respuesta con demasiados resultados que no voy a usar
  const page = 1;
  const perPage = 25;
  const key = `${q}|p${page}|n${perPage}`; // generamos la parte de la url que hace la busqueda

  // miramos en la cache si ya tenemos los resultados de esa busqueda y si no han expirado los mostramos
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.ts < SEARCH_TTL) return cached.data;

  //si no hacemos peticion a la API
  const headers = await getAuthHeaders();
  const params = new URLSearchParams({
    //construimos la url de busqueda
    q,
    type: "release",
    page: String(page),
    per_page: String(perPage),
  });
  const url = `${API_BASE}/database/search?${params.toString()}`; // url de busqueda completa

  //hacemos la peticion a la api
  let res: Response;
  try {
    // intentamos hjacer la peticion
    res = await fetchWithTimeout(url, { headers }, TIMEOUT_MS);
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("Petición timeout");
    throw new Error("Error de red");
  }

  if (!res.ok) {
    // si la respuesta no es ok, miramos el status para saber que ha pasado
    if (res.status === 429) throw new Error("Discogs: rate limit (429)");
    throw new Error(`Discogs: HTTP ${res.status}`);
  }

  const json = await res.json(); // parseamos la respuesta a json

  // mapeamos los resultados a nuestro tipo de dato para que sea mas facil usar en la app
  const results: DiscogsReleaseSummary[] = Array.isArray(json.results)
    ? json.results.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        year: r.year,
        thumb: r.thumb,
        cover_image: r.cover_image,
        format: r.format
          ? Array.isArray(r.format)
            ? r.format
            : [r.format]
          : undefined,
        country: r.country,
        genre: r.genre,
        style: r.style,
      }))
    : [];

  // guardamos los resultados en la cache para futuras busquedas
  searchCache.set(key, { ts: Date.now(), data: results });
  return results;
}

/** Obtener detalle por id. */
// Esta funcion se encarga de obtener el detalle de un disco a partir de su id, que es lo que nos devuelve la busqueda
/**
 * Obtener detalle de un release por su id.
 *
 * Consulta la API de Discogs para recuperar la información completa de un release
 * y la cachea en memoria para futuras consultas durante la sesión.
 *
 * @param id Identificador numérico del release.
 * @returns Promise que resuelve con un `DiscogsReleaseDetail`.
 * @throws {Error} Lanza errores legibles para timeout, falta del release (404), rate limit (429) o errores HTTP.
 */
export async function getReleaseDetail(id: number) {
  const cached = detailCache.get(id); // miramos en la cache si ya tenemos el detalle de ese disco y si no ha expirado lo mostramos
  if (cached && Date.now() - cached.ts < DETAIL_TTL) return cached.data; // comprobamos si no ha expirado

  // hacemos la peticion a la API para obtener el detalle del disco
  const headers = await getAuthHeaders();
  const url = `${API_BASE}/releases/${id}`;

  // intentamos hacer la peticion
  let res: Response;
  try {
    // intentamos hacer la peticion
    res = await fetchWithTimeout(url, { headers }, TIMEOUT_MS);
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("Petición timeout");
    throw new Error("Error de red");
  }

  // si la respuesta no es ok, miramos el status para saber que ha pasado
  if (!res.ok) {
    if (res.status === 404) throw new Error("Release no encontrado");
    if (res.status === 429) throw new Error("Discogs: rate limit (429)");
    throw new Error(`Discogs: HTTP ${res.status}`);
  }

  const json = await res.json(); // parseamos la respuesta a json
  const detail: DiscogsReleaseDetail = {
    // mapeamos el resultado a nuestro tipo de dato para que sea mas facil usar en la app
    id: Number(json.id),
    title: json.title,
    artists: json.artists,
    year: json.year,
    images: json.images,
    formats: json.formats,
    tracklist: json.tracklist,
    labels: json.labels,
    videos: json.videos,
    resource_url: json.resource_url,
  };

  // guardamos el detalle en la cache para futuras consultas
  detailCache.set(id, { ts: Date.now(), data: detail });
  return detail;
}

/** Limpiar cachés */
/**
 * Limpiar la caché en memoria usada por el servicio.
 *
 * Borra las cachés `searchCache` y `detailCache` en memoria. No hay persistencia en disco.
 * @returns Promise<void>
 */
// clearDiscogsCache removed — not referenced in app code (see README only)
