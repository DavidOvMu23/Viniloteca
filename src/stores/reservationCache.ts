// Caché en memoria para reservas y datos de Discogs

type CacheEntry = {
  reservas: any[];
  images?: Record<number, string | null>;
  titles?: Record<number, string | null>;
};

const cache = new Map<string, CacheEntry>();

export function getCacheForUser(userId: string | undefined): CacheEntry | null {
  if (!userId) return null;
  return cache.get(userId) ?? null;
}

export function setCacheForUser(
  userId: string,
  reservas: any[],
  images?: Record<number, string | null>,
  titles?: Record<number, string | null>,
) {
  cache.set(userId, { reservas, images, titles });
}

export function updateReservationInCache(
  userId: string | undefined,
  updatedReservation: any,
) {
  if (!userId) return;
  const entry = cache.get(userId);
  if (!entry) return;
  const newReservas = entry.reservas.map((r) =>
    r.id === updatedReservation.id ? updatedReservation : r,
  );
  cache.set(userId, { ...entry, reservas: newReservas });
}

export function clearCacheForUser(userId: string | undefined) {
  if (!userId) return;
  cache.delete(userId);
}

export function setImagesAndTitlesForUser(
  userId: string,
  images: Record<number, string | null>,
  titles: Record<number, string | null>,
) {
  const entry = cache.get(userId) ?? { reservas: [] };
  cache.set(userId, { ...entry, images, titles });
}
