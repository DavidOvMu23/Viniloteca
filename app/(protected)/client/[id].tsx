// Este archivo define la pantalla de detalle de un cliente, que se muestra
// cuando el usuario navega a la ruta /client/[id]. Aquí usamos el hook
// personalizado useClientDetail para cargar los datos del cliente, sus pedidos,
// y manejar las acciones de editar o eliminar. También definimos la estructura
// visual de la pantalla: cabecera, tarjetas de información, lista de pedidos,
// y barra de navegación inferior.

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
//  Header componente de cabecera reutilizable.
import Header from "src/components/Header/header";
//  BottomNav barra de navegación inferior.
import BottomNav from "src/components/BottomNav/bottom_nav";
//  CustomButton botones reutilizables para editar/eliminar.
import CustomButton from "src/components/Buttons/button";
//  useClientDetail hook que obtiene datos del cliente y sus pedidos.
import useClientDetail from "src/hooks/useClientDetail";
//  useThemePreference para obtener colores según tema.
import { useThemePreference } from "src/providers/ThemeProvider";

// Componente AvatarDisplay: muestra la imagen del cliente o una inicial si no hay imagen.
function AvatarDisplay({ client }: { client: any }) {
  const [errored, setErrored] = useState(false);

  const { colors } = useThemePreference();

  const initial = (client?.full_name ?? client?.email ?? "")
    .trim()
    .charAt(0)
    .toUpperCase();

  // Si no hay URL o hubo error, mostramos la inicial en un círculo
  if (!client?.avatar_url || errored) {
    return (
      <View
        style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.avatarInitial, { color: colors.text }]}>
          {initial || "U"}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: client.avatar_url }}
      style={styles.avatar}
      onError={() => setErrored(true)}
    />
  );
}

