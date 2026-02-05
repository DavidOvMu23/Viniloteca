import { useQuery } from "@tanstack/react-query";
import { getClientById } from "src/services/clientService";
import { clientQueryKey } from "src/hooks/queries/queryKeys";

export function useClientQuery(clientId: string, enabled = true) {
  // Usamos React Query para cachear la petición por id
  return useQuery({
    queryKey: clientQueryKey(clientId),
    queryFn: function queryFn() {
      return getClientById(clientId);
    },
    enabled,
  });
}
