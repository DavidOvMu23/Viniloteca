// este archivo maneja toda la lógica de la pantalla de RESERVAS, donde el usuario puede ver sus alquileres activos, vencidos y finalizados. También puede marcar un alquiler como devuelto desde esta pantalla. Además, se enriquece visualmente cada reserva con la portada y el título del disco sacados de la API de Discogs usando el discogsId que tenemos en cada reserva.

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "src/components/Header/header";
import BottomNav, {
  type BottomNavItem,
} from "src/components/BottomNav/bottom_nav";
import RentalCard from "src/components/RentalCard";
import { useThemePreference } from "src/providers/ThemeProvider";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserStore } from "src/stores/userStore";
import {
  getReservationsByUserId,
  markReservationAsReturned,
  type RentalReservation,
} from "src/services/orderService";
import Constants from "expo-constants";
import * as Device from "expo-device";

// Tipos y funciones de enriquecimiento visual con Discogs
type ReservationFilter = "TODAS" | "ACTIVAS" | "VENCIDAS" | "FINALIZADAS";

// aqui definimos el tipo de datos que esperamos recibir de la API de Discogs cuando pedimos el resumen de un lanzamiento. Esto nos ayuda a tener un código más claro y a saber qué campos podemos usar sin miedo a errores de tipeo o datos inesperados.
type DiscogsReleaseSummary = {
  imageUrl: string | null;
  title: string | null;
};

// buildDiscogsUrl: función que construye la URL para pedir el resumen de un lanzamiento a la API de Discogs dado su ID y nuestro token de acceso. Esto nos permite luego llamar a esta función cada vez que necesitemos obtener datos de Discogs sin repetir código.
function buildDiscogsUrl(discogsId: number, token: string): string {
  return `https://api.discogs.com/releases/${discogsId}?token=${encodeURIComponent(
    token,
  )}`;
}
// Con esto configuramos cómo se mostrarán las notificaciones cuando lleguen
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
//funcion para obtener el resumen de un lanzamiento de Discogs dado su ID. Hace una petición a la API de Discogs, maneja posibles errores y devuelve un objeto con la URL de la imagen y el título del disco. Si algo falla, devuelve null en ambos campos para que el resto del código pueda manejarlo sin problemas.
async function fetchDiscogsReleaseSummary(
  discogsId: number,
  token: string,
): Promise<DiscogsReleaseSummary> {
  // Valor por defecto si algo falla: sin imagen, sin título.
  const fallback: DiscogsReleaseSummary = { imageUrl: null, title: null };

  try {
    // Construimos la URL y hacemos la petición a Discogs.
    const url = buildDiscogsUrl(discogsId, token);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    // Si la respuesta no es exitosa (p.ej. 404), devolvemos el fallback.
    if (!response.ok) {
      return fallback;
    }

    // Parseamos la respuesta JSON y extraemos imagen y título.
    const payload = await response.json();
    return {
      // Para la imagen: primero intentamos la primera imagen de la lista,
      // luego cover_image como alternativa, y si no hay nada → null.
      imageUrl:
        (payload?.images?.[0]?.uri as string | undefined) ??
        (payload?.cover_image as string | undefined) ??
        null,
      // Para el título: lo sacamos directamente del campo "title".
      title: (payload?.title as string | undefined) ?? null,
    };
  } catch {
    // Si hay error de red u otro problema, devolvemos el fallback.
    return fallback;
  }
}

// Función para cargar resúmenes de Discogs para una lista de IDs. Devuelve dos mapas: uno de ID a imagen y otro de ID a título. Esto nos permite enriquecer la información de las reservas con datos visuales y descriptivos de los discos.
async function loadDiscogsSummariesByIds(
  discogsIds: number[],
  token: string,
): Promise<{
  imageMap: Record<number, string | null>;
  titleMap: Record<number, string | null>;
}> {
  // Eliminamos IDs repetidos para no hacer peticiones de más.
  // Mostrar token en UI para depuración (puedes quitar esto en producción)
  const uniqueIds = Array.from(new Set(discogsIds));

  // Limitar para evitar hacer demasiadas peticiones al cargar montones de reservas
  const MAX_IDS = 60;
  const ids = uniqueIds.slice(0, MAX_IDS);

  // Diccionarios vacíos que iremos rellenando.
  const imageMap: Record<number, string | null> = {};
  const titleMap: Record<number, string | null> = {};

  // Hacemos peticiones en paralelo con concurrencia limitada para no saturar la red
  const CONCURRENCY = 6;
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    chunks.push(ids.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    // Ejecutamos el lote en paralelo
    await Promise.all(
      chunk.map(async (discogsId) => {
        try {
          const summary = await fetchDiscogsReleaseSummary(discogsId, token);
          imageMap[discogsId] = summary.imageUrl;
          titleMap[discogsId] = summary.title;
        } catch {
          imageMap[discogsId] = null;
          titleMap[discogsId] = null;
        }
      }),
    );
  }

  return { imageMap, titleMap };
}