// Componente principal de la pantalla de detalle de cliente
export default function ClientDetail() {
  const {
    client,
    loading,
    isError,
    error,
    pedidosCliente,
    titleMap,
    navItems,
    handleEdit,
    handleDelete,
    canDelete,
  } = useClientDetail();

  // Obtenemos los colores del tema para usarlos en los estilos dinámicos
  const { colors } = useThemePreference();

  if (loading) {
    return (
      // {/* Contenedor principal con color de fondo del tema */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Cabecera superior con título genérico */}
        <Header name="Cliente" />
        {/* Zona centrada con el mensaje de carga */}
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Cargando cliente...
          </Text>
        </View>
        {/* Barra de navegación inferior */}
        <BottomNav items={navItems} />
      </View>
    );
  }

  // Si hubo un error al cargar el cliente, mostramos un mensaje de error.
  if (isError) {
    return (
      // {/* Contenedor principal con color de fondo del tema */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Cabecera superior */}
        <Header name="Cliente" />
        {/* Zona centrada con mensaje de error */}
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No se pudo cargar el cliente
          </Text>
          {/* Si el error es un objeto Error mostramos su mensaje;
              si no, mostramos un texto genérico */}
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {error instanceof Error
              ? error.message
              : "Revisa la conexión y vuelve a intentarlo."}
          </Text>
        </View>
        {/* Barra de navegación inferior */}
        <BottomNav items={navItems} />
      </View>
    );
  }

  // Si el cliente no existe (por ejemplo, si el ID es incorrecto), mostramos un mensaje de "no encontrado".
  if (!client) {
    return (
      // {/* Contenedor principal */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Cabecera */}
        <Header name="Cliente" />
        {/* Zona centrada con mensaje de "no encontrado" */}
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Cliente no encontrado
          </Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Revisa la lista y vuelve a intentarlo.
          </Text>
        </View>
        {/* Barra inferior */}
        <BottomNav items={navItems} />
      </View>
    );
  }

  // Función para manejar la eliminación del cliente, con confirmación.
  return (
    // {/* Contenedor raíz de toda la pantalla */}
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera que muestra el nombre real del cliente */}
      <Header name={client.full_name?.trim() || "Cliente"} />

      {/* BARRA DE ACCIONES – Botones para editar o eliminar el cliente*/}
      <View style={styles.actionBar}>
        {/* Botón que navega a la pantalla de edición de este cliente */}
        <CustomButton text="Editar cliente" onPress={handleEdit} />

        {/* Pequeño espacio vertical entre los dos botones */}
        <View style={{ height: 10 }} />

        {/* Si el usuario tiene permisos de admin, mostramos el botón
            de eliminar; si no, mostramos un aviso explicativo */}
        {canDelete ? (
          <CustomButton text="Eliminar cliente" onPress={handleDelete} />
        ) : (
          <Text style={[styles.notice, { color: colors.muted }]}>
            Solo los administradores pueden eliminar.
          </Text>
        )}
      </View>

      {/*CONTENIDO DESPLAZABLE (ScrollView)
          Aquí va todo lo que el usuario puede recorrer arrastrando
          el dedo: la tarjeta de datos y la tarjeta de pedidos. */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TARJETA 1 – Datos básicos del cliente
          Muestra nombre, email, estado y tipo de usuario.*/}
        <View
          style={[
            styles.cardPrimary,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Título de la sección */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Datos del cliente
          </Text>

          {/* Línea horizontal separadora */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Contenedor principal de datos (Nombre/Email + Avatar) */}
          <View style={styles.dataContainer}>
            {/* Columna Izquierda: Información */}
            <View style={styles.infoColumn}>
              {/* Fila: Nombre del cliente */}
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.muted }]}>
                  Nombre
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {client.full_name?.trim() || "Cliente sin nombre"}
                </Text>
              </View>

              {/* Fila: Email del cliente */}
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.muted }]}>
                  Email
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {client.email ?? "Sin email"}
                </Text>
              </View>
            </View>

            {/* Columna Derecha: Avatar (solo si tiene) */}
            {/* Avatar: si la imagen falla o no existe, mostramos la inicial */}
            <AvatarDisplay client={client} />
          </View>

          {/* Fila de etiquetas (badges): Rol e ID numérico */}
          <View style={styles.badgeRow}>
            {/* Etiqueta de rol del usuario */}
            <View
              style={[
                styles.badge,
                client.role === "SUPERVISOR"
                  ? styles.roleBadgeSupervisor
                  : styles.roleBadgeNormal,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  client.role === "SUPERVISOR"
                    ? styles.roleBadgeTextSupervisor
                    : styles.roleBadgeTextNormal,
                  {
                    color:
                      client.role === "SUPERVISOR"
                        ? colors.contrastText
                        : "#111827",
                  },
                ]}
              >
                {client.role ?? "NORMAL"}
              </Text>
            </View>
            {/* Etiqueta gris con el identificador numérico del cliente */}
            <View style={[styles.badge, styles.badgeMuted]}>
              <Text style={styles.badgeText}>
                ID {truncateClientId(client.id)}
              </Text>
            </View>
          </View>
        </View>

        {/* TARJETA 2 – Últimos pedidos del cliente
                  ID {truncateClientId(client.id)}*/}
        <View
          style={[
            styles.cardSecondary,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Cabecera de la sección: título + cuántos pedidos hay */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Últimos pedidos
            </Text>
            <Text style={[styles.sectionHint, { color: colors.muted }]}>
              {pedidosCliente.length} en total
            </Text>
          </View>

          {/* Línea horizontal separadora */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Si no hay pedidos, mostramos un texto informativo.
              Si hay pedidos, los recorremos uno a uno con .map() */}
          {pedidosCliente.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Sin pedidos registrados.
            </Text>
          ) : (
            // -- Recorremos la lista de pedidos que nos dio el hook
            //    y por cada uno creamos una fila visual con:
            //      • Código del pedido (ej. "PED-0042")
            //      • Fechas de inicio y fin
            //      • Pastilla de color con el estado --
            pedidosCliente.map(function renderPedido(pedido) {
              return (
                // Cada fila necesita una "key" única para que React
                // sepa diferenciar cada elemento de la lista
                <View key={pedido.id} style={styles.pedidoRow}>
                  {/* Lado izquierdo: código y fechas */}
                  <View style={styles.pedidoLeft}>
                    {/* Mostrar el título si lo tenemos, si no mostrar el código */}
                    {(() => {
                      const m = String(pedido.codigo ?? "").match(/DISC-(\d+)/);
                      const discogsId = m ? Number(m[1]) : null;
                      const title =
                        discogsId && titleMap ? titleMap[discogsId] : null;
                      return (
                        <Text
                          style={[styles.pedidoCode, { color: colors.text }]}
                        >
                          {title ? title : pedido.codigo}
                        </Text>
                      );
                    })()}
                    <Text style={[styles.pedidoDates, { color: colors.muted }]}>
                      {pedido.fechaInicio} · {pedido.fechaFin}
                    </Text>
                  </View>
                  {/* Lado derecho: pastilla de estado con color dinámico */}
                  <View
                    style={[styles.statusPill, statusPillStyle(pedido.estado)]}
                  >
                    <Text style={[styles.statusText, { color: "#111827" }]}>
                      {pedido.estado}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Barra de navegación inferior fija */}
      <BottomNav items={navItems} />
    </View>
  );
}

// Dado el estado de un pedido (un texto como "ENTREGADO", "PREPARADO"…),
// devuelve los colores de fondo y borde de la "pastilla" para que cada
// estado se vea de un color diferente. Es como poner una pegatina de
// color en cada pedido: verde para entregado, azul para preparado, etc.
function truncateClientId(id: string, maxLength = 29) {
  if (id.length <= maxLength) return id;
  return `${id.slice(0, maxLength)}...`;
}
function statusPillStyle(estado: string) {
  // -- Usamos un switch/case para elegir el color según el texto del estado --
  switch (estado) {
    case "ENTREGADO":
      // Verde suave → el pedido ya llegó al cliente
      return { backgroundColor: "#d1fae5", borderColor: "#10b981" };
    case "PREPARADO":
      // Azul suave → el pedido está listo para enviar
      return { backgroundColor: "#e0f2fe", borderColor: "#0ea5e9" };
    case "PENDIENTE_REVISION":
      // Amarillo suave → el pedido necesita revisión
      return { backgroundColor: "#fef9c3", borderColor: "#f59e0b" };
    case "FINALIZADO":
      // Gris suave → el pedido está cerrado/archivado
      return { backgroundColor: "#f3f4f6", borderColor: "#9ca3af" };
    default:
      // Gris genérico → cualquier otro estado desconocido
      return { backgroundColor: "#e5e7eb", borderColor: "#9ca3af" };
  }
}

// Aquí definimos TODOS los estilos visuales de la pantalla.
// Es como una "hoja de estilo" donde describimos tamaños, colores,
// márgenes, bordes… que luego aplicamos a cada View/Text de arriba.

const styles = StyleSheet.create({
  // -- Contenedor raíz: ocupa toda la pantalla --
  container: {
    flex: 1, // Ocupa todo el espacio vertical disponible
  },

  // -- Barra de acciones (editar/eliminar): margen horizontal y superior --
  actionBar: {
    paddingHorizontal: 16, // Espacio a izquierda y derecha
    paddingTop: 12, // Espacio arriba
  },

  // -- Contenido del ScrollView: márgenes internos y separación entre cards --
  content: {
    padding: 16, // Espacio interior en los 4 lados
    paddingBottom: 120, // Espacio extra abajo para que no tape la barra inferior
    gap: 14, // Separación vertical entre las tarjetas
  },

  // -- Tarjeta principal (datos del cliente): con sombra y borde redondeado --
  cardPrimary: {
    borderRadius: 16, // Esquinas redondeadas
    padding: 16, // Espacio interior
    borderWidth: 1, // Borde fino alrededor
    shadowColor: "#000", // Color de la sombra (negro)
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.05, // Opacidad muy baja → sombra sutil
    shadowRadius: 6, // Radio de difuminado de la sombra
    elevation: 3, // Sombra en Android (iOS usa shadow*)
  },

  // -- Tarjeta secundaria (pedidos): más sencilla, sin sombra --
  cardSecondary: {
    borderRadius: 16, // Esquinas redondeadas
    padding: 16, // Espacio interior
    borderWidth: 1, // Borde fino
  },

  // -- Título de cada sección ("Datos del cliente", "Últimos pedidos") --
  sectionTitle: {
    fontSize: 16, // Tamaño del texto
    fontWeight: "700", // Negrita
    color: "#111827", // Gris muy oscuro (casi negro)
  },

  // -- Texto pequeño de pista (ej. "3 en total") --
  sectionHint: {
    fontSize: 12, // Texto pequeño
    color: "#6b7280", // Gris medio
  },

  // -- Cabecera de sección: título a la izquierda, pista a la derecha --
  sectionHeader: {
    flexDirection: "row", // Elementos en fila horizontal
    alignItems: "center", // Centrados verticalmente
    justifyContent: "space-between", // Uno a cada extremo
  },

  // -- Línea horizontal separadora entre secciones --
  divider: {
    height: 1, // 1 píxel de alto
    backgroundColor: "#e5e7eb", // Gris claro
    marginVertical: 12, // Espacio arriba y abajo
  },

  // -- Fila genérica (nombre, email, etc.) --
  row: {
    marginBottom: 10, // Espacio debajo de cada fila
  },

  // -- Etiqueta pequeña encima del valor (ej. "Nombre", "Email") --
  label: {
    fontSize: 12, // Pequeño
    color: "#6b7280", // Gris medio
    marginBottom: 2, // Pegado al valor de abajo
  },

  // -- Valor del dato (ej. "Juan García", "juan@mail.com") --
  value: {
    fontSize: 15, // Un poco más grande que la etiqueta
    color: "#111827", // Casi negro
    fontWeight: "600", // Semi-negrita
  },

  // -- Fila de etiquetas/badges (Activo, ID) --
  badgeRow: {
    flexDirection: "row", // En fila horizontal
    gap: 8, // Separación entre badges
    marginTop: 4, // Pequeño espacio arriba
  },

  // -- Estilo base de cada badge/etiqueta --
  badge: {
    paddingHorizontal: 10, // Espacio a los lados
    paddingVertical: 6, // Espacio arriba y abajo
    borderRadius: 999, // Totalmente redondeado (forma de "pildora")
    borderWidth: 1, // Borde fino
  },

  // -- Badge gris (ID del cliente) --
  badgeMuted: {
    backgroundColor: "#f3f4f6", // Fondo gris claro
    borderColor: "#d1d5db", // Borde gris
  },

  // -- Texto dentro de un badge --
  badgeText: {
    fontSize: 12, // Pequeño
    color: "#111827", // Casi negro
    fontWeight: "600", // Semi-negrita
  },

  roleBadgeSupervisor: {
    backgroundColor: "#f87171",
    borderColor: "#f87171",
  },
  roleBadgeNormal: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  roleBadgeTextSupervisor: {
    color: "#ffffff",
  },
  roleBadgeTextNormal: {
    color: "#111827",
  },

  // -- Fila de un pedido individual --
  pedidoRow: {
    flexDirection: "row", // Horizontal
    alignItems: "center", // Centrado vertical
    justifyContent: "space-between", // Código a la izquierda, estado a la derecha
    paddingVertical: 8, // Espacio arriba/abajo
    gap: 10, // Separación entre los elementos
  },

  // -- Parte izquierda de la fila de pedido (código + fechas) --
  pedidoLeft: {
    flex: 1, // Ocupa todo el espacio que pueda (empuja la pastilla a la derecha)
  },

  // -- Código del pedido (ej. "PED-0042") --
  pedidoCode: {
    fontSize: 14, // Tamaño medio
    fontWeight: "700", // Negrita
    color: "#111827", // Casi negro
  },

  // -- Fechas del pedido (ej. "01/01/2025 · 15/01/2025") --
  pedidoDates: {
    fontSize: 12, // Pequeño
    color: "#6b7280", // Gris medio
    marginTop: 2, // Pegado al código de arriba
  },

  // -- Pastilla de estado (forma redondeada con borde) --
  statusPill: {
    borderWidth: 1, // Borde fino
    paddingHorizontal: 10, // Espacio horizontal
    paddingVertical: 6, // Espacio vertical
    borderRadius: 999, // Totalmente redondeado
  },

  // -- Texto dentro de la pastilla de estado --
  statusText: {
    fontSize: 12, // Pequeño
    fontWeight: "700", // Negrita
    color: "#111827", // Casi negro
  },

  // -- Contenedor de estado vacío (carga, error, no encontrado) --
  emptyState: {
    flex: 1, // Ocupa todo el espacio vertical
    alignItems: "center", // Centrado horizontal
    justifyContent: "center", // Centrado vertical
    padding: 24, // Espacio interior
  },

  // -- Título grande del estado vacío --
  emptyTitle: {
    fontSize: 18, // Grande
    fontWeight: "700", // Negrita
    color: "#111827", // Casi negro
  },

  // -- Texto descriptivo del estado vacío --
  emptyText: {
    fontSize: 14, // Medio
    color: "#6b7280", // Gris
    marginTop: 6, // Espacio respecto al título
  },

  // -- Aviso de "solo administradores" --
  notice: {
    textAlign: "center", // Texto centrado horizontalmente
    color: "#6b7280", // Gris medio
    fontSize: 13, // Tamaño medio-pequeño
  },
  // -- Contenedor horizontal para Info + Avatar --
  dataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  // -- Columna de texto (ocupa el espacio restante) --
  infoColumn: {
    flex: 1,
    marginRight: 16, // Separación con el avatar
  },

  // -- Avatar del cliente (imagen redonda a la derecha) --
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32, // Totalmente redondo
    backgroundColor: "#e5e7eb", // Fondo gris por si la imagen tiene transparencia o carga
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
});
