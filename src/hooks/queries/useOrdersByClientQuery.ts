import { useQuery } from "@tanstack/react-query";
import { getOrdersByClientId } from "src/services/orderService";
import { ordersByClientQueryKey } from "src/hooks/queries/queryKeys";

export function useOrdersByClientQuery(clientId: string, enabled = true) {
  // Usamos React Query para cachear pedidos por cliente
  return useQuery({
    queryKey: ordersByClientQueryKey(clientId),
    queryFn: function queryFn() {
      return getOrdersByClientId(clientId);
    },
    enabled,
  });
}