//función principal del componente de reservas. Aquí se maneja toda la lógica de la pantalla: cargar las reservas del usuario, manejar estados de carga y error, filtrar las reservas según el estado, enriquecerlas con datos de Discogs y renderizar la interfaz con los componentes visuales.
export default function Reservas() {
  // Leemos del almacén global la información del usuario logueado.
  const user = useUserStore((state) => state.user);

  // router y params para manejar navegación desde notificaciones
  const router = useRouter();
  const params = useLocalSearchParams<{ reservationId?: string }>();

  // Obtenemos la paleta de colores según el tema actual (claro/oscuro).
  const { colors } = useThemePreference();

  // reservas: la lista completa de alquileres del usuario.
  // Empieza vacía ([]) y se llena cuando llegan los datos del servidor.
  const [reservas, setReservas] = useState<RentalReservation[]>([]);

  // loading: indica si estamos esperando respuesta del servidor.
  // Cuando es true, mostramos la ruedita de "cargando…".
  const [loading, setLoading] = useState(false);

  // error: mensaje de error si algo falla al cargar las reservas.
  // Empieza como null (sin error).
  const [error, setError] = useState<string | null>(null);

  // filter: qué filtro tiene seleccionado el usuario ahora mismo.
  // Empieza en "TODAS" (mostrar todas las reservas).
  const [filter, setFilter] = useState<ReservationFilter>("TODAS");

  // Comprobamos si el usuario es supervisor (administrador).
  const isAdmin = user?.roleName === "SUPERVISOR";

  // navItems: la lista de pestañas de la barra inferior.
  // useMemo la recalcula solo si cambia isAdmin.
  // "Reservas" está marcada como activa porque es la pantalla actual.
  // "Clientes" solo aparece si el usuario es administrador.
  const navItems = useMemo<BottomNavItem[]>(() => {
    const items: BottomNavItem[] = [
      {
        icon: "calendar-outline",
        label: "Reservas",
        href: "/reservas",
        active: true,
      },
      { icon: "disc-outline", label: "Discos", href: "/discos" },
    ];

    if (isAdmin) {
      items.push({
        icon: "people-outline",
        label: "Clientes",
        href: "/client",
      });
    }

    items.push(
      { icon: "person-circle-outline", label: "Perfil", href: "/profile" },
      { icon: "settings-outline", label: "Preferencias", href: "/preferences" },
    );

    return items;
  }, [isAdmin]);

  // Solicitar permiso y registrar token Expo Push (se ejecuta al montar y cuando cambia el usuario)
  useEffect(() => {
    async function obtenerToken() {
      if (!Device.isDevice) {
        console.log(
          "Las notificaciones push solo funcionan en un móvil físico.",
        );
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permiso de notificaciones denegado por el usuario.");
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        try {
          const { registerExpoPushToken } =
            await import("src/services/profile");
          await registerExpoPushToken(tokenData.data);
          console.log("Token registrado en perfil:", tokenData.data);
        } catch (err) {
          console.log("Error registrando token en backend:", err);
        }
      } catch (error) {
        console.log("Error al obtener el token de notificaciones: ", error);
      }
    }

    void obtenerToken();
  }, [user?.id]);

  // Se ejecuta cuando la pantalla aparece o cuando cambia el user.id.
  //
  // Analogía: abrimos la libreta de préstamos y copiamos TODAS las
  //           líneas del usuario a la pantalla.
  //
  // Usamos una variable "active" para evitar actualizar el estado
  // si el componente se desmonta antes de que llegue la respuesta
  // (esto evita un warning de React y posibles bugs raros).
  useEffect(() => {
    // Si no hay usuario logueado, no hacemos nada.
    if (!user?.id) return;

    // Bandera para evitar actualizar estado tras desmontar.
    let active = true;

    const load = async () => {
      try {
        // Activamos la ruedita de carga y limpiamos errores previos.
        setLoading(true);
        setError(null);

        // Pedimos las reservas al servicio (que habla con Supabase).
        const data = await getReservationsByUserId(user.id);

        // Solo actualizamos si el componente sigue montado.
        if (active) setReservas(data);
      } catch (err) {
        // Si hay error, guardamos un mensaje legible.
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las reservas.",
          );
        }
      } finally {
        // Quitamos la ruedita de carga pase lo que pase.
        if (active) setLoading(false);
      }
    };

    void load();

    // Función de limpieza: si el componente se desmonta, marcamos
    // active = false para que las respuestas tardías se ignoren.
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Guardamos las miniaturas y títulos como diccionarios (ID → valor)
  const [images, setImages] = useState<Record<number, string | null>>({});
  const [titles, setTitles] = useState<Record<number, string | null>>({});

  // Ref al FlatList para poder desplazarnos a una reserva concreta
  const listRef = useRef<FlatList<RentalReservation> | null>(null);

  useEffect(() => {
    const token = process.env.EXPO_PUBLIC_DISCOGS_TOKEN?.trim();
    if (!token || reservas.length === 0) return;

    let active = true;

    const loadImages = async () => {
      // Identificar qué IDs nos faltan por cargar para no machacar los existentes
      const discogsIds = reservas.map((r) => r.discogsId);
      const uniqueIds = Array.from(new Set(discogsIds));

      // Filtramos solo los que NO tenemos ya en el estado "images"
      // (Opcional: si quieres refrescar siempre, quita el filtro.
      //  Pero filtrar evita parpadeos si "reservas" se actualiza por otra razón).
      const idsToLoad = uniqueIds.filter((id) => images[id] === undefined);

      if (idsToLoad.length === 0) return;

      const { imageMap, titleMap } = await loadDiscogsSummariesByIds(
        idsToLoad,
        token,
      );

      if (!active) return;

      // Actualizamos el estado mezclando lo nuevo con lo viejo
      setImages((prev) => ({ ...prev, ...imageMap }));
      setTitles((prev) => ({ ...prev, ...titleMap }));
    };

    void loadImages();

    return () => {
      active = false;
    };
  }, [reservas]); // Dependencia necesaria, pero controlada dentro con el chequeo

  // Si la pantalla recibe un param `reservationId` en la URL, intentamos
  // desplazar la lista hacia esa reserva (útil cuando el usuario toca la notificación).
  useEffect(() => {
    const reservationId = params?.reservationId;
    if (!reservationId || reservas.length === 0) return;

    const idx = reservas.findIndex((r) => r.id === reservationId);
    if (idx === -1) return;

    // Intentamos scrollToIndex; evitamos errores si el índice no está cargado aún.
    try {
      listRef.current?.scrollToIndex({ index: idx, animated: true });
    } catch {
      // si falla (índice no en pantalla), ignoramos silenciosamente
    }
  }, [params?.reservationId, reservas]);

  // Listeners de notificaciones: recibir (foreground) y respuesta (tap)
  useEffect(() => {
    // Solo activa si hay usuario (necesitamos saber a qué recargar)
    if (!user?.id) return;

    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as any;
        // Si la notificación indica que hay que refrescar la lista, lo hacemos.
        if (data?.refresh === true) {
          void (async () => {
            try {
              setLoading(true);
              const data = await getReservationsByUserId(user.id);
              setReservas(data);
            } catch {
              // no hacemos nada aquí, la UI ya maneja errores en la carga inicial
            } finally {
              setLoading(false);
            }
          })();
        }
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as any;
        const reservationId = data?.reservationId || data?.reservation_id;

        // Si viene un id de reserva, abrimos la pantalla de reservas con query
        // para que ésta pueda desplazarse hacia la reserva concreta.
        if (reservationId) {
          void router.push(`/reservas?reservationId=${reservationId}`);
        } else {
          void router.push("/reservas");
        }
      });

    return () => {
      try {
        receivedListener?.remove?.();
      } catch {}
      try {
        responseListener?.remove?.();
      } catch {}
    };
  }, [user?.id, router]);

  // Cuando el usuario pulsa "Devolución" en una tarjeta, llamamos al
  // servicio para marcar esa reserva como finalizada y actualizamos
  // SOLO esa reserva en la lista local (sin recargar todo).
  //
  // Analogía: tachar una sola línea de la libreta de préstamos
  //           en vez de reescribir la libreta entera.
  const onReturnWrapper = async (reservationId: string) => {
    try {
      // Marcamos la reserva como devuelta en la base de datos.
      const updated = await markReservationAsReturned(reservationId);

      // Actualizamos la lista local reemplazando solo la reserva afectada.
      setReservas((prev) =>
        prev.map((item) => (item.id === reservationId ? updated : item)),
      );

      // Mostramos un mensaje de éxito al usuario.
      Alert.alert(
        "Devolución guardada",
        "La reserva se marcó como finalizada.",
      );
    } catch (err) {
      // Si algo falla, mostramos un mensaje de error.
      Alert.alert(
        "Error",
        err instanceof Error
          ? err.message
          : "No se pudo registrar la devolución.",
      );
    }
  };

  // useMemo recalcula la lista filtrada solo cuando cambia "filter"
  // o "reservas". Así evitamos filtrar en cada redibujado.
  //
  //   TODAS       → mostramos todas las reservas
  //   ACTIVAS     → solo las que están en plazo (PREPARADO)
  //   VENCIDAS    → solo las que se pasaron de fecha (VENCIDO)
  //   FINALIZADAS → solo las que ya se devolvieron (FINALIZADO)
  const filteredReservas = useMemo(() => {
    if (filter === "TODAS") return reservas;
    if (filter === "ACTIVAS") {
      return reservas.filter((item) => item.status === "PREPARADO");
    }
    if (filter === "VENCIDAS") {
      return reservas.filter((item) => item.status === "VENCIDO");
    }
    return reservas.filter((item) => item.status === "FINALIZADO");
  }, [filter, reservas]);

  // Cada uno tiene una clave interna (key) y un texto visible (label).
  const filters: Array<{ key: ReservationFilter; label: string }> = [
    { key: "TODAS", label: "Todas" },
    { key: "ACTIVAS", label: "Activas" },
    { key: "VENCIDAS", label: "Vencidas" },
    { key: "FINALIZADAS", label: "Finalizadas" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera superior con el título "Reservas" y el avatar del usuario */}
      <Header name="Reservas" avatarUri={user?.avatarUrl} />

      <View style={styles.content}>
        {/* Título grande de la sección */}
        <Text style={[styles.title, { color: colors.text }]}>Mis reservas</Text>
        {/* Subtítulo explicativo */}
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Aquí verás tus alquileres activos, finalizados y vencidos.
        </Text>

        {/* Botoncitos tipo "pastilla" para filtrar la lista. El botón
            seleccionado se pinta con el color primario del tema. */}
        <View style={styles.filtersRow}>
          {filters.map((item) => {
            const selected = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.filterButton,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : colors.surface,
                  },
                ]}
                onPress={() => setFilter(item.key)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: selected ? colors.contrastText : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ruedita de "cargando…" mientras esperamos los datos */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : null}

        {/* Mensaje de error en rojo si la carga falló */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Cada reserva se muestra como una tarjeta (card) con:
            - Título del disco (o "Disco #ID" si Discogs no respondió)
            - Fecha de inicio y fecha de devolución
            - Pastillita de estado (PREPARADO / VENCIDO / FINALIZADO)
            - Aviso de "vencida" si aplica
            - Imagen de portada a la derecha (o placeholder si no hay)
            - Botón "Devolución" debajo de la imagen (si la reserva no
              está finalizada) */}
        <FlatList
          ref={listRef}
          data={filteredReservas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <RentalCard
              reservation={item}
              imageUrl={images[item.discogsId]}
              discogsTitle={titles[item.discogsId]}
              // Si no tenemos ni null ni string en images, es que aún no cargó info de Discogs.
              isLoadingDiscogs={images[item.discogsId] === undefined}
              onReturn={onReturnWrapper}
              colors={colors}
            />
          )}
          // Si la lista está vacía y no estamos cargando ni hay error,
          // mostramos un mensaje para que el usuario sepa que no tiene reservas.
          ListEmptyComponent={
            !loading && !error ? (
              <Text style={[styles.empty, { color: colors.muted }]}>
                Todavía no tienes reservas.
              </Text>
            ) : null
          }
        />
      </View>

      {/* Barra de navegación inferior con las pestañas de la app */}
      <BottomNav items={navItems} />
    </View>
  );
}

// Estilos para la pantalla de reservas. Usamos StyleSheet de React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 110,
    gap: 10,
  },
  empty: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
  },
});
