// Creación de tipos para los datos que recibimos de la API de discogs,
// así será mas facil trabajar con los datos y evitar errores

// Tipo para las imagenes de un release.
export type DiscogsImage = {
  type: string;
  uri: string;
  resource_url?: string;
};

// Tipo para el resumen de un release en los resultados de búsqueda.
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

// Tipo para el detalle completo de un release.
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
