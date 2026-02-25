// este es el archivo de la pantalla de DISCOS, donde el usuario puede buscar discos por artista o título y ver los resultados con su portada. Desde aquí también puede ir a alquilar un disco.
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
// Header componente de cabecera reutilizable.
import Header from "src/components/Header/header";
// BottomNav barra inferior de navegación.
import BottomNav from "src/components/BottomNav/bottom_nav";
// BottomNavItem tipo para la lista de pestañas.
import { type BottomNavItem } from "src/types";
// useThemePreference para obtener colores del tema.
import { useThemePreference } from "src/providers/ThemeProvider";
// useUserStore para leer usuario y decidir si mostrar pestaña Clientes.
import { useUserStore } from "src/stores/userStore";
// CustomButton botones reutilizables.
import CustomButton from "src/components/Buttons/button";
// DiscCard componente para mostrar cada disco en los resultados.
import DiscCard from "src/components/DiscCard/DiscCard";
// searchReleases servicio que llama a la API de Discogs para búsquedas.
import { searchReleases } from "src/services/discogsService";

//definimos el tipo de dato que representa un disco que nos devuelve la API de Discogs. Esto nos ayuda a tener autocompletado y a entender qué campos podemos usar.
type DiscogsItem = {
  id: number;
  title: string;
  year?: string | number;
  thumb?: string;
  cover_image?: string;
};

// Constantes reutilizables para búsquedas aleatorias y placeholders.
const POPULAR_ARTISTS = [
  "Bruno Mars",
  "The Weeknd",
  "Bad Bunny",
  "Taylor Swift",
  "Rihanna",
  "Justin Bieber",
  "Lady Gaga",
  "Coldplay",
  "Billy Eilish",
  "Drake",
  "Ariana Grande",
  "Ed Sheeran",
  "David Guetta",
  "J Balvin",
  "Shakira",
  "Kendrick Lamar",
  "Eminem",
  "Maroon 5",
  "SZA",
  "Calvin Harris",
  "Kanye West",
  "Harry Styles",
  "Pitbull",
  "Sabrina Carpenter",
  "Sia",
  "Dua Lipa",
  "Post Malone",
  "Lana Del Rey",
  "Daddy Yankee",
  "Katy Perry",
  "Chris Brown",
  "Travis Scott",
  "Olivia Rodrigo",
  "Michael Jackson",
  "Doja Cat",
  "Adele",
  "Black eyes peas",
  "Imagine Dragons",
  "Red Hot Chili Peppers",
  "Metallica",
  "Nirvana",
  "Queen",
  "The Beatles",
  "Led Zeppelin",
  "Pink Floyd",
  "Radiohead",
  "U2",
  "The Rolling Stones",
  "Gorillaz",
  "Linkin Park",
  "Iron Maiden",
  "Green Day",
  "Aerosmith",
  "Pearl Jam",
  "Amon Amarth",
];

const ALBUM_SUFFIXES = [
  "Thriller",
  "Greatest Hits",
  "Live",
  "Deluxe",
  "Collection",
  "EP",
  "Single",
  "Remastered",
];

