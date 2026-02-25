// Este hook le pide a la base de datos la lista completa de
// clientes y la guarda en memoria para no tener que pedirla
// cada vez que cambiamos de pantalla.

// useQuery para manejar caché y estado de la petición.
import { useQuery } from "@tanstack/react-query";
// getClients función del servicio que consulta la lista de clientes.
import { getClients } from "src/services/clientService";
// clientsQueryKey key para React Query.
import { clientsQueryKey } from "src/hooks/queries/queryKeys";

// esta funcion se encarga de pedir la lista de clientes al servidor y guardarla en memoria usando React Query.
// Es un hook personalizado que encapsula toda la lógica relacionada con la consulta de clientes, para mantener el código organizado y reutilizable.
export function useClientsQuery() {
  //retiramos la consulta usando useQuery de React Query, que se encarga de manejar la caché, la carga, los errores, etc. --- IGNORE ---
  return useQuery({
    queryKey: clientsQueryKey,
    queryFn: getClients,
  });
}
