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
// (Se eliminó el tipo `Rentals` porque no se referenciaba en el código)

// Tipos para usuario / sesión
export type RoleName = "SUPERVISOR" | "NORMAL";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  roleName?: RoleName;
  avatarUrl?: string;
};

// Tipos para pedidos / reservas
export type PedidoEstado = "PREPARADO" | "FINALIZADO" | "VENCIDO";

export type Pedido = {
  id: string;
  clienteId: string;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: PedidoEstado;
};

export type RentalReservation = {
  id: string;
  discogsId: number;
  userId: string;
  operatorId: string | null;
  rentedAt: string;
  dueAt: string;
  returnedAt: string | null;
  createdAt: string;
  status: PedidoEstado;
  returnedLate: boolean;
};

// Tipos UI
export type BottomNavItem = {
  icon: any; // React icon name types vary by lib; keep broad here
  label: string;
  onPress?: () => void;
  active?: boolean;
  href?: string | object;
};

// Tipos relacionados con autenticación y UI global
export type AuthResult = {
  user: UserProfile;
};

export type SignUpResult = {};

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export type ThemeMode = "light" | "dark" | "system";

// Payloads y filas de BD usadas por servicios
export type UpdateUserNamePayload = {
  userId: string;
  fullName: string;
  fallbackEmail?: string;
};

export type UploadAvatarPayload = {
  userId: string;
  fileUri: string;
  fallbackEmail?: string;
  fallbackName?: string;
};

export type ClientRow = {
  id: string;
  full_name: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string | null;
};

export type OrderRow = {
  id: string;
  discogs_id: number;
  user_id: string;
  operator_id: string | null;
  rented_at: string;
  due_at: string | null;
  returned_at: string | null;
  created_at: string;
};

export type ExpoMessage = {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

// Tipos para el store de usuario
export type UserStoreState = {
  user: UserProfile | null;
};

export type UserStoreActions = {
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  clearUser: () => void;
};
