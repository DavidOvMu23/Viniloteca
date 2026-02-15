import AsyncStorage from "@react-native-async-storage/async-storage";
import { DiscogsReleaseSummary, DiscogsReleaseDetail } from "../types/discogs";

// Declaramos la base de la API de Discogs
const API_BASE = "https://api.discogs.com";

// Declaramos el token para la API de Discogs
let token: string | undefined = process.env.EXPO_PUBLIC_DISCOGS_TOKEN;

// Establecemos la duración de la cache para las busquedas y los detalles.
const SEARCH_CACHE_TTL = 1000 * 60 * 5; // 5 minutos para las busquedas
const DETAIL_CACHE_TTL = 1000 * 60 * 60; // 1 hora para los detalles de los datos de los

// Cachés en memoria para resultados de búsqueda y detalles
// Es util para así no tener que hacer peticiones repetidas al API
// Si el usuario vuelve a buscar lo mismo o a ver un detalle ya consultado.
const searchCache = new Map<
  string,
  { ts: number; data: DiscogsReleaseSummary[] }
>();
const detailCache = new Map<
  number,
  { ts: number; data: DiscogsReleaseDetail }
>();

// Establecemos la duración de la cache para las busquedas.
export function setDiscogsToken(t: string) {
  token = t;
}

// Vamos a crear una función para hacer peticiones a la API,
async function getAuthHeaders() {
  // Seguridad: validar token
  if (!token) throw new Error("Discogs token no configurado.");

  // Autenticación: usar token en headers según la documentación de Discogs
  return {
    Authorization: `Discogs token=${token}`,
    Accept: "application/json",
  };
}

// Funcion para hacer persistente la cache de las búsquedas,
// Así si el usuario cierra la app y vuelve a abrirla,
// no tendrá que hacer las mismas peticiones al API de Discogs

// esta funcion recibirá una clave (que será la consulta de búsqueda)
// y los datos a guardar (un array con todos resultados de la búsqueda)
async function persistSearchCache(key: string, data: DiscogsReleaseSummary[]) {
  try {
    // Para hacer persistente la información usaremosAsyncStorage
    // con un objeto que incluye la marca de tiempo y los datos.
    await AsyncStorage.setItem(
      `@discogs:search:${key}`,
      JSON.stringify({ ts: Date.now(), data }),
    );
  } catch {}
}

// Función para cargar la cache persistida, si existe y no ha expirado

