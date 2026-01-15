import React from "react";
import { Redirect } from "expo-router";

// Redirigimos al login nada más cargar la app
export default function Index() {
  // No mostramos nada, solo redirigimos al login
  return <Redirect href="/login" />;
}
