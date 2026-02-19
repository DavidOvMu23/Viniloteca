// este archivo maneja la consulta para obtener los pedidos de un cliente dado su ID.

import { useQuery } from "@tanstack/react-query";
import { getOrdersByClientId } from "src/services/orderService";
import { ordersByClientQueryKey } from "src/hooks/queries/queryKeys";

// esta función es un hook personalizado que utiliza React Query para obtener los pedidos de un cliente por su ID.
// Recibe el ID del cliente y una bandera "enabled" para controlar si la consulta se ejecuta o no.
// Devuelve el resultado de la consulta, incluyendo los datos, estados de carga y error, etc.
export function useOrdersByClientQuery(clientId: string, enabled = true) {
  //retornamos el resultado de useQuery, que es el hook de React Query para hacer consultas de datos.
  return useQuery({
    queryKey: ordersByClientQueryKey(clientId), // La clave única para esta consulta, que incluye el ID del cliente. Esto es importante para que React Query sepa qué datos cachear y cuándo invalidarlos.

    // La función que hace la consulta real. En este caso, llamamos a getOrdersByClientId con el ID del cliente para obtener sus pedidos.
    queryFn: function queryFn() {
      return getOrdersByClientId(clientId);
    },

    enabled, // La consulta solo se ejecutará si "enabled" es true. Esto es útil para evitar hacer la consulta antes de tener un ID válido.
  });
}
