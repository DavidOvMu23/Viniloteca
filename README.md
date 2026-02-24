# Viniloteca

> Una app móvil minimalista para buscar discos, ver detalles y navegar tu colección favorita.

<img src="assets/logo-claro.png" alt="Viniloteca — placeholder banner" width="200" />

**Tecnologías:** React Native + Expo · TypeScript

---

## ✨ Qué hace

- Buscar releases (discos) por texto (artista, álbum, etc.).
- Ver detalle de cada release (tracklist, imágenes, artistas, etiquetas).
- Caché en memoria para reducir llamadas repetidas durante la sesión.
- Manejo de timeouts y errores HTTP básicos (404, 429, etc.).

---

## 🚀 Quick start

1. Clona el repo:

```bash
git clone <repo-url>
cd Viniloteca
```

2. Instala dependencias:

```bash
npm install
```

3. Arranca la app (Expo):

```bash
npm start
# o
expo start
```

4. Abre en tu emulador o dispositivo mediante la interfaz de Expo.

---

## 🧩 Variables de entorno

- `EXPO_PUBLIC_DISCOGS_TOKEN` — token público para la API de Discogs. Define esta variable
  en tu entorno o en la configuración de Expo antes de ejecutar la app.

---

## 🗂 Estructura principal

```
app/
  ├─ (protected)/      # pantallas protegidas (autenticadas)
  ├─ index.tsx
  └─ ...
src/
  ├─ components/        # UI components
  ├─ hooks/             # custom hooks
  ├─ providers/         # context providers
  ├─ services/          # adapters (ej. discogsService.ts)
  └─ stores/            # Zustand / stores
assets/
  └─ ...
supabase/
  └─ supabaseClient.ts  # (si aplica)
```

---

## 🧾 Scripts útiles

```bash
npm start        # inicia Metro/Expo
npm run ios      # si está configurado para iOS
npm run android  # si está configurado para Android
npm run lint     # ejecutar linter (si existe)
npm test         # ejecutar tests (si existen)
```

---

## 🔧 Notas de implementación

- El adaptador a Discogs está en `src/services/discogsService.ts`.
  - Exporta: `searchReleases(query)`, `getReleaseDetail(id)`, `clearDiscogsCache()`.
  - Forza `page = 1` y `per_page = 25` (la paginación se puede añadir si se desea).
  - Caché en memoria con TTL para evitar llamadas repetidas durante la sesión.

- Autenticación: el token se añade en las cabeceras (Authorization: `Discogs token=...`).

---

## 🎯 Buenas prácticas y recomendaciones

- No subas tokens privados: `EXPO_PUBLIC_DISCOGS_TOKEN` debe gestionarse según tu
  política de seguridad.
- Evita bursts de peticiones para no alcanzar limitaciones del API (429).
- Añade tests unitarios y de integración antes de lanzar a producción.

---

## 🤝 Contribuir

Abre un issue o PR con cambios: ejemplos de mejoras deseables

- Añadir paginación completa.
- Implementar límite de concurrencia para proteger contra rate-limits.
- Añadir tests y pipelines CI.

---

## 📸 Capturas y demo

Agrega aquí capturas de la app o un GIF corto para mostrar la experiencia. Ejemplo:

```
assets/screenshots/search.png
assets/screenshots/detail.png
```

---

## ⚖️ Licencia

Indica la licencia del proyecto aquí (MIT, Apache, etc.).

---

Made with ❤️ — ¡A programar y a escuchar vinilos!

## Contenido del repositorio

- `app/` — rutas y pantallas de la aplicación (incluye la carpeta `(protected)` para vistas protegidas).
- `src/` — código fuente TypeScript: componentes, hooks, providers, servicios y stores.
- `assets/` — imágenes y recursos estáticos.
- `supabase/` — cliente/configuración de Supabase (si se usa en el proyecto).
- `package.json`, `tsconfig.json`, `eas.json`, `app.json` — configuración del proyecto.

## Características

- Búsqueda de releases por texto (artista, álbum, etc.).
- Visualización de detalle de releases.
- Caché en memoria para evitar peticiones repetidas durante la sesión.
- Manejo de timeouts y errores HTTP (404, 429, etc.).

## Requisitos

