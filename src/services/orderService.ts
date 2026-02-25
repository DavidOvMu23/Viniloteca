// Este archivo controla todo lo relacionado con los PEDIDOS/RESERVAS de alquiler de discos.
// Controla quién se lleva los discos, cuándo debe devolverlos y si tiene retraso.

import { supabase } from "../../supabase/supabaseClient";
import {
  type PedidoEstado,
  type Pedido,
  type RentalReservation,
  type OrderRow,
} from "src/types";

export const MAX_RENTAL_DAYS = 15; // Máximo días que puedes tener un disco (por que he querido poner un límite, como en una biblioteca)

//Funciones para convertir datos de la BD a objetos limpios que usamos en la app

// Convierte fecha "2023-10-05T14:30:00Z" a "2023-10-05"
function toDateLabel(isoString: string | null): string {
  if (!isoString) return "";
  return isoString.slice(0, 10); // Cortamos los primeros 10 caracteres
}

// Decide el estado del pedido basándose en las fechas
function resolveStatus(row: OrderRow): PedidoEstado {
  // 1. Si ya tiene fecha de devolución -> FINALIZADO
  if (row.returned_at) {
    return "FINALIZADO";
  }

  // 2. Si tiene fecha límite...
  if (row.due_at) {
    const fechaLimite = new Date(row.due_at).getTime();
    const ahora = Date.now();

    // ...y esa fecha ya pasó -> VENCIDO (Llegas tarde)
    if (fechaLimite < ahora) {
      return "VENCIDO";
    }
  }

  // 3. Si no, está en curso -> PREPARADO
  return "PREPARADO";
}

// Mapeador para Pedido
function mapOrder(row: OrderRow): Pedido {
  return {
    id: row.id,
    clienteId: row.user_id,
    codigo: `DISC-${row.discogs_id}`,
    fechaInicio: toDateLabel(row.rented_at),
    fechaFin: toDateLabel(row.due_at),
    estado: resolveStatus(row),
  };
}

// Mapeador para Pedido con mas detalles
function mapReservation(row: OrderRow): RentalReservation {
  return {
    id: row.id,
    discogsId: row.discogs_id,
    userId: row.user_id,
    operatorId: row.operator_id,
    rentedAt: row.rented_at,
    dueAt: row.due_at || row.rented_at,
    returnedAt: row.returned_at,
    createdAt: row.created_at,
    status: resolveStatus(row),
    returnedLate:
      !!row.returned_at && !!row.due_at
        ? new Date(row.returned_at).getTime() > new Date(row.due_at).getTime()
        : false,
  };
}

// Funciones principales que exportamos para usar en la app

//Crear una nueva reserva de alquiler
export async function createReservation(input: {
  discogsId: number;
  userId: string;
  rentedAt: string; // Fecha ISO
  dueAt: string; // Fecha ISO
  operatorId?: string;
}): Promise<RentalReservation> {
  // 1. Validaciones básicas de fechas
  const inicio = new Date(input.rentedAt).getTime();
  const fin = new Date(input.dueAt).getTime();

  if (fin < inicio) {
    throw new Error("La fecha de devolución no puede ser anterior al inicio.");
  }

  // Si el alquiler es demasiado largo, también lo rechazamos
  const diasDiferencia = (fin - inicio) / (1000 * 60 * 60 * 24);
  if (diasDiferencia > MAX_RENTAL_DAYS) {
    throw new Error(`No puedes alquilar por más de ${MAX_RENTAL_DAYS} días.`);
  }

  // 2. Inserción en BD
  const respuesta = await supabase
    .from("rentals")
    .insert({
      discogs_id: input.discogsId,
      user_id: input.userId,
      operator_id: input.operatorId ?? null,
      rented_at: input.rentedAt,
      due_at: input.dueAt,
    })
    .select()
    .single();

  if (respuesta.error) {
    throw new Error("Error al crear la reserva: " + respuesta.error.message);
  }

  return mapReservation(respuesta.data);
}

// Obtener todos los pedidos de un cliente por su ID
export async function getOrdersByClientId(clientId: string): Promise<Pedido[]> {
  const respuesta = await supabase
    .from("rentals")
    .select("*")
    .eq("user_id", clientId)
    .order("rented_at", { ascending: false }); // Los más nuevos primero

  if (respuesta.error) {
    throw new Error("Error obteniendo pedidos.");
  }

  // Convertimos las filas crudas a Pedidos
  return respuesta.data.map(mapOrder);
}

// Obtener todas las reservas de un cliente por su ID (con más detalles)
export async function getReservationsByUserId(
  userId: string,
): Promise<RentalReservation[]> {
  const respuesta = await supabase
    .from("rentals")
    .select("*")
    .eq("user_id", userId)
    .order("rented_at", { ascending: false });

  if (respuesta.error) {
    throw new Error("Error obteniendo tus reservas.");
  }

  return respuesta.data.map(mapReservation);
}

// Marcar una reserva como devuelta (actualiza la fecha de devolución)
export async function markReservationAsReturned(
  reservationId: string,
): Promise<RentalReservation> {
  const respuesta = await supabase
    .from("rentals")
    .update({
      returned_at: new Date().toISOString(), // Fecha/hora actual
    })
    .eq("id", reservationId)
    .select()
    .single();

  if (respuesta.error) {
    throw new Error("No se pudo devolver el disco.");
  }

  return mapReservation(respuesta.data);
}
