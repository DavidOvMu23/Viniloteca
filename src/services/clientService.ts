// Este archivo es el encargado de gestionar los CLIENTES.
// Aquí tenemos funciones para obtener la lista de clientes, buscar uno por ID,
// actualizar su información o eliminarlo.

// Este servicio solo lo usaran los supervisores,
// Por que solo los supervisores pueden ver la lista de clientes y editar su información.

import { supabase } from "../../supabase/supabaseClient";
// sendNewClientNotification para notificar al crear un cliente nuevo.
import { sendNewClientNotification } from "./notifications";
// tipos que usaremos de types/index.ts
import { type Cliente, type ClientRow } from "src/types";

// Funcion para crar un avatar por defecto usando la primera letra del nombre
function buildDefaultAvatar(name: string) {
  const cleanName = name.trim(); //Limpiamos espacios

  let initial = "";
  if (cleanName.length > 0) {
    initial = cleanName[0]; // Cogemos la primera letra del nombre
  }

  // Construimos la URL mágica usando una herramienta llamada "ui-avatars" que genera avatares con letras
  return `https://ui-avatars.com/api/?background=E5E7EB&color=111827&size=256&name=${encodeURIComponent(
    initial,
  )}`;
}

// Función para normalizar el rol del cliente, asegurando que siempre sea "SUPERVISOR" o "NORMAL"
function normalizarRolCliente(rol: any): "SUPERVISOR" | "NORMAL" {
  // Si no es un texto, asumimos que es un usuario normal.
  if (typeof rol !== "string") {
    return "NORMAL";
  }

  // Convertimos a mayúsculas y quitamos espacios para comparar bien.
  const rolLimpio = rol.trim().toUpperCase();

  if (rolLimpio === "SUPERVISOR") {
    return "SUPERVISOR";
  } else {
    return "NORMAL";
  }
}

// Función para convertir una fila de la base de datos en un objeto Cliente limpio que usamos en la app
function traducirCliente(fila: ClientRow): Cliente {
  // Aseguramos que el nombre no sea null
  let nombreFinal = "";
  if (fila.full_name) {
    nombreFinal = fila.full_name;
  }

  // si el usuario tiene un avatar_url, lo usamos. Si no, lo dejamos como null por ahora.
  let avatarFinal = fila.avatar_url || null;

  if (avatarFinal && !avatarFinal.startsWith("http")) {
    // Pedimos la URL pública a Supabase Storage.
    const urlPublica = supabase.storage
      .from("avatars")
      .getPublicUrl(avatarFinal);
    avatarFinal = urlPublica.data.publicUrl;
  }

  // Si no tiene avatar generaremos una usando al función hecha arriba en la que generara un avatar
  // con la primera letra del nombre. Esto asegura que siempre haya una imagen, aunque el cliente no haya subido una.
  if (!avatarFinal) {
    avatarFinal = buildDefaultAvatar(nombreFinal);
  }

  return {
    id: fila.id,
    full_name: nombreFinal,
    email: fila.email,
    avatar_url: avatarFinal,
    role: normalizarRolCliente(fila.role),
    created_at: fila.created_at || undefined,
  };
}

// Funciones principales que exportamos para usar en la app

// Obtener la lista completa de clientes
export async function getClients(): Promise<Cliente[]> {
  // "order" sirve para ordenar alfabéticamente (A->Z)
  const respuesta = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role, created_at")
    .order("full_name", { ascending: true });

  // Si hubo error, lanzamos una alerta
  if (respuesta.error) {
    throw new Error("Error al cargar la lista de clientes.");
  }

  // Obtenemos los datos crudos de la respuesta
  const filas = respuesta.data;

  // Si no hay datos, devolvemos una lista vacía
  if (!filas) {
    return [];
  }

  // Convertimos cada fila cruda en un Cliente limpio usando ".map"
  // .map recorre la lista y aplica la función 'traducirCliente' a cada elemento.
  return filas.map(traducirCliente);
}

// Obtener un cliente específico por su ID
export async function getClientById(id: string): Promise<Cliente | null> {
  const respuesta = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role, created_at")
    .eq("id", id) // Filtrar por ID
    .maybeSingle();

  if (respuesta.error) {
    throw new Error("Error al buscar el cliente.");
  }

  // Si no existe, devolvemos null
  if (!respuesta.data) {
    return null;
  }

  // Si existe, lo traducimos y devolvemos
  return traducirCliente(respuesta.data);
}

// Actualizar la información de un cliente
export async function updateClient(
  id: string,
  updates: Partial<Cliente>,
): Promise<Cliente | null> {
  // Preparamos los datos para enviar a la base de datos
  // Solo enviamos lo que haya cambiado.
  const datosParaActualizar: any = {};

  if (updates.full_name !== undefined) {
    datosParaActualizar.full_name = updates.full_name.trim();
  }

  if (updates.email !== undefined) {
    // Si viene email, lo limpiamos. Si viene vacío, guardamos null.
    if (updates.email) {
      datosParaActualizar.email = updates.email.trim();
    } else {
      datosParaActualizar.email = null;
    }
  }

  // Guardar el rol si viene
  if (updates.role !== undefined) {
    datosParaActualizar.role = updates.role;
  }

  // Enviamos la actualización
  const respuesta = await supabase
    .from("profiles")
    .update(datosParaActualizar)
    .eq("id", id)
    .select() // Pedimos que nos devuelva el registro actualizado
    .single();

  if (respuesta.error) {
    throw new Error("No se pudo actualizar el cliente.");
  }

  if (!respuesta.data) {
    return null;
  }

  return traducirCliente(respuesta.data);
}

// Funcion para eliminar un cliente por su ID
export async function deleteClient(id: string): Promise<boolean> {
  const respuesta = await supabase.from("profiles").delete().eq("id", id);

  if (respuesta.error) {
    throw new Error("No se pudo eliminar el cliente. Puede que tenga deudas.");
  }

  return true;
}

// Crear un nuevo cliente en la tabla 'profiles'
export async function createClient(payload: {
  full_name: string;
  email?: string;
  avatar_url?: string | null;
}): Promise<Cliente> {
  const { full_name, email, avatar_url } = payload;

  const insertRes = await supabase
    .from("profiles")
    .insert({ full_name, email: email ?? null, avatar_url: avatar_url ?? null })
    .select()
    .single();

  if (insertRes.error || !insertRes.data) {
    throw new Error("No se pudo crear el cliente.");
  }

  // Enviamos notificación a todos los dispositivos (si hay tokens)
  try {
    // Seguir la implementación del profesor: llamar a la función local `sendNewClientNotification`
    // Nota: `sendNewClientNotification` ejecutada en un entorno server-side debe usar
    // una SERVICE ROLE KEY para poder leer todos los tokens. Si la app corre en el cliente,
    // asegúrate de desplegarla en un endpoint seguro.
    try {
      await sendNewClientNotification(full_name);
    } catch (err) {
      console.log(
        "sendNewClientNotification falló, intentando endpoint público:",
        err,
      );
      const publicEndpoint = process.env.EXPO_PUBLIC_SEND_NEW_CLIENT_URL;
      if (publicEndpoint) {
        try {
          await fetch(publicEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName: full_name }),
          });
        } catch (fetchErr) {
          console.log(
            "Error enviando notificación al endpoint público:",
            fetchErr,
          );
        }
      }
    }
  } catch (e) {
    // No bloqueamos la creación si falla el envío de notificaciones
    console.log("Error enviando notificaciones tras crear cliente:", e);
  }

  return traducirCliente(insertRes.data as ClientRow);
}