- Node.js (LTS recomendado).
- Expo CLI (opcional, para desarrollo en dispositivo/emulador).

## Variables de entorno

- `EXPO_PUBLIC_DISCOGS_TOKEN`: token público para la API de Discogs. Defínelo en tu
  entorno o en la configuración de Expo antes de ejecutar la app.

## Instalación y ejecución (desarrollo)

1. Instala dependencias:

```bash
npm install
```

2. Ejecuta la app en modo desarrollo (Expo):

```bash
npm start
# o
expo start
```

3. Abre en emulador o dispositivo usando la interfaz de Expo.

## Estructura importante

- `src/services/discogsService.ts`: adaptador que contiene la lógica para llamar a Discogs.
  Exporta `searchReleases`, `getReleaseDetail` y `clearDiscogsCache`. Actualmente la
  implementación fuerza `page = 1` y `per_page = 25` y usa caché en memoria con TTL.
- `src/providers/` y `src/stores/`: configuración de contexto y estado global.
- `src/hooks/`: hooks personalizados para lógica de negocio y queries.

## Notas de desarrollo

- La caché en memoria reduce llamadas repetidas durante la sesión; si prefieres
  persistencia entre sesiones, podemos reintroducir `AsyncStorage`.
- Evita generar demasiadas llamadas concurrentes para no alcanzar los rate-limits de
  Discogs (respuestas 429). Si lo deseas, añado un semáforo/concurrency limit.

## Tests

- No hay tests incluidos por defecto. Recomendación: añadir Jest + React Native Testing
  Library para unit e integration tests.

Viniloteca — Servicio Discogs

Este módulo proporciona funciones de utilidad para consultar la API pública de Discogs
desde la app Viniloteca. Está pensado como un adaptador ligero: evita lógicas UI y expone
operaciones asincrónicas sencillas.

## Base de la API

- Endpoint usado: https://api.discogs.com

## Funciones exportadas

- `searchReleases(query: string): Promise<DiscogsReleaseSummary[]>`
  - Realiza una búsqueda por texto (artista, álbum, etc.).
  - La implementación fuerza siempre `page = 1` y `per_page = 25`
  - Usa caché en memoria con TTL para evitar peticiones repetidas durante la sesión.

- `getReleaseDetail(id: number): Promise<DiscogsReleaseDetail>`
  - Recupera el detalle completo de un release por su `id`.
  - Resultados cacheados en memoria durante la sesión.

- `clearDiscogsCache(): Promise<void>`
  - Limpia las caches en memoria (`searchCache` y `detailCache`).

**Nota:** la función de subida de archivos (`uploadFile`) y la persistencia en `AsyncStorage`
se eliminaron por decisión del proyecto — ahora solo hay caché en memoria.

## Requisitos y configuración

- Define la variable de entorno `EXPO_PUBLIC_DISCOGS_TOKEN` con tu token de Discogs.
  El servicio lee `process.env.EXPO_PUBLIC_DISCOGS_TOKEN` al arrancar y la utiliza en la
  cabecera `Authorization: Discogs token=...`.

- No hay dependencias externas obligatorias aparte del runtime (fetch nativo).

## Comportamiento clave

- Timeout de red: 15s por petición.
- Control de errores: se lanzan `Error` con mensajes legibles para timeouts, problemas de
  red y códigos HTTP relevantes (404, 429, etc.).
- Caché: en memoria con TTLs definidos en `src/services/discogsService.ts` (`SEARCH_TTL`,
  `DETAIL_TTL`). Si quieres desactivar la caché, llama a `clearDiscogsCache()` o pide
  que lo modifique para forzar siempre la red.

## Ejemplo de uso

```ts
import {
  searchReleases,
  getReleaseDetail,
} from "./src/services/discogsService";

// búsqueda simple (page y per_page están forzados internamente)
const results = await searchReleases("beatles");
if (results.length) {
  const detail = await getReleaseDetail(results[0].id);
  console.log(detail.title);
}
```

## Contribuciones

Abre un issue o un pull request con cambios propuestos. Buenas mejoras:

- Añadir paginación completa (UI + service).
- Añadir tests automáticos.
- Implementar límites de concurrencia para peticiones a Discogs.

## Licencia

Indica aquí la licencia del proyecto si procede.
