import { supabase } from "../../supabase/supabaseClient";

type ExpoMessage = {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

// Envía un mensaje a todos los tokens Expo almacenados en la tabla `profiles`.
export async function sendNewClientNotification(fullName: string) {
  const title = "Nuevo cliente añadido";
  const body = `Se ha añadido ${fullName} a la lista de clientes.`;

  // Recuperar tokens mediante la función RPC `get_expo_push_tokens` (security definer)
  // para evitar problemas con RLS. La función debe existir en la base de datos.
  const rpcResp = await supabase.rpc("get_expo_push_tokens");

  if (rpcResp.error) {
    console.log(
      "Error al obtener tokens por RPC (get_expo_push_tokens):",
      rpcResp.error,
    );
    return;
  }

  if (!rpcResp.data) {
    console.log("No hay datos devueltos por get_expo_push_tokens.");
    return;
  }

  // rpcResp.data espera un array de objetos { expo_push_token: string }
  const tokens: string[] = (rpcResp.data as any[])
    .map((r) => (typeof r === "string" ? r : r.expo_push_token))
    .filter(Boolean);

  console.log(
    `sendNewClientNotification: tokens encontrados = ${tokens.length}`,
  );

  if (tokens.length === 0) return;

  // Expo recomienda enviar en batches; aquí hacemos batches de 100
  const chunkSize = 100;
  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize);
    const messages: ExpoMessage[] = chunk.map((t) => ({
      to: t,
      title,
      body,
      data: { type: "NEW_CLIENT", fullName },
    }));

    try {
      const expoResp = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages),
      });

      if (!expoResp.ok) {
        const text = await expoResp.text();
        console.log(`Expo push send returned status ${expoResp.status}:`, text);
      } else {
        const text = await expoResp.text();
        console.log(
          `Expo push send success chunk: ${chunk.length} messages. response:`,
          text,
        );
      }
    } catch (err) {
      console.log("Error enviando push a Expo:", err);
    }
  }
}

export default {};
