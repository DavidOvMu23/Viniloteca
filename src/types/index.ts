// Este archivo sirve para definir los tipos de datos que usamos en la aplicación.
// No es lo mismo que lo que tenemos en la base de datos, aqui simplemente establecemos
// los tipos de datos que van a tener los objetos para así evitar errores

// Clientes
export type Cliente = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: "SUPERVISOR" | "NORMAL";
  created_at: string;
};

// Alquileres
export type Rentals = {
  id: string;
  discogs_id: string; // ID del disco (de la API de Discogs)
  user_id: string;

  // Esto al final no lo he usado por que me parecía un poco lioso implementarlo, entonces pues lo he dejado como opcional
  // Por que la idea era que un supervisor pudiera crear reservas en nombre de un cliente, entonces el operador_id sería el
  // supervisor que creó la reserva para identificarlo
  operator_id?: string;
  rented_at: string;
  due_at: string;
  returned_at?: string;
  created_at: string;
};
