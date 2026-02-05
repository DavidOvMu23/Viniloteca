import { useQuery } from "@tanstack/react-query";
import { getClients } from "src/services/clientService";
import { clientsQueryKey } from "src/hooks/queries/queryKeys";

export function useClientsQuery() {
  // Usamos React Query para cachear la lista de clientes
  return useQuery({
    queryKey: clientsQueryKey,
    queryFn: getClients,
  });
}