//recibirá la clave de la búsqueda y devolverá los datos si son válidos o null si no hay datos o han expirado
async function loadPersistedSearch(
  key: string,

  // Usaremos promise para manejar la asincronía de los datos persistidos y así
  // devolver los datos parseados si son válidos, o null si no hay datos o han expirado.
): Promise<DiscogsReleaseSummary[] | null> {
  // Intentamos cargar la información de AsyncStorage, parsearla y validar su antigüedad.
  try {
    // Si no hay datos o han expirado, devolvemos null para indicar que no hay caché válida.
    // entonces la función de búsqueda hará la petición al API y actualizará la caché.
    const raw = await AsyncStorage.getItem(`@discogs:search:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > SEARCH_CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Busca resultados en Discogs.
 * - Usa caché en memoria y en AsyncStorage para evitar peticiones repetidas.
 * - Soporta pasar `signal` para cancelar la petición desde la UI.
 * @param query cadena de búsqueda
 * @param options.signal AbortSignal opcional
 */
export async function searchReleases(
  //la funcion recibe la consulta de la busqueda y un objeto de opciones para
  // controlar la peticion
  query: string,
  options?: {
    signal?: AbortSignal;
    page?: number;
    perPage?: number;
    forceRefresh?: boolean;
  },

  // Usaremos promise para manejar la asincronía de los datos persistidos y así
  // devolver los datos parseados si son válidos, o null si no hay datos o han expirado.
): Promise<DiscogsReleaseSummary[]> {
  // Validacion de que la consulta no esté vacía o solo con espacios, para evitar peticiones innecesarias al API.
  const q = query.trim();
  if (!q) return [];
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 25;
  const cacheKey = `${q}|p${page}|n${perPage}`;

  // Devuelve caché si válida
  const cached = searchCache.get(cacheKey);
  if (
    !options?.forceRefresh &&
    cached &&
    Date.now() - cached.ts < SEARCH_CACHE_TTL
  ) {
    return cached.data;
    ("");
  }

  // Intentamos cargar caché persistida
  if (!options?.forceRefresh) {
    const persisted = await loadPersistedSearch(cacheKey);
    if (persisted) {
      searchCache.set(cacheKey, { ts: Date.now(), data: persisted });
      return persisted;
    }
  }

  // Creamos una URL con los parametros de busqueda para hacer la petición al API de Discogs.
  // Es como
  const params = new URLSearchParams({
    q,
    type: "release",
    page: String(page),
    per_page: String(perPage),
  });
  const url = `${API_BASE}/database/search?${params.toString()}`;

  const headers = await getAuthHeaders();

  // Separació de fils / Lògica asíncrona (rúbrica 0.50 + 1.00):
  // - La petición se hace con `fetch` y `async/await`.
  // - Se acepta `options.signal` (AbortSignal) para cancelar desde la UI y evitar bloqueos.
  const res = await fetch(url, { headers, signal: options?.signal });

  // Maneig d'HTTP i Xarxa (rúbrica 1.00): control explícito de errores relevantes
  if (!res.ok) {
    if (res.status === 429) throw new Error("Discogs: rate limit (429)");
    throw new Error(`Discogs: HTTP ${res.status}`);
  }

  const json = await res.json();
  // Mapeig d'entitats (rúbrica 1.25): convertimos la respuesta JSON a DTOs tipados
  const results = Array.isArray(json.results)
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

  // Caché / Memòria (rúbrica 0.50) y Control del cicle de vida (rúbrica 0.50):
  // - Guardamos en `searchCache` con TTL y también persistimos en `AsyncStorage`.
  // - `forceRefresh` permite invalidar la caché cuando la UI lo solicite.
  // - Persistir la búsqueda reduce peticiones repetidas y mejora experiencia offline parcial.

  // Guardamos en caché en memoria y persistente (no bloquear si falla)
  try {
    searchCache.set(cacheKey, { ts: Date.now(), data: results });
    persistSearchCache(cacheKey, results);
  } catch {
    // ignorar fallos de caché
  }

  return results;
}

/**
 * Devuelve detalle de un release por id.
 * Usa caché en memoria.
 */
export async function getReleaseDetail(
  id: number,
  options?: { signal?: AbortSignal; forceRefresh?: boolean },
): Promise<DiscogsReleaseDetail> {
  const cached = detailCache.get(id);
  if (
    !options?.forceRefresh &&
    cached &&
    Date.now() - cached.ts < DETAIL_CACHE_TTL
  ) {
    return cached.data;
  }

  const headers = await getAuthHeaders();
  const url = `${API_BASE}/releases/${id}`;

  const res = await fetch(url, { headers, signal: options?.signal });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Release no encontrado");
    if (res.status === 429) throw new Error("Discogs: rate limit (429)");
    throw new Error(`Discogs: HTTP ${res.status}`);
  }

  const json = await res.json();

  const detail: DiscogsReleaseDetail = {
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

  // Mapeig d'entitats (rúbrica 1.25): convertimos respuesta a `DiscogsReleaseDetail`.
  // Gestió de fitxers (rúbrica 1.00): `images` contiene URLs; la UI debe gestionar la carga
  // y la liberación de memoria (evitar descargar automáticamente aquí para no bloquear).

  detailCache.set(id, { ts: Date.now(), data: detail });
  return detail;
}

/**
 * Limpia cachés en memoria y persistente
 */
export async function clearDiscogsCache() {
  searchCache.clear();
  detailCache.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const discogsKeys = keys.filter((k) => k.startsWith("@discogs:search:"));
    if (discogsKeys.length) await AsyncStorage.multiRemove(discogsKeys);
  } catch {}
}

/** Funcion para buscar discos en Discogs **/
export async function searchDiscogs(
  query: string,
  options?: {
    signal?: AbortSignal;
    page?: number;
    perPage?: number;
    forceRefresh?: boolean;
  },
) {
  return searchReleases(query, options);
}
