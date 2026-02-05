import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import Header from "src/components/Header/header";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav";
import { useThemePreference } from "src/providers/ThemeProvider";
import CustomButton from "src/components/Buttons/button";
import { searchDiscogs } from "src/services/discogsService";

// La información que devuelve Discogs es un poco lioso,
// así que creamos un tipo específico para los campos que solo queremos usar
type DiscogsItem = {
  id: number;
  title: string;
  year?: string | number;
  thumb?: string;
  cover_image?: string;
};

export default function Discos() {
  const { colors } = useThemePreference();
  // Estados básicos de la pantalla
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DiscogsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Barra inferior
  const navItems: BottomNavItem[] = [
    { icon: "home-outline", label: "Inicio", href: "/home" },
    {
      icon: "disc-outline",
      label: "Discos",
      href: "/discos",
      active: true,
    },
    { icon: "people-outline", label: "Clientes", href: "/client" },
    { icon: "person-circle-outline", label: "Perfil", href: "/profile" },
    { icon: "settings-outline", label: "Preferencias", href: "/preferences" },
  ];

  // Buscar discos en Discogs
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
      const results = await searchDiscogs(trimmed);
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

  // Lo usamos para que el flujo sea fácil de seguir: entrada (item) -> salida (artist, album, imageUrl, year)
  const getFields = (item: DiscogsItem) => {
    // 1) Título que devuelve Discogs normalmente tiene formato "Artista - Álbum"
    const titleParts = item.title ? item.title.split(" - ") : [""];

    // 2) Si hay un guion, la parte antes es artista
    const artist = titleParts.length > 1 ? titleParts[0] : "";

    // 3) El resto lo unimos para obtener el nombre del álbum (me lo hizo el chat por que no se veian bien los nombres de los álbumes en algunos casos)
    const album =
      titleParts.length > 1
        ? titleParts.slice(1).join(" - ")
        : item.title || "";

    // 4) Imagen
    const imageUrl = item.cover_image || item.thumb || null; // esto me lo hizo el chat por que si no habían discos en los que no se veian las imagenes

    // 5) Año: puede venir vacío
    const year = item.year || null;

    return { artist, album, imageUrl, year };
  };

  // Pintamos cada item usando el helper getFields para que sea fácil seguir el flujo
  const renderItem = ({ item }: { item: DiscogsItem }) => {
    // Extraemos campos de forma explícita (mira getFields arriba)
    const { artist, album, imageUrl, year } = getFields(item);

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Imagen: si existe mostramos, si no mostramos un placeholder */}
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

        {/* Información textual: álbum, artista y año */}
        <View style={styles.cardInfo}>
          {/* Álbum: mostramos el nombre que hemos extraído */}
          <Text
            style={[styles.album, { color: colors.text }]}
            numberOfLines={2}
          >
            {album}
          </Text>

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

  // UI principal de la pantalla
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header name="Discos" />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Catálogo</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Busca por artista o álbum.
        </Text>
        {/* Puedes escribir un artista, un álbum o ambos.
            Ej: "Daft Punk" o "Discovery" o "Daft Punk Discovery" */}

        {/* Input de búsqueda */}
        <TextInput
          mode="outlined"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder="Ej. Michael Jackson Thriller"
          outlineStyle={{ borderRadius: 12 }}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        {/* Botón de búsqueda */}
        <CustomButton
          text={loading ? "Buscando..." : "Buscar"}
          onPress={handleSearch}
        />

        {/* Cargando */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : null}

        {/* Error */}
        {error ? (
          <Text style={[styles.error, { color: "#ef4444" }]}>{error}</Text>
        ) : null}

        {/* Lista de resultados (scroll) */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
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
      <BottomNav items={navItems} showFab={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  input: {
    marginTop: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingVertical: 8,
    gap: 10,
    paddingBottom: 110,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  cover: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 11,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  album: {
    fontSize: 15,
    fontWeight: "700",
  },
  artist: {
    fontSize: 13,
  },
  year: {
    fontSize: 12,
  },
  empty: {
    fontSize: 13,
    marginTop: 6,
  },
  error: {
    fontSize: 13,
  },
});
