// este archivo contiene el componente de la pantalla para crear una nueva reserva de alquiler. El usuario llega aquí desde la pantalla de Discos, eligiendo un disco para alquilar. En esta pantalla se muestra la información del disco elegido y un formulario para seleccionar la fecha de devolución. Al enviar el formulario, se guarda la reserva en Supabase y se vuelve a la lista de reservas.

import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TextInput } from "react-native-paper";
import Header from "src/components/Header/header";
import BottomNav from "src/components/BottomNav/bottom_nav";
import { type BottomNavItem } from "src/types";
import CustomButton from "src/components/Buttons/button";
import { useThemePreference } from "src/providers/ThemeProvider";
import { useUserStore } from "src/stores/userStore";
// createReservation para insertar la reserva en el servicio/DB.
// MAX_RENTAL_DAYS constante usada para validar la duración máxima.
import { createReservation, MAX_RENTAL_DAYS } from "src/services/orderService";

//esta función convierte un objeto Date a un string con formato "AAAA-MM-DD", que es el formato que espera el campo de fecha en el formulario. Por ejemplo, si le pasamos new Date(2025, 2, 15) (15 de marzo de 2025), devolverá "2025-03-15". Esto nos ayuda a inicializar los campos de fecha con valores legibles y compatibles con el input.
function toDateInputValue(value: Date): string {
  return value.toISOString().slice(0, 10);
}

// esta función suma un número de días a una fecha dada y devuelve la nueva fecha. Por ejemplo, si le pasamos new Date(2025, 2, 15) y 7, devolverá new Date(2025, 2, 22). Esto nos ayuda a calcular la fecha de devolución predeterminada (hoy + 7 días) y la fecha máxima permitida (hoy + MAX_RENTAL_DAYS).
function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

