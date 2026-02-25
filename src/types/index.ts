// Este archivo sirve para definir los tipos de datos que usamos en la aplicación.
// No es lo mismo que lo que tenemos en la base de datos, aqui simplemente establecemos
// los tipos de datos que van a tener los objetos que vamos a usar para que el codigo sea mas
// facil de usar y evitar errores

// Tipo para los clientes
// Lo uso en los siguientes archivos:
// - `src/services/clientService.ts`: para mapear filas de la base de datos a objetos Cliente que se usan en la app.
// - `src/hooks/useClientList.ts`, `src/hooks/useClientDetail.ts`, `src/hooks/useEditClient.ts`: para la lógica de la UI y consultas
// - `app/(protected)/client/[id].tsx`: para mostrar los detalles del cliente y sus pedidos
export type Cliente = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: "SUPERVISOR" | "NORMAL";
  created_at: string;
};

// Tipos para sesión / usuario
// Tipo para el nombre del rol
// Lo uso en:
// - `src/services/auth.ts`: normalización y checks de permisos.
// - Hooks/componentes que condicionan UI por rol.
export type RoleName = "SUPERVISOR" | "NORMAL";

// Perfil de usuario usado en contexto/auth y stores
// Lo uso en:
// - `src/providers/AuthProvider.tsx`: contexto de sesión.
// - `src/stores/userStore.ts`: estado global del usuario.
// - `src/services/auth.ts`, `src/services/profile.ts`: payloads y respuestas relacionadas con usuario.
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  roleName?: RoleName;
  avatarUrl?: string;
};

// Tipos para pedidos / reservas
// Estado de un pedido/reserva
// Lo uso en:
// - `src/services/orderService.ts`: mapeo y lógica de negocio.
// - Componentes que renderizan status (`src/components/RentalCard.tsx`, `app/(protected)/reservas.tsx`, `app/(protected)/client/[id].tsx`).
export type PedidoEstado = "PREPARADO" | "FINALIZADO" | "VENCIDO";

// Representación de un pedido en la app
// Lo uso en:
// - `src/services/orderService.ts`: representación devuelta por la capa de servicios.
// - Páginas y hooks que listan pedidos por cliente.
export type Pedido = {
  id: string;
  clienteId: string;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: PedidoEstado;
};

// Reserva/Alquiler (forma usada en UI)
// Lo uso en:
// - `src/services/orderService.ts`: mapeo desde `OrderRow`.
// - `src/components/RentalCard.tsx`: props para mostrar el alquiler.
// - `app/(protected)/reservas.tsx`: listado de reservas.
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
// Item para la barra inferior de navegación
// Lo uso en:
// - Hooks que construyen la navegación (`src/hooks/useHome.ts`, `src/hooks/useNewClient.ts`).
// - Componentes de navegación (`src/components/BottomNav/*`).
export type BottomNavItem = {
  icon: any; // iconos varían según la librería; se mantiene amplio
  label: string;
  onPress?: () => void;
  active?: boolean;
  href?: string | object;
};

// Autenticación y estado global
// Resultado tipado de login/refresh
// Lo uso en:
// - `src/services/auth.ts`: respuesta de login.
// - `src/hooks/useLogin.ts`, `src/providers/AuthProvider.tsx`: para establecer sesión.
export type AuthResult = {
  user: UserProfile;
};

// Resultado de registro (actualmente vacío, por si se amplía)
// Lo uso en:
// - `src/services/auth.ts`: respuesta de signup.
export type SignUpResult = {};

// Estado de autenticación expuesto por el provider
// Lo uso en:
// - `src/providers/AuthProvider.tsx` y hooks que protegen rutas.
export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

// Modo de tema
// Lo uso en:
// - `src/providers/ThemeProvider.tsx` y `app/(protected)/preferences.tsx` para elegir tema.
export type ThemeMode = "light" | "dark" | "system";

// Payloads y filas DB usadas por servicios
// Payload para actualizar nombre de usuario
// Lo uso en:
// - `src/services/profile.ts`: petición de actualización de nombre.
// - Hooks de edición de perfil.
export type UpdateUserNamePayload = {
  userId: string;
  fullName: string;
  fallbackEmail?: string;
};

// Payload para subir avatar
// Lo uso en:
// - `src/services/profile.ts`: subida y asociación del avatar al usuario.
export type UploadAvatarPayload = {
  userId: string;
  fileUri: string;
  fallbackEmail?: string;
  fallbackName?: string;
};

// Filas recibidas desde la DB (antes de mapear a `Cliente`)
// Lo uso en:
// - `src/services/clientService.ts`: mapeo desde la fila DB (`ClientRow` -> `Cliente`).
export type ClientRow = {
  id: string;
  full_name: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string | null;
};

// Filas de ordenes/alquileres desde la DB
// Lo uso en:
// - `src/services/orderService.ts`: transformación a `Pedido` o `RentalReservation`.
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

// Mensaje para Expo push
// Lo uso en:
// - `src/services/notifications.ts` y funciones de backend que envían notificaciones.
export type ExpoMessage = {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

// Tipos para el store de usuario (Zustand)
// Lo uso en:
// - `src/stores/userStore.ts`: estado y acciones del store.
export type UserStoreState = {
  user: UserProfile | null;
};

export type UserStoreActions = {
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  clearUser: () => void;
};
