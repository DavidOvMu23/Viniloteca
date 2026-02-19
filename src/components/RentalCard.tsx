// este archivo define el componente RentalCard, que muestra la información de una reserva de alquiler en la pantalla de detalle de cliente.

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type RentalReservation } from "src/services/orderService";

// Definimos las props que necesita este componente
interface RentalCardProps {
  reservation: RentalReservation;
  imageUrl: string | null | undefined; // undefined = aún cargando datos de discogs
  discogsTitle: string | null | undefined;
  isLoadingDiscogs: boolean; // para saber si estamos esperando a la API de Discogs
  onReturn: (id: string) => void;
  colors: any; // Pasamos los colores del tema desde el padre
}

// El componente RentalCard muestra la información de una reserva de alquiler,
// incluyendo el título del disco, fechas, estado y una imagen. También tiene un botón para marcar la devolución.

//para mostrar la informacion de la api lo que hacemos es usar la funcion que hay en el service llamada getReleaseById,
// esta funcion se encarga de hacer la peticion a la api de discogs y devolver la informacion del disco,
// esta informacion la usamos para mostrarla en la tarjeta de alquiler.
export default function RentalCard({
  reservation,
  imageUrl,
  discogsTitle,
  isLoadingDiscogs,
  onReturn,
  colors,
}: RentalCardProps) {
  // Estado local para saber si la IMAGEN (el jpg/png) se está descargando
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);
  const isOverdue = reservation.status === "VENCIDO"; // Si el estado es VENCIDO, la reserva está pasada de fecha y sin devolución.
  const canMarkReturned = reservation.status !== "FINALIZADO"; // Solo se puede marcar como devuelto si no está ya FINALIZADO.
  const wasReturnedLate = !!reservation.returnedAt && reservation.returnedLate; // Si ya se devolvió pero fue después de la fecha límite, mostramos un aviso de devolución tardía.

  // Helpers de formato (podrían estar fuera, pero aquí están encapsulados)
  const displayDate = (date: string) => date.slice(0, 10);

  // Función para obtener estilos de la pastilla de estado según el estado del pedido
  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case "FINALIZADO":
        return { backgroundColor: "#f3f4f6", borderColor: "#9ca3af" };
      case "VENCIDO":
        return { backgroundColor: "#fef3f2", borderColor: "#ef4444" };
      case "PREPARADO":
        return { backgroundColor: "#e0f2fe", borderColor: "#0ea5e9" };
      default:
        return { backgroundColor: "#e5e7eb", borderColor: "#9ca3af" };
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* ── Columna izquierda: Textos ── */}
      <View style={styles.cardLeft}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {discogsTitle ? discogsTitle : `Disco #${reservation.discogsId}`}
        </Text>

        <Text style={[styles.cardDetail, { color: colors.muted }]}>
          Inicio: {displayDate(reservation.rentedAt)}
        </Text>

        <Text style={[styles.cardDetail, { color: colors.muted }]}>
          Devolución: {displayDate(reservation.dueAt)}
        </Text>

        {/* Pastilla de estado */}
        <View style={[styles.statusPill, getStatusStyle(reservation.status)]}>
          <Text style={styles.statusPillText}>{reservation.status}</Text>
        </View>

        {/* Aviso de vencido (sin devolver) */}
        {isOverdue && (
          <View style={styles.warningRow}>
            <Ionicons name="warning-outline" size={18} color="#f59e0b" />
            <Text style={styles.warningText}>
              Reserva pasada de fecha y sin devolución.
            </Text>
          </View>
        )}

        {/* Aviso de devolución tardía (ya devuelta después de la fecha) */}
        {wasReturnedLate && (
          <View style={styles.warningRow}>
            <Ionicons name="warning-outline" size={18} color="#ef4444" />
            <Text style={[styles.warningText, { color: "#b91c1c" }]}>
              Reserva devuelta fuera de plazo.
            </Text>
          </View>
        )}
      </View>

      {/* ── Columna derecha: Imagen + Botón ── */}
      <View style={styles.cardImageWrapper}>
        {/* LÓGICA DE CARGA DE IMAGEN:
            1. Si isLoadingDiscogs es true, estamos buscando la URL -> SPINNER
            2. Si tenemos imageUrl, mostramos la imagen.
            2.1 Mientras la imagen descarga -> SPINNER encima o debajo
            3. Si no hay imageUrl (y no carga discogs) -> Placeholder "No imagen"
        */}

        {isLoadingDiscogs ? (
          <View
            style={[styles.loadingPlaceholder, { borderColor: colors.border }]}
          >
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : imageUrl && !isImageError ? (
          <View style={{ position: "relative" }}>
            {/* Spinner superpuesto mientras carga la imagen real */}
            {isImageLoading && (
              <View
                style={[
                  styles.imageLoaderOverlay,
                  { backgroundColor: colors.surface },
                ]}
              >
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            <Image
              key={imageUrl} // Forzar reinicio del componente si cambia la URL
              source={{ uri: imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
              onLoadStart={() => {
                setIsImageLoading(true);
                setIsImageError(false);
              }}
              onLoadEnd={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setIsImageError(true);
              }}
              accessibilityLabel={`Portada del disco ${discogsTitle ?? reservation.discogsId}`}
            />
          </View>
        ) : (
          // Placeholder sin imagen
          <View
            style={[
              styles.cardImagePlaceholder,
              { borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardImageText, { color: colors.muted }]}>
              No imagen
            </Text>
          </View>
        )}

        {/* Botón Devolución */}
        {canMarkReturned && (
          <TouchableOpacity
            style={[
              styles.returnButton,
              { backgroundColor: colors.primary, borderColor: colors.border },
            ]}
            onPress={() => {
              try {
                Alert.alert(
                  "Confirmar devolución",
                  "¿Quieres marcar esta reserva como devuelta?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Confirmar",
                      onPress: () => {
                        console.log(
                          "RentalCard: onReturn press",
                          reservation.id,
                        );
                        if (typeof onReturn === "function") {
                          void onReturn(reservation.id);
                        } else {
                          Alert.alert(
                            "Error",
                            "Función onReturn no disponible.",
                          );
                        }
                      },
                    },
                  ],
                );
              } catch (e) {
                console.error("RentalCard: Alert failed", e);
                if (typeof onReturn === "function")
                  void onReturn(reservation.id);
              }
            }}
          >
            <Text
              style={[styles.returnButtonText, { color: colors.contrastText }]}
            >
              Devolución
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Estilos específicos de la tarjeta
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 120,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardDetail: {
    fontSize: 13,
  },
  statusPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  warningText: {
    fontSize: 12,
    color: "#b45309",
    fontWeight: "600",
    flex: 1,
  },
  // La columna derecha tiene width fijo para la imagen
  cardImageWrapper: {
    width: 80,
    alignItems: "center",
    gap: 8,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  loadingPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
  },
  imageLoaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    zIndex: 1, // asegura que quede encima
  },
  cardImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  cardImageText: {
    fontSize: 10,
    textAlign: "center",
  },
  returnButton: {
    width: "100%",
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 4,
  },
  returnButtonText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
