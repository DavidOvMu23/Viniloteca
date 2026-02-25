import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

type Colors = {
  surface: string;
  border: string;
  muted: string;
  text: string;
  primary: string;
  contrastText: string;
};

type Props = {
  album: string;
  artist?: string;
  imageUrl?: string | null;
  year?: string | number | null;
  onRent: () => void;
  colors: Colors;
};

export default function DiscCard({
  album,
  artist,
  imageUrl,
  year,
  onRent,
  colors,
}: Props) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cover} />
      ) : (
        <View
          style={[styles.coverPlaceholder, { backgroundColor: colors.border }]}
        >
          <Text style={[styles.placeholderText, { color: colors.muted }]}>
            Sin imagen
          </Text>
        </View>
      )}

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
            onPress={onRent}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.rentButtonText, { color: colors.contrastText }]}
            >
              Alquilar
            </Text>
          </TouchableOpacity>
        </View>

        {artist ? (
          <Text
            style={[styles.artist, { color: colors.muted }]}
            numberOfLines={1}
          >
            {artist}
          </Text>
        ) : null}

        <Text style={[styles.year, { color: colors.muted }]}>
          {" "}
          {year ? `Año: ${year}` : "Año: —"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 12,
    alignItems: "center",
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
  placeholderText: { fontSize: 12 },
  cardInfo: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  album: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  artist: { fontSize: 14, marginTop: 2 },
  year: { fontSize: 13, marginTop: 6 },
  rentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  rentButtonText: { fontWeight: "700" },
});