// La función principal del componente Discos. Aquí definimos toda la lógica y el diseño de la pantalla de búsqueda de discos.
export default function Discos() {
  const router = useRouter();

  // Obtenemos los colores del tema actual (claro/oscuro) para pintar
  // la pantalla con los colores correctos.
  const { colors } = useThemePreference();

  // query: lo que el usuario está escribiendo en el campo de búsqueda.
  // Empieza vacío (""). Cada vez que escribe una letra, se actualiza.
  const [query, setQuery] = useState("");

  // items: la lista de discos que nos devolvió la búsqueda.
  // Empieza como una lista vacía ([]). Se llena cuando llegan resultados.
  const [items, setItems] = useState<DiscogsItem[]>([]);

  // loading: indica si estamos esperando respuesta de Internet (true/false).
  // Cuando es true, mostramos la ruedita de "cargando…".
  const [loading, setLoading] = useState(false);

  // error: si algo sale mal (p.ej. no hay Internet), aquí guardamos el
  // mensaje de error para mostrárselo al usuario. Empieza como null (nada).
  const [error, setError] = useState<string | null>(null);

  // Barra inferior (solo mostramos Clientes si el usuario es SUPERVISOR)
  // Sacamos los datos del usuario del "almacén" (store).
  const user = useUserStore((s) => s.user);

  // Comprobamos si es administrador mirando su rol.
  const isAdmin = user?.roleName === "SUPERVISOR";

  // navItems: la lista de botones que aparecen en la barra de abajo.
  // Cada uno tiene: un icono, un texto (label) y a dónde lleva (href).
  // El de "Discos" está marcado como activo porque es la pantalla actual.
  // El de "Clientes" solo aparece si el usuario es administrador (isAdmin).
  const navItems: BottomNavItem[] = [
    { icon: "calendar-outline", label: "Reservas", href: "/reservas" },
    {
      icon: "disc-outline",
      label: "Discos",
      href: "/discos",
      active: true,
    },
  ];

  if (isAdmin) {
    navItems.push({
      icon: "people-outline",
      label: "Clientes",
      href: "/client",
    });
  }

  navItems.push(
    { icon: "person-circle-outline", label: "Perfil", href: "/profile" },
    { icon: "settings-outline", label: "Preferencias", href: "/preferences" },
  );

  //aqui definimos la función que se llama cuando el usuario pulsa el botón de "Buscar". Esta función se encarga de llamar a la API de Discogs, manejar los estados de carga y error, y guardar los resultados para mostrarlos en pantalla.
  const handleSearch = async () => {
    // 1) Evitamos disparar otra búsqueda si ya hay una en curso
    if (loading) return;
    // 2) Quitamos espacios para evitar buscar vacío
    const trimmed = query.trim();
    // 3) Si quedó vacío, no hacemos petición
    if (!trimmed) return;

    // 4) Indicamos que empezamos la petición
    setLoading(true);
    // 5) Limpiamos el error anterior antes de llamar a la API
    setError(null);

    try {
      // 6) Llamamos a Discogs
      const results = await searchReleases(trimmed);
      // 7) Guardamos la lista de resultados para pintarla abajo
      setItems(results);
    } catch (err) {
      // 8) Si algo falla, mostramos un mensaje legible en pantalla
      setError(err instanceof Error ? err.message : "Error buscando discos.");
    } finally {
      // 9) Quitamos el loading siempre
      setLoading(false);
    }
  };

  // Cargar discos aleatorios por defecto antes de que el usuario haga una búsqueda.
  // Elegimos una lista de términos/populares y hacemos una búsqueda aleatoria al montar.
  useEffect(() => {
    // Si ya hay items o hay una búsqueda activa, no cargamos aleatorios.
    if (items.length > 0 || loading) return;

    const popular = [...POPULAR_ARTISTS];

    // Placeholder pool: usamos los mismos nombres populares para generar
    // placeholders de ejemplo que cambian aleatoriamente.
    const albumSuffixes = [...ALBUM_SUFFIXES];

    // Utilitarios pequeños para mantener la función principal limpia
    const shuffle = <T,>(arr: T[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i];
        // swap
        arr[i] = arr[j];
        arr[j] = tmp;
      }
      return arr;
    };

    const dedupeById = (list: any[]) => {
      const map = new Map<number, any>();
      list.forEach((it) => {
        const id = Number(it?.id);
        if (!Number.isNaN(id) && !map.has(id)) map.set(id, it);
      });
      return Array.from(map.values());
    };

    const fetchRandomMix = async () => {
      setLoading(true);
      setError(null);
      try {
        const hasToken = Boolean(process.env.EXPO_PUBLIC_DISCOGS_TOKEN);
        const serverLimit = hasToken ? 60 : 25;
        const safeRequests = Math.max(5, Math.floor(serverLimit * 0.35));

        // build picks
        const pool = [...popular];
        const k = Math.min(25, safeRequests, pool.length);
        const picks: string[] = [];
        for (let i = 0; i < k && pool.length; i++) {
          const idx = Math.floor(Math.random() * pool.length);
          picks.push(pool.splice(idx, 1)[0]);
        }

        // Request all artists in parallel and tolerate individual failures
        const results = await Promise.all(
          picks.map((t) => searchReleases(t).catch(() => [])),
        );

        // Flatten, dedupe and shuffle
        const flat = results.flat().filter(Boolean) as DiscogsItem[];
        const unique = dedupeById(flat);
        const final = shuffle(unique).slice(0, 18);

        setItems(final);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando discos.");
      } finally {
        setLoading(false);
      }
    };

    fetchRandomMix();
    // Solo en el montaje
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Placeholder dinámico que rota entre ejemplos basados en la lista `popular`.
  const [placeholder, setPlaceholder] = React.useState(
    "Ej. Michael Jackson Thriller",
  );

  React.useEffect(() => {
    // Reuse shared constants for pool and albums to avoid duplication.
    const pool = [...POPULAR_ARTISTS];
    const albums = [...ALBUM_SUFFIXES];

    const pick = () => {
      const a = pool[Math.floor(Math.random() * pool.length)];
      const b = albums[Math.floor(Math.random() * albums.length)];
      setPlaceholder(`Ej. ${a} ${b}`);
    };

    pick();
    const id = setInterval(pick, 5000);
    return () => clearInterval(id);
  }, []);

  // Función para obtener los campos que necesitamos de los discos
  // que devuelve `searchReleases`.
  const getFields = (item: DiscogsItem) => {
    // 1) Título que devuelve Discogs normalmente tiene formato "Artista - Álbum"
    const titleParts = item.title ? item.title.split(" - ") : [""];

    // 2) Si hay un guion, la parte antes es artista
    const artist = titleParts.length > 1 ? titleParts[0] : "";

    // 3) El resto lo unimos para obtener el nombre del álbum (me lo hizo el chat por que no se veian bien los nombres de los álbumes en algunos casos)
    // 3) El resto lo unimos para obtener el nombre del álbum
    let album = "";
    if (titleParts.length > 1) {
      album = titleParts.slice(1).join(" - ");
    } else {
      album = item.title || "";
    }

    // 4) Imagen
    const imageUrl = item.cover_image || item.thumb || null; // esto me lo hizo el chat por que si no habían discos en los que no se veian las imagenes

    // 5) Año: puede venir vacío
    const year = item.year || null;

    return { artist, album, imageUrl, year };
  };

  // renderItem: mostramos los resultados en una lista

  //usamos la informacion proporcionada por getFields para obtener
  //los datos de cada disco
  const renderItem = ({ item }: { item: DiscogsItem }) => {
    const { artist, album, imageUrl, year } = getFields(item);

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Imagen: si existe mostramos la portada, si no mostramos un recuadro gris que dice "Sin imagen" */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cover} />
        ) : (
          <View
            style={[
              styles.coverPlaceholder,
              { backgroundColor: colors.border },
            ]}
          >
            <Text style={[styles.placeholderText, { color: colors.muted }]}>
              Sin imagen
            </Text>
          </View>
        )}

        {/* Información textual: álbum, artista y año. Botón alineado a la derecha del título */}
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text
              style={[styles.album, { color: colors.text }]}
              numberOfLines={2}
            >
              {album}
            </Text>

            <TouchableOpacity
              style={[
                styles.rentButton,
                { backgroundColor: colors.primary, borderColor: colors.border },
              ]}
              onPress={() => {
                router.push({
                  pathname: "/reserva/new",
                  params: {
                    discogsId: String(item.id),
                    title: album,
                    artist,
                  },
                });
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[styles.rentButtonText, { color: colors.contrastText }]}
              >
                Alquilar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Artista: si existe lo mostramos debajo */}
          {artist ? (
            <Text
              style={[styles.artist, { color: colors.muted }]}
              numberOfLines={1}
            >
              {artist}
            </Text>
          ) : null}

          {/* Año: si no hay mostramos un guion para que se vea claro */}
          <Text style={[styles.year, { color: colors.muted }]}>
            {" "}
            {year ? `Año: ${year}` : "Año: —"}
          </Text>
        </View>
      </View>
    );
  };

  // Función para guardar los cambios al editar un cliente. Se llama desde la pantalla de edición.

  // renderDiscItem: versión extraída para usar el componente DiscCard
  const renderDiscItem = ({ item }: { item: DiscogsItem }) => {
    const { artist, album, imageUrl, year } = getFields(item);

    return (
      <DiscCard
        album={album}
        artist={artist}
        imageUrl={imageUrl}
        year={year}
        colors={colors as any}
        onRent={() => {
          router.push({
            pathname: "/reserva/new",
            params: {
              discogsId: String(item.id),
              title: album,
              artist,
            },
          });
        }}
      />
    );
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera superior con el título "Discos" */}
      <Header name="Discos" />
      <View style={styles.content}>
        {/* Título grande: "Catálogo" */}
        <Text style={[styles.title, { color: colors.text }]}>Catálogo</Text>
        {/* Subtítulo indicando qué puede buscar el usuario */}
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Busca por artista o álbum.
        </Text>
        {/* Puedes escribir un artista, un álbum o ambos.
            Ej: "Daft Punk" o "Discovery" o "Daft Punk Discovery" */}

        {/* Input de búsqueda: aquí el usuario escribe lo que quiere buscar */}
        <TextInput
          mode="outlined"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder={placeholder}
          outlineStyle={{ borderRadius: 12 }}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        {/* Botón de búsqueda: cambia su texto a "Buscando…" mientras espera */}
        <CustomButton
          text={loading ? "Buscando..." : "Buscar"}
          onPress={handleSearch}
        />

        {/* Cargando: ruedita giratoria mientras esperamos la respuesta */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : null}

        {/* Error: mensaje en rojo si algo salió mal */}
        {error ? (
          <Text style={[styles.error, { color: "#ef4444" }]}>{error}</Text>
        ) : null}

        {/* Lista de resultados (se puede desplazar con el dedo) */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDiscItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading && !error ? (
              <Text style={[styles.empty, { color: colors.muted }]}>
                Sin resultados.
              </Text>
            ) : null
          }
        />
      </View>
      {/* Barra de navegación inferior con los iconos de las secciones */}
      <BottomNav items={navItems} />
    </View>
  );
}

