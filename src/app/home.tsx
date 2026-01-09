import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "src/components/Header/header";

export default function Home() {
  return (
    <View style={styles.header}>
      <Header name="Usuario" />

      <View style={styles.content}>
        <Text style={styles.welcome}>Página Home (vacía por ahora)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    backgroundColor: "#d6cd1fff",
  },
  bottom_menu: {
    backgroundColor: "#1fd637ff",
  },
  welcome: {
    fontSize: 16,
  },
});