// esta función intenta convertir un string con formato "AAAA-MM-DD" a un objeto Date. Si el formato no es correcto o la fecha no existe, devuelve null. Esto nos ayuda a validar y parsear las fechas que el usuario escribe en el formulario antes de guardarlas.
function parseDateInput(value: string): Date | null {
  const clean = value.trim();
  // Comprobamos que el formato sea exactamente AAAA-MM-DD con regex.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return null;

  const parsed = new Date(`${clean}T12:00:00.000Z`);
  // Si el resultado no es un número válido, la fecha no existe.
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

// El componente principal de la pantalla de nueva reserva. Aquí el usuario ve la información del disco que eligió y completa el formulario para crear la reserva.
export default function NewReservation() {
  // router: nos permitirá volver a la lista de reservas tras guardar.
  const router = useRouter();

  // Leemos el ID del disco, su título y su artista, que vienen
  // como parámetros cuando el usuario navegó desde la pantalla de Discos.
  const params = useLocalSearchParams<{
    discogsId?: string;
    title?: string;
    artist?: string;
  }>();

  const user = useUserStore((state) => state.user);

  const { colors } = useThemePreference();

  // today: la fecha de hoy, memorizada para que no cambie si
  // se redibuja el componente durante la misma sesión.
  const today = useMemo(() => new Date(), []);

  // rentedAt: fecha de inicio del alquiler (texto "AAAA-MM-DD").
  // Se inicializa con hoy.
  const [rentedAt, setRentedAt] = useState(toDateInputValue(today));

  // dueAt: fecha de devolución (texto "AAAA-MM-DD").
  // Se inicializa con hoy + 7 días (una semana predeterminada).
  const [dueAt, setDueAt] = useState(toDateInputValue(addDays(today, 7)));

  // saving: indica si estamos guardando la reserva en Supabase.
  // Mientras es true, el botón muestra "Guardando..." y se desactiva
  // para evitar envíos duplicados.
  const [saving, setSaving] = useState(false);

  // Calculamos la fecha límite: hoy + MAX_RENTAL_DAYS (15 días).
  // Si el usuario intenta poner una fecha posterior, la corregimos.
  const maxDueDate = useMemo(() => addDays(today, MAX_RENTAL_DAYS), [today]);
  const maxDueStr = useMemo(() => toDateInputValue(maxDueDate), [maxDueDate]);

  // Dejamos que escriba libremente, pero si la fecha resultante no
  // cumple las reglas, le avisamos con una alerta y la ajustamos.
  const handleDueChange = (text: string) => {
    // Guardamos lo que el usuario escribe (incluso si aún no es válido).
    setDueAt(text);

    // Intentamos parsear como fecha válida.
    const parsed = parseDateInput(text);
    // Si todavía no es una fecha completa, dejamos que siga escribiendo.
    if (!parsed) return;

    // Comprobamos si la fecha está en el pasado.
    const msRange = parsed.getTime() - today.getTime();
    if (msRange < 0) {
      Alert.alert(
        "Fecha inválida",
        "La fecha de devolución no puede ser anterior a hoy.",
      );
      // Corregimos a hoy.
      setDueAt(toDateInputValue(today));
      return;
    }

    // Comprobamos si supera el máximo de días permitido.
    const maxMs = MAX_RENTAL_DAYS * 24 * 60 * 60 * 1000;
    if (msRange > maxMs) {
      Alert.alert(
        "Límite superado",
        `La devolución máxima es ${MAX_RENTAL_DAYS} días; se ajusta a ${maxDueStr}`,
      );
      // Corregimos a la fecha máxima.
      setDueAt(maxDueStr);
      return;
    }
  };

  // Convertimos el discogsId de texto a número y comprobamos que sea válido.
  const discogsId = Number(params.discogsId);
  const hasValidDiscogsId = Number.isFinite(discogsId) && discogsId > 0;

  // ¿Es el usuario un supervisor (administrador)?
  const isAdmin = user?.roleName === "SUPERVISOR";

  // Igual que en las demás pantallas: "Clientes" solo aparece para admins.
  const navItems = useMemo<BottomNavItem[]>(() => {
    const items: BottomNavItem[] = [
      { icon: "calendar-outline", label: "Reservas", href: "/reservas" },
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

  // Función que se llama al pulsar el botón "Crear reserva". Valida los datos y guarda en Supabase.
  const handleSave = async () => {
    // 1. Si ya estamos guardando, no hacemos nada (evita envíos dobles).
    if (saving) return;

    // 2. ¿Hay usuario logueado?
    if (!user?.id) {
      Alert.alert(
        "Sin sesión",
        "Necesitas iniciar sesión para crear una reserva.",
      );
      return;
    }

    // 3. ¿El disco tiene un ID válido?
    if (!hasValidDiscogsId) {
      Alert.alert(
        "Disco inválido",
        "No se pudo identificar el disco seleccionado.",
      );
      return;
    }

    // 4. Parseamos las fechas de texto a objetos Date.
    const rentedDate = parseDateInput(rentedAt);
    const dueDate = parseDateInput(dueAt);

    if (!rentedDate || !dueDate) {
      Alert.alert("Fechas inválidas", "Usa el formato de fecha AAAA-MM-DD.");
      return;
    }

    // 4b. Comprobamos que la devolución no sea anterior al inicio.
    const msRange = dueDate.getTime() - rentedDate.getTime();
    if (msRange < 0) {
      Alert.alert(
        "Rango inválido",
        "La fecha de devolución no puede ser anterior a la fecha de inicio.",
      );
      return;
    }

    // 4c. Comprobamos que no supere el máximo de días.
    const maxMs = MAX_RENTAL_DAYS * 24 * 60 * 60 * 1000;
    if (msRange > maxMs) {
      Alert.alert(
        "Límite superado",
        `La reserva solo puede durar un máximo de ${MAX_RENTAL_DAYS} días.`,
      );
      return;
    }

    // 5. Todo validado → guardamos en Supabase.
    try {
      setSaving(true);

      await createReservation({
        discogsId,
        userId: user.id,
        // Si el usuario es admin, se registra como operador.
        operatorId: isAdmin ? user.id : undefined,
        rentedAt: rentedDate.toISOString(),
        dueAt: dueDate.toISOString(),
      });

      // 6. Mostramos confirmación y volvemos a la lista de reservas.
      Alert.alert("Reserva creada", "La reserva se guardó correctamente.");
      router.replace("/reservas");
    } catch (error) {
      // Si algo falla, mostramos el mensaje de error.
      Alert.alert(
        "No se pudo reservar",
        error instanceof Error
          ? error.message
          : "No se pudo guardar la reserva.",
      );
    } finally {
      // Quitamos el indicador de "guardando" pase lo que pase.
      setSaving(false);
    }
  };

  //retornamos el JSX que define la interfaz de la pantalla. Incluye un header, un formulario con la información del disco y los campos de fecha, y un botón para crear la reserva. También incluye la barra de navegación inferior.
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera superior con el título "Nueva reserva" */}
      <Header name="Nueva reserva" />

      {/* ScrollView envuelve el contenido para que sea desplazable */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Título principal de la pantalla */}
        <Text style={[styles.title, { color: colors.text }]}>
          Reserva de disco
        </Text>
        {/* Subtítulo con instrucciones */}
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Completa el formulario para crear el alquiler.
        </Text>

        {/* Muestra el título, artista e ID del disco que el usuario
            eligió en la pantalla de búsqueda (Discos). */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.text }]}>
            Disco seleccionado
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {params.title?.trim() || "Disco sin título"}
          </Text>
          <Text style={[styles.detail, { color: colors.muted }]}>
            {params.artist?.trim() || "Artista no disponible"}
          </Text>
          <Text style={[styles.detail, { color: colors.muted }]}>
            Discogs ID: {hasValidDiscogsId ? discogsId : "—"}
          </Text>
        </View>

        {/* Está deshabilitado (disabled) porque la fecha de inicio
            siempre es hoy. Solo informativo, no editable. */}
        <TextInput
          mode="outlined"
          label="Fecha de inicio"
          value={rentedAt}
          disabled={true}
          placeholder="AAAA-MM-DD"
          outlineStyle={{ borderRadius: 12 }}
          style={[
            styles.input,
            { backgroundColor: colors.surface, opacity: 0.7 },
          ]}
        />

        {/* Editable: el usuario puede cambiar la fecha dentro de los
            límites permitidos (no pasado, no > MAX_RENTAL_DAYS). */}
        <TextInput
          mode="outlined"
          label={`Fecha de devolución (máx ${MAX_RENTAL_DAYS} días)`}
          value={dueAt}
          onChangeText={handleDueChange}
          placeholder="AAAA-MM-DD"
          outlineStyle={{ borderRadius: 12 }}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />

        {/* Pista informativa sobre el límite de días */}
        <Text style={[styles.hint, { color: colors.muted }]}>
          La reserva permite un máximo de {MAX_RENTAL_DAYS} días.
        </Text>

        {/* Mientras guarda muestra "Guardando..." y se desactiva
            para evitar envíos dobles. */}
        <CustomButton
          text={saving ? "Guardando..." : "Crear reserva"}
          onPress={handleSave}
          disabled={saving}
        />
      </ScrollView>

      {/* Barra de navegación inferior */}
      <BottomNav items={navItems} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal: ocupa toda la pantalla
  container: {
    flex: 1,
  },
  // Contenido del ScrollView: margen interior y espacio entre elementos
  content: {
    padding: 16,
    paddingBottom: 120, // espacio extra para que la barra inferior no tape
    gap: 10, // separación entre hijos
  },
  // Título grande "Reserva de disco"
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  // Subtítulo descriptivo
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  // Tarjeta que muestra la información del disco seleccionado
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  // Etiqueta pequeña en mayúsculas ("DISCO SELECCIONADO")
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  // Valor principal (nombre del disco, en negrita y más grande)
  value: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Detalle secundario (artista, Discogs ID)
  detail: {
    fontSize: 13,
  },
  // Campos de texto (fechas)
  input: {
    marginTop: 4,
  },
  // Texto de pista informativa
  hint: {
    fontSize: 12,
    marginTop: 2,
  },
});