// Aquí definimos los estilos de cada parte de la pantalla usando StyleSheet. Es como el CSS pero en React Native. Cada estilo es un objeto con propiedades que definen cómo se ve esa parte (colores, tamaños, márgenes, etc.).
const styles = StyleSheet.create({
  // Contenedor principal: ocupa toda la pantalla
  container: {
    flex: 1, // flex 1 = ocupa todo el espacio disponible (como estirar un chicle)
  },
  // Zona de contenido (todo menos la cabecera y la barra de abajo)
  content: {
    flex: 1, // ocupa el espacio restante
    padding: 16, // margen interior de 16 píxeles por cada lado (aire alrededor)
    gap: 8, // separación de 8 píxeles entre cada hijo (como dejar hueco entre fichas)
  },
  // Campo de texto de búsqueda
  input: {
    marginTop: 6, // pequeño espacio arriba para que no esté pegado al subtítulo
  },
  // Título "Catálogo"
  title: {
    fontSize: 18, // tamaño de letra grande (18 puntos)
    fontWeight: "700", // negrita fuerte (700 = bold)
  },
  // Subtítulo "Busca por artista o álbum."
  subtitle: {
    fontSize: 14, // tamaño de letra mediano
  },
  // La lista de discos en sí (el FlatList)
  list: {
    flex: 1, // ocupa todo el espacio vertical que pueda
    minHeight: 0, // truco para que el scroll funcione bien en algunas versiones
  },
  // El contenido interior de la lista (lo que hay dentro del scroll)
  listContent: {
    paddingVertical: 8, // aire arriba y abajo dentro de la lista
    gap: 10, // separación entre cada tarjeta de disco
    paddingBottom: 110, // espacio extra abajo para que la barra inferior no tape los últimos discos
  },
  // Tarjeta de cada disco (la ficha con portada e info)
  card: {
    flexDirection: "row", // los hijos van en fila (imagen a la izquierda, texto a la derecha)
    borderWidth: 1, // borde fino de 1 píxel alrededor
    borderRadius: 12, // esquinas redondeadas (12 píxeles de radio)
    padding: 10, // aire interior dentro de la tarjeta
    gap: 12, // separación entre la imagen y el texto
    alignItems: "center",
  },
  // Portada del disco (la imagen cuadrada)
  cover: {
    width: 70, // 70 píxeles de ancho
    height: 70, // 70 píxeles de alto (cuadrado)
    borderRadius: 8, // esquinas ligeramente redondeadas
  },
  // Recuadro que aparece cuando no hay imagen de portada
  coverPlaceholder: {
    width: 70, // mismo tamaño que la portada real
    height: 70, // mismo tamaño que la portada real
    borderRadius: 8, // esquinas redondeadas igual
    alignItems: "center", // centra el texto "Sin imagen" horizontalmente
    justifyContent: "center", // centra el texto "Sin imagen" verticalmente
  },
  // Texto "Sin imagen" dentro del placeholder
  placeholderText: {
    fontSize: 11, // letra pequeñita
  },
  // Zona de información textual (a la derecha de la portada)
  cardInfo: {
    flex: 1, // ocupa todo el ancho restante (lo que no usa la imagen)
    gap: 4, // pequeña separación entre álbum, artista y año
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  // Nombre del álbum
  album: {
    fontSize: 15, // tamaño de letra ligeramente grande
    fontWeight: "700", // negrita para que destaque
    flex: 1,
    marginRight: 8,
    flexShrink: 1,
  },
  // Nombre del artista
  artist: {
    fontSize: 13, // tamaño de letra normal
  },
  // Año del disco
  year: {
    fontSize: 12, // tamaño de letra pequeño
  },
  rentButton: {
    marginTop: 0,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  rentButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  // Mensaje "Sin resultados."
  empty: {
    fontSize: 13, // tamaño de letra normal
    marginTop: 6, // pequeño espacio arriba
  },
  // Mensaje de error
  error: {
    fontSize: 13, // tamaño de letra normal
  },
});
