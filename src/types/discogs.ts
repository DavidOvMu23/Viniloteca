// Tipos para los datos recibidos de la API de Discogs.
// Estos tipos se usan en la capa de servicios y en hooks/components que consumen Discogs.

// Imagen de un release (forma mínima usada en la app).
// Lo uso en:
// - `src/services/discogsService.ts`: mapeo del detalle (`DiscogsReleaseDetail.images`).
export type DiscogsImage = {
  type: string;
  uri: string;
  resource_url?: string;
};

// Resumen de un release en resultados de búsqueda.
// Lo uso en:
// - `src/services/discogsService.ts`: resultado de `searchReleases`.
// - `app/(protected)/reservas.tsx` y hooks que cargan títulos/imágenes por ID.
export type DiscogsReleaseSummary = {
  id: number;
  title: string;
  year?: number;
  thumb?: string;
  cover_image?: string;
  format?: string[];
  country?: string;
  genre?: string[];
  style?: string[];
};

// Detalle completo de un release.
// Lo uso en:
// - `src/services/discogsService.ts`: `getReleaseDetail` devuelve este tipo.
// - Hooks/componentes que muestran información extendida de un disco.
export type DiscogsReleaseDetail = {
  id: number;
  title: string;
  artists?: Array<{ name: string; id?: number }>;
  year?: number;
  images?: DiscogsImage[];
  formats?: Array<{ name?: string; descriptions?: string[] }>;
  tracklist?: Array<{ position?: string; title?: string; duration?: string }>;
  labels?: Array<{ name?: string }>;
  videos?: Array<{ uri: string; title?: string }>;
  resource_url?: string;
};
