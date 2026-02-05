import { supabase } from "supabase/supabaseClient";
import { type Pedido } from "src/types";

type OrderRow = {
  id: string;
  discogs_id: number;
  user_id: string;
  rented_at: string;
  due_at: string | null;
  returned_at: string | null;
};

function toDateLabel(value: string | null): string {
  // Si no hay fecha, devolvemos vacío
  if (!value) return "";
  // Nos quedamos con YYYY-MM-DD
  return value.slice(0, 10);
}

function resolveStatus(row: OrderRow): Pedido["estado"] {
  // Si hay fecha de devolución, el pedido está finalizado
  if (row.returned_at) return "FINALIZADO";
  // Si no, queda como preparado
  return "PREPARADO";
}

function mapOrder(row: OrderRow): Pedido {
  // Convertimos la fila de BD en el tipo usado por la app
  return {
    id: row.id,
    clienteId: row.user_id,
    codigo: `DISC-${row.discogs_id}`,
    fechaInicio: toDateLabel(row.rented_at),
    fechaFin: toDateLabel(row.due_at),
    estado: resolveStatus(row),
  };
}

export async function getOrdersByClientId(clientId: string): Promise<Pedido[]> {
  // Pedimos los pedidos del cliente, ordenados por fecha
  const { data, error } = await supabase
    .from("rentals")
    .select("id, discogs_id, user_id, rented_at, due_at, returned_at")
    .eq("user_id", clientId)
    .order("rented_at", { ascending: false });

  // Si hay error o no hay data, lanzamos mensaje claro
  if (error || !data) {
    throw new Error("No se pudieron cargar los pedidos.");
  }

  // Mapeamos filas de BD a objetos de la app
  return data.map(mapOrder);
}
