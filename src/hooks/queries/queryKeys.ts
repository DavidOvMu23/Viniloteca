// Este archivo define las "etiquetas" que React Query usa para
// identificar cada tipo de datos en su caché.

export const clientsQueryKey = ["clients"] as const; // Etiqueta para la lista de clientes.

// este clientQueryKey es una función que devuelve la etiqueta para un cliente específico, dado su ID.
export const clientQueryKey = function clientQueryKey(id: string) {
  return ["clients", id] as const;
};

// Etiqueta para los pedidos de un cliente específico, dado su ID.
export const ordersByClientQueryKey = function ordersByClientQueryKey(
  clientId: string,
) {
  // Esta etiqueta se usa para identificar los pedidos de un cliente específico en la caché de React Query.
  return ["orders", "client", clientId] as const;
};
