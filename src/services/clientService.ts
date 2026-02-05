import { supabase } from "supabase/supabaseClient";
import { type Cliente } from "src/types";

type ClientRow = {
  id: string;
  full_name: string | null;
};

function mapClient(row: ClientRow): Cliente {
  // Convertimos la fila de la BD al tipo usado por la app
  return {
    id: row.id,
    nombre: row.full_name ?? "",
    activo: true,
  };
}

export async function getClients(): Promise<Cliente[]> {
  // Pedimos los clientes ordenados por nombre
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  // Si hay error o no hay data, devolvemos un mensaje claro
  if (error || !data) {
    throw new Error("No se pudieron cargar los clientes.");
  }

  // Mapeamos filas de BD a objetos de la app
  return data.map(mapClient);
}

export async function getClientById(id: string): Promise<Cliente | null> {
  // Buscamos un cliente por id
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", id)
    .maybeSingle();

  // Si hay error, lo convertimos en un mensaje claro
  if (error) {
    throw new Error("No se pudo cargar el cliente.");
  }

  // Si no hay data, devolvemos null; si hay, mapeamos
  return data ? mapClient(data) : null;
}

export async function createClient(
  payload: Omit<Cliente, "id">,
): Promise<Cliente> {
  throw new Error(
    "Los clientes se crean mediante registro (auth). Usa la pantalla de registro.",
  );
}

export async function updateClient(
  id: string,
  updates: Partial<Cliente>,
): Promise<Cliente | null> {
  // Normalizamos el nombre para evitar espacios extra
  const safeName = updates.nombre?.trim();

  // Actualizamos el nombre del cliente
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: safeName ?? null,
    })
    .eq("id", id)
    .select("id, full_name")
    .single();

  // Si hay error, mostramos mensaje claro
  if (error) {
    throw new Error("No se pudo actualizar el cliente.");
  }

  // Devolvemos el cliente actualizado (o null si no hay data)
  return data ? mapClient(data) : null;
}

export async function deleteClient(id: string): Promise<boolean> {
  // Eliminamos el perfil del cliente por id
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) {
    throw new Error("No se pudo eliminar el cliente.");
  }
  return true;
}
