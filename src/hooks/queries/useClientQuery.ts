// este Hook le pide a la base de datos los datos de UN solo
// cliente.

//  useQuery para manejar la petición y caché.
import { useQuery } from "@tanstack/react-query";
//  getClientById servicio que obtiene un cliente por su ID.
import { getClientById } from "src/services/clientService";
//  clientQueryKey key para identificar la query del cliente.
import { clientQueryKey } from "src/hooks/queries/queryKeys";

//esta funcion consulta a la base de datos por un cliente específico usando su ID.
export function useClientQuery(clientId: string, enabled = true) {
  //retorna una consulta con useQuery
  return useQuery({
    // La clave de la consulta es un array que identifica esta consulta de forma única. En este caso, usamos una función que genera la clave a partir del ID del cliente.
    queryKey: clientQueryKey(clientId),

    // La función que se ejecuta para obtener los datos. En este caso, llamamos a getClientById con el ID del cliente.
    queryFn: function queryFn() {
      return getClientById(clientId);
    },

    enabled, // Esta opción permite activar o desactivar la consulta. Si enabled es false, la consulta no se ejecutará. Esto es útil para evitar hacer consultas con IDs inválidos o vacíos.
  });
}
