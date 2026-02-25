// Pantalla de Clientes: muestra la lista de clientes descargada del servidor
// y permite navegar a la ficha de cada cliente o crear uno nuevo (si el usuario es admin).

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput } from "react-native-paper";
//  Header componente reutilizable para la cabecera de la pantalla.
import Header from "src/components/Header/header";
//  CustomButton componente de botón reutilizable para cada cliente.
import CustomButton from "src/components/Buttons/button";
//  BottomNav componente que muestra la navegación inferior.
import BottomNav from "src/components/BottomNav/bottom_nav";
//  useClientList hook que contiene la lógica para obtener y filtrar la lista de clientes.
import useClientList from "src/hooks/useClientList";
//  useThemePreference para obtener colores del tema.
import { useThemePreference } from "src/providers/ThemeProvider";

// La función principal del componente Client. Aquí se maneja toda la lógica y se devuelve el JSX que describe cómo se ve la pantalla.
export default function Client() {
  const {
    items,
    filteredItems,
    searchName,
    handleSearchNameChange,
    isLoading,
    isError,
    error,
    navItems,
    handleOpenClient,
    handleCreate,
    canCreate,
  } = useClientList();

  // Obtenemos los colores del tema para aplicar el fondo correcto
  const { colors } = useThemePreference();

  // Lo que se ve en pantalla
  return (
    // Contenedor principal: ocupa toda la pantalla y usa el color de fondo del tema
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera superior con el título "Clientes" */}
      <Header name="Clientes" />

      <View style={styles.searchWrap}>
        <TextInput
          mode="outlined"
          value={searchName}
          onChangeText={handleSearchNameChange}
          placeholder="Buscar cliente por nombre"
          outlineStyle={styles.searchOutline}
          style={[styles.searchInput, { backgroundColor: colors.surface }]}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      {/* Zona con scroll donde aparecen los botones de cada cliente */}
      <ScrollView contentContainerStyle={styles.list}>
        {/* Si todavía se están cargando los datos, mostramos un mensaje */}
        {isLoading ? (
          <Text style={styles.emptyText}>Cargando clientes...</Text>
        ) : /* Si hubo un error al cargar, mostramos el mensaje de error */
        isError ? (
          <Text style={styles.emptyText}>
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar los clientes."}
          </Text>
        ) : /* Si la lista está vacía, avisamos al usuario */
        items.length === 0 ? (
          <Text style={styles.emptyText}>No hay clientes todavía.</Text>
        ) : filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>No hay clientes con ese nombre.</Text>
        ) : (
          // Recorremos la lista y creamos un botón por cada cliente.
          // Al pulsar un botón se abre la ficha de ese cliente.
          filteredItems.map(function renderClient(c) {
            return (
              <View key={c.id}>
                {/* Botón con el nombre del cliente */}
                <CustomButton
                  text={c.full_name?.trim() || "Cliente sin nombre"}
                  onPress={function onPress() {
                    // Al pulsar, navegamos al detalle de este cliente
                    handleOpenClient(c.id);
                  }}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Aviso visible solo si el usuario NO es administrador */}
      {!canCreate ? (
        <Text style={styles.hint}>
          Solo los administradores pueden crear clientes.
        </Text>
      ) : null}

      {/* Barra de navegación inferior. Si el usuario es admin, se muestra
          un botón flotante (FAB) que permite crear un cliente nuevo */}
      <BottomNav items={navItems} />
    </View>
  );
}

// Aquí definimos cómo se ve cada parte de la pantalla, igual que elegir
// el color y tamaño de las letras en un documento de Word.
const styles = StyleSheet.create({
  // Contenedor principal de toda la pantalla
  container: {
    flex: 1, // Ocupa todo el alto disponible
    backgroundColor: "#fff", // Fondo blanco por defecto (el tema lo sobreescribe)
  },
  // Estilo del área con scroll donde van los botones de clientes
  list: {
    padding: 16, // Espacio interior de 16 píxeles en todos los lados
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    fontSize: 15,
  },
  searchOutline: {
    borderRadius: 12,
  },
  // Texto que se muestra cuando no hay clientes, está cargando o hay error
  emptyText: {
    fontSize: 14, // Tamaño de letra mediano
    color: "#6b7280", // Gris suave para que no distraiga
    marginTop: 8, // Pequeño espacio por arriba
  },
  // Texto de aviso para usuarios no administradores
  hint: {
    textAlign: "center", // Centrado horizontalmente
    marginBottom: 8, // Pequeño espacio por debajo
    color: "#6b7280", // Mismo gris suave
  },
});
